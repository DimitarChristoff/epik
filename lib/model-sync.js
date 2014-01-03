;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index','./model','./agent'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index'),
			require('./model'),
			require('./agent')
		);
	} else {
		this.epic.model.sync = factory(
			this.epic,
			this.epic.model,
			this.epic.agent
		);
	}
}).call(this, function(epic, model, agent){
	var primish = epic.primish,
		_ = epic._,
		syncPseudo = 'sync:',
		methodMap = {
			'create': 'post',
			'read': 'get',
			'update': 'put',
			// unsafe to call a method delete in IE7/8
			'delete_': 'delete'
		};

	return primish({

		extend: model,

		properties: primish.merge(model.prototype.properties, {
			urlRoot: {
				// normal convention - not in the model!
				set: function(value){
					this.urlRoot = value;
					delete this._attributes['urlRoot'];
				},
				get: function(){
					// make sure we return a sensible url.
					var base = this.urlRoot || this.options.urlRoot || 'no-urlRoot-set';
					base.charAt(base.length - 1) !== '/' && (base += '/');
					return base;
				}
			}
		}),

		options: {
			// can override Request constructor with a compatible MooTools Request
			request: agent.Request,

			headers: {
				'Content-Type':'application/json'
			}
		},

		constructor: function(obj, options){
			// needs to happen first before events are added,
			// in case we have custom accessors in the model object.
			this.setOptions(options);
			this._setupSync();

			model.prototype.constructor.call(this, obj, options);

			return this;
		},

		/**
		 * @description prepares the request object and binds some events
		 * @returns {model.sync} instance
		 * @private
		 */
		_setupSync: function(){
			var self = this;

			this.request = new this.options.request({
				url: this.get('urlRoot'),
				onFailure: function(response){
					self.trigger(syncPseudo + 'error', this.options.method, this.options.url, this.options.data);
					self.trigger('requestFailure', response.status, response.text);
				},
				onSuccess: function(response){
					self.postProcessor && (response.body = self.postProcessor(response.body));
					self.isNewModel = false;
					self.trigger('sync', response.body, self.request.options.method, self.request._data);
				}
			});

			this.options.headers && this.request.header(this.options.headers);

			// export crud methods to model.
			_.forIn(methodMap, function(requestMethod, protoMethod){
				self[protoMethod] = function(callback){
					this.sync(protoMethod, this.toJSON(), callback);
				};
			});

			return this;
		},

		/**
		 * @description low level API infront of the request instance, with no arguments or at least a method
		 * @param {String} [method] to call
		 * @param {Object} [model] optional plain object to send
		 * @param {Function} [callback] optional function to call when done, gets raw response object
		 * @returns {model.sync} instance
		 */
		sync: function(method, model, callback){
			var options = {},
				self = this,
				t;

			// fix mixed args. when method is there, model can be omitted and a cb can be arg[1]

			// method
			if (typeof method === 'string'){
				// determine what to call or do a read by default.
				method = method && methodMap[method] ? methodMap[method] : methodMap.read;
			}
			else {
				method = methodMap.read;
			}
			options.method = method;

			// optional model and optional callback
			t = typeof model;
			(t === 'function') && (callback = model);
			(t === 'undefined' || t === 'function') && (model = this.toJSON());

			this.request.data(undefined);

			// if it's a method via POST, also send the model
			if (method === methodMap.create || method === methodMap.update){
				// pre-processor of data support
				this.preProcessor && (model = this.preProcessor(model));
				this.request.data(model);
			}

			// make sure we have the right URL. if model has an id, append it
			options.url = this.get('urlRoot') + this.get('id');

			// append a trailing / if none found (no id yet)
			options.url.slice(-1) !== '/' && (options.url += '/');

			// since instance is reused, clear up a bit.
			delete this.request.options;

			// pass it all to the request
			this.request.setOptions(options).send(function(response){
				self.trigger(response.error ? 'failure' : 'success', response);
				callback && callback.call(self, response);
			});

			return this;
		},

		/**
		 * @description sets the data onto the model if it's an object. can be overridden.
		 * @param {agent.Response} response parsed XHR object
		 * @returns {model.sync} instance
		 * @private
		 */
		_setResponse: function(response){
			response.body && typeof response.body === 'object' && this.set(response.body);
			return this;
		},

		/**
		 * @description sugar that fetches a model via .read()
		 * @returns {model.sync} instance
		 */
		fetch: function(){
			this.read(function(response){
				if (!response.error){
					this.isNewModel = false;
					this._setResponse(response).trigger('fetch');
				}
			});

			return this;
		},

		/**
		 * @description sends the model via create/update or quietly sets keys->values and sends model
		 * @param {Object|String} key
		 * @param {*} [value] value when key is string
		 * @returns {model.sync} instance
		 */
		save: function(key, value){
			// saves model or accepts a key/value pair/object, sets to model and then saves.
			var method = ['update', 'create'][+this.isNew()];

			if (key){
				// if key is an object, go to overloadSetter.
				var ktype = typeof key,
					canSet = (ktype === 'object' && _.isObject(key)) || (ktype === 'string' && typeof value !== 'undefined');

				canSet && this._set.apply(this, arguments);
			}

			// create first time we sync, update after.
			this[method](function(response){
				if (!response.error){
					this.isNewModel = false;
					this._setResponse(response).trigger('save').trigger(method);
				}
			});

			return this;
		},

		/**
		 * @description determines if the model "is new" based upon the id property
		 * @returns {boolean}
		 */
		isNew: function(){
			if (typeof this.isNewModel === 'undefined'){
				this.isNewModel = !!this.get('id');
			}

			return this.isNewModel;
		}

		/**
		 * @description pre-save processor to modify the data before sending it to server
		 * @param {Object} model
		 * @returns model
		 */
		/*
		preProcessor: function(model){
			// apply a post-processor to response
			return model;
		},*/

		/**
		 * @description post-fetch processor to modify the data before setting it to models.
		 * @param {Object} model
		 * @returns model
		 */
		/*
		postProcessor: function(model){
			// apply a post-processor to response
			return model;
		}*/

	});

});

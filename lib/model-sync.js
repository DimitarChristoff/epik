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
			this.agent
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
			this.setupSync();

			model.prototype.constructor.call(this, obj, options);
		},

		setupSync: function(){
			var self = this;

			this.request = new this.options.request({
				url: this.get('urlRoot')
			});

			this.options.headers && this.request.header(this.options.headers);

			// setup some events
			this.on('failure', function(response){
				self.trigger(syncPseudo + 'error', this.options.method, this.options.url, this.options.data);
				self.trigger('requestFailure', response.status, response.text);
			});

			this.on('success', function(response){
				self.postProcessor && (response.body = self.postProcessor(response.body));
				self.isNewModel = false;
				self.trigger('sync', response, this.options.method, this.options.data);
			});

			// export crud methods to model.
			_.forIn(methodMap, function(requestMethod, protoMethod){
				self[protoMethod] = function(model, callback){
					this.sync(protoMethod, model, callback);
				};
			});

			return this;
		},

		sync: function(method, model){
			var options = {},
				self = this;

			// determine what to call or do a read by default.
			method = method && methodMap[method] ? methodMap[method] : methodMap.read;
			options.method = method;

			// if it's a method via POST, append passed object or use exported model
			if (method === methodMap.create || method === methodMap.update){
				options.data = model || this.toJSON();

				// pre-processor of data support
				this.preProcessor && (options.data = this.preProcessor(options.data));
			}

			// make sure we have the right URL. if model has an id, append it
			options.url = this.get('urlRoot') + this.get('id');

			// append a trailing / if none found (no id yet)
			options.url.slice(-1) !== '/' && (options.url += '/');

			// pass it all to the request
			this.request.setOptions(options);

			this.request.send(function(response){
				self.trigger(response.error ? 'failure' : 'success', response);
			});
		},

		_setResponse: function(response){
			response.body && typeof response.body === 'object' && this.set(response.body);
			return this;
		},

		fetch: function(){
			this.read(function(response){
				if (!response.error){
					this.isNewModel = false;
					this._setResponse(response).trigger('fetch');
				}
			});

			return this;
		},

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


		isNew: function(){
			if (typeof this.isNewModel === 'undefined'){
				this.isNewModel = !this.get('id');
			}

			return this.isNewModel;
		}


	});

});


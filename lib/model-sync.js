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
			'create': 'POST',
			'read': 'GET',
			'update': 'PUT',
			// unsafe to call a method delete in IE7/8
			'delete_': 'DELETE'
		};

	return primish({

		extend: model,

		properties: {
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
		},

		options: {
			// can override Request constructor with a compatible MooTools Request
			request: agent.Request,

			// by default, HTTP emulation is enabled for mootools request class.
			// assume native REST backend
			emulateREST: false,

			// if you prefer content-type to be application/json for POST / PUT, set to true
			useJSON: false

			// pass on custom request headers
			// , headers: {}
		},

		constructor: function(obj, options){
			// needs to happen first before events are added,
			// in case we have custom accessors in the model object.
			this.setOptions(options);
			this.setupSync();

			this.parent('constructor', obj, this.options);
		},

		setupSync: function(){
			var self = this,
				rid = 0,
				incrementRequestId = function(){
					// request ids are unique and private. private to up them.
					rid++;
				},
				obj = {};

			// public methods - next likely is current rid + 1
			this.getRequestId = function(){
				return rid + 1;
			};

			obj = {
				// one request at a time
				link: 'chain',
				url: this.get('urlRoot'),
				emulation: this.options.emulateREST,
				onRequest: incrementRequestId,
				onCancel: function(){
					this.removeEvents(syncPseudo + rid);
				},
				onSuccess: function(responseObj){
					responseObj = self.postProcessor && self.postProcessor(responseObj);
					// only becomes an existing model after a successful sync
					self.isNewModel = false;

					self.trigger(syncPseudo + rid, [responseObj]);
					self.trigger('sync', [responseObj, this.options.method, this.options.data]);
				},
				onFailure: function(){
					self.trigger(syncPseudo + 'error', [this.options.method, this.options.url, this.options.data]);
					self.trigger('requestFailure', [this.status, this.response.text]);
				},
			};

			if (this.options.headers){
				obj.headers = this.options.headers;
			}
			*/
			this.request = this.options.request;


			// export crud methods to model.
			_.forIn(methodMap, function(requestMethod, protoMethod){
				self[protoMethod] = function(model){
					this.sync(protoMethod, model);
				};
			});

			return this;
		},

		sync: function(){

		}


	});

});


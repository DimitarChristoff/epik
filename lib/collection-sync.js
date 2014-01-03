;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index', './collection', './agent'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index'),
			require('./collection'),
			require('./agent')
		);
	} else {
		this.epic.collection.sync = factory(
			this.epic,
			this.epic.collection,
			this.epic.agent
		);
	}

}).call(this, function(epic, collection, agent){
	var primish = epic.primish,
		_ = epic._;

	return primish({
		// allows for fetching collections of model from the server

		extend: collection,

		options: {
			urlRoot: 'no-urlRoot-set',
			request: agent.Request,
			headers: {
				'Content-Type':'application/json',
				'Accept': 'application/json,text/plain;q=0.2,text/html;q=0.1'
			}
		},

		initialize: function(models, options){
			this.setupSync();
			collection.prototype.constructor.call(this, models, options);
		},

		setupSync: function(){
			var self = this;

			this.request = new this.options.request({
				url: this.get('urlRoot')
			});


			this.options.headers && this.request.header(this.options.headers);

			// setup some events
			this.on('failure', function(response){
				self.trigger('sync:error', this.options.method, this.options.url, this.options.data);
				self.trigger('requestFailure', response.status, response.text);
			});

			this.on('success', function(response){
				self.postProcessor && (response.body = self.postProcessor(response.body));
				self.trigger('sync', response.body, self.request.options.method, self.request._data);
			});


			return this;
		},

		fetch: function(refresh, queryParams){
			this.request.data(queryParams);
			this.request.get(function(response){
				var models = response.body;
				if (!response.error){
					if (refresh){
						this.empty();
						_.forEach(models, this.addModel, this);
					}
					else {
						this.processModels(models);
					}

					// finally fire the event to instance
					this.trigger('fetch', models);
				}
			});

			// not promise!
			return this;
		},

		processModels: function(models){
			// deals with newly arrived objects which can either update existing models or be added as new models
			// `@models (array or objects)`, not actual model instances
			var self = this;

			_.forEach(models, function(model){
				var exists = model.id && self.getModelById(model.id);

				if (exists){
					exists.set(model);
				}
				else {
					self.addModel(model);
				}
			});
		},

		postProcessor: function(jsonResponse){
			// apply a post-processor to response
			return jsonResponse;
		}

	});
});
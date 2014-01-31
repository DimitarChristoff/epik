;(function(factory){
	if (typeof define == 'function' && define.amd){
		define('epik/collection-sync', ['./index', './collection', './agent'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index'),
			require('./collection'),
			require('./agent')
		);
	} else {
		this.epik.collection.sync = factory(
			this.epik,
			this.epik.collection,
			this.epik.agent
		);
	}

}).call(this, function(epik, collection, agent){
	var primish = epik.primish,
		_ = epik._;

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

		constructor: function(models, options){
			this._setupSync();
			this.parent('constructor', models, options);

			return this;
		},

		/**
		 * @description prepares the request object and binds some events
		 * @returns {collection.sync} instance
		 * @private
		 */
		_setupSync: function(){
			var self = this;

			this.request = new this.options.request({
				url: this.options.urlRoot,
				method: 'get',
				onFailure: function(response){
					self.trigger('sync:error', this.options.method, this.options.url, this.options.data);
					self.trigger('requestFailure', response.status, response.text);
				},
				onSuccess: function(response){
					self.postProcessor && (response.body = self.postProcessor(response.body));
					self.trigger('sync', response.body, self.request.options.method, self.request._data);
				}
			});

			this.options.headers && this.request.header(this.options.headers);

			return this;
		},

		/**
		 * @description Reads the collection from the endpoint and sets models
		 * @param {Boolean} [refresh] force replacement of models with identical ids
		 * @param {Object} [queryParams] optional arguments to send to urlRoot
		 * @returns {collection.sync} instance
		 */
		fetch: function(refresh, queryParams){
			var self = this;
			this.request.data(queryParams);
			this.request.send(function(response){
				var models = response.body;
				if (!response.error){
					if (refresh){
						self.empty();
						_.forEach(models, self.add, self);
					}
					else {
						self._processModels(models);
					}

					// finally fire the event to instance
					self.trigger('fetch', models);
				}
			});

			// not promise!
			return this;
		},

		/**
		 * @description deals with newly arrived objects, either update existing models or being added as new
		 * @param {Array} models
		 * @returns {collection.sync} instance
		 * @private
		 */
		_processModels: function(models){
			//
			// `@models (array or objects)`, not actual model instances
			var self = this;

			_.forEach(models, function(model){
				var exists = model.id && self.getModelById(model.id);

				if (exists){
					exists.set(model);
				}
				else {
					self.add(model);
				}
			});

			return this;
		},

		/**
		 * @description post-fetch processor to modify the data before setting it to models.
		 * @param {Array} jsonResponse
		 * @returns {Array}
		 */
		postProcessor: function(jsonResponse){
			// apply a post-processor to response
			return jsonResponse;
		}

	});
});
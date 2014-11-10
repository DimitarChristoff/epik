;(function(factory){
	if (typeof define == 'function' && define.amd){
		define('epik/collection', ['./index', './model', 'slicker'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index'),
			require('./model'),
			require('slicker')
		);
	} else {
		this.epik.collection = factory(
			this.epik,
			this.epik.model,
			this.slicker
		);
	}

}).call(this, function(epik, Model, slicker){
	var primish = epik.primish,
		options = epik.options,
		emitter = epik.emitter,
		_ = epik._,
		slice = epik.primish.slice;

	/**
	 * @class collection
	 * @constructor
	 */
	var collection = primish('collection', {

		implement: [emitter, options],

		// base model is just epik model
		model: Model,

		/**
		 * @constructs collection
		 * @param {Array=} models to set initially
		 * @param {Object=} options to set into instance
		 * @fires ready
		 * @returns {collection}
		 */
		constructor: function(models, options){
			this.setOptions(options);
			this._models = [];
			this._map = primish.hide(this, '_map', {});
			this.length = 0;
			models && this.set(models, true);

			// collections should have an id for storage
			this.id = this.options.id || _.uniqueId();

			return this.trigger('ready');
		},

		/**
		 * @description sets the model(s) into the collection, typically initially.
		 * @param {Array|Object} model(s)
		 * @param {Boolean} quiet to suppress events
		 * @fires set
		 * @returns {collection}
		 */
		set: function(models, quiet){
			var self = this,
				map = this._map;

			// empty models first, quietly.
			this.length && this.remove(this._models, true);

			_.isArray(models) || (models = [models]);
			_.forEach(models, function(model){
				var m = self.add(model, true);
				map[m.get('id')] = m;
			});

			quiet || this.trigger('set', this._models);

			return this;
		},

		/**
		 * @description adds a single model to the collection
		 * @param {Object|model} model to add
		 * @param {Boolean} replace existing model if id matches
		 * @returns {model}
		 */
		add: function(model, replace){
			// add a new model to collection
			var exists,
				self = this,
				map = this._map;

			// if it's just an object, make it a model first or make a model from defaults
			if ((_.isObject(model) && !(model instanceof this.model)) || (typeof model === 'undefined' && this.model.prototype.defaults)){
				model = model ? new this.model(model) : new this.model();
				if (model.validationFailed.length){
					return this.trigger('add:error', model, 'Validation failed');
				}
			}

			// assign a cid.
			model.cid = model.cid || model.get('id') || _.uniqueId('c');

			// already in the collection?
			exists = this.getModelByCID(model.cid);

			// if not asked to replace, bail out.
			if (exists && replace !== true)
				return this.trigger('add:error', model);

			// replace an existing model when requested
			exists && replace === true && (this._models[_.indexOf(this._models, model)] = model);

			// subscribe to all model events and bubble them locally.
			this.listenTo(model, function(event){
				var args = slice(arguments);
				args.splice(1, 0, model);
				self.trigger.apply(self, args);
				if (event === 'destroy'){
					self.remove(model, true);
				}
				else if (event === 'change:id'){
					// change, model, newvalue, oldvalue
					delete map[args[2]];
					map[args[1]] = model;
				}
			});

			this._models.push(model);

			_.indexOf(model._collections, this) === -1 && model._collections.push(this);

			this.length = this._models.length;

			// export model and cid added, fire reset.
			this.trigger('add', model, model.cid).trigger('reset', model, model.cid);

			return model;
		},

		/**
		 * @description removes a model from collection instance and stops observing it.
		 * @param {Array|Model} models
		 * @param {Boolean} quiet disables normal 'remove' and 'set' events
		 * @returns {collection}
		 */
		remove: function(models, quiet){
			// supports a single model or an array of models
			var self = this;

			_.isArray(models) || (models = [models]);

			_.forEachRight(models, function(model){
				model._collections.splice(_.indexOf(model._collections, self), 1);

				// remove from collection of managed models
				self._models.splice(_.indexOf(self._models, model), 1);
				self.stopListening(model);

				self.length = self._models.length;

				// let somebody know we lost some.
				quiet || self.trigger('remove', model, model.cid);
			});

			quiet || this.trigger('reset', models);

			return this;
		},

		/**
		 * @description Simple getter. Needed by storage mixin
		 * @param {String} prop to retrieve
		 * @returns {collection.prop}
		 */
		get: function(prop){
			// compat for storage
			return this[prop];
		},

		/**
		 * @description Gets a model by internal collection id
		 * @param {String} cid
		 * @returns {model}
		 */
		getModelByCID: function(cid){
			// return a model based upon a cid search
			var i = 0,
				m = this._models,
				len = m.length;

			for(; i < len; ++i)
				if (m[i].cid === cid) return m[i];

			return null;
		},

		/**
		 * @description Gets a model by public model id
		 * @param {String} id
		 * @returns {model|null}
		 */
		getModelById: function(id){
			// return a model based upon an id search
			var i = 0,
				m = this._models,
				len = m.length,
				idStr = 'id';

			if (this._map[id]) return this._map[id];
			for(; i < len; ++i)
				if (m[i].get(idStr) === id) return m[i];

			return null;
		},

		/**
		 * @description Gets a model by collection index
		 * @param {Number} index
		 * @returns {model}
		 */
		at: function(index){
			// return a model based upon the index in the array
			return this._models[index];
		},

		/**
		 * @description Returns an array with the .toJSON outputs of all model members
		 * @returns {Array}
		 */
		toJSON: function(){
			// get the toJSON of all models.
			return _.map(this._models, function(model){
				return model.toJSON();
			});
		},

		/**
		 * @description Removes all models, suppressing events as needed
		 * @param {Boolean} quiet to avoid firing
		 * @returns {model}
		 */
		empty: function(quiet){
			this.remove(this._models, quiet);
			quiet || this.trigger('empty');

			return this;
		},

		/**
		 * @description Applies a sort to collection
		 * @param {String|Function} how to sort
		 * @fires sort
		 * @returns {collection}
		 */
		sort: function(how){
			// no arg. natural sort
			if (!how){
				this._models.sort();
				return this.trigger('sort');
			}

			// callback function
			if (typeof how === 'function'){
				this._models.sort(how);
				return this.trigger('sort');
			}

			// string keys, supports `:asc` (default) and `:desc` order
			var type = 'asc',
				// multiple conds are split by ,
				conds = how.split(','),
				c = function(a, b){
					if (a < b)
						return -1;
					if (a > b)
						return 1;
					return 0;
				};


			this._models.sort(function(a, b){
				var ret = 0;
				_.some(conds, function(cond){
					// run for as long as there is no clear distinction
					cond = cond.trim();

					var pseudos = cond.split(':'),
						key = pseudos[0],
						sortType = (pseudos[1]) ? pseudos[1] : type,
						ak = a.get(key),
						bk = b.get(key),
						cm = c(ak, bk),
						map = {
							asc: cm,
							desc: -(cm)
						};

					// unknown types are ascending
					if (typeof map[sortType] === 'undefined'){
						sortType = type;
					}

					// assign ret value
					ret = map[sortType];

					// if we have a winner, break .some loop
					return ret !== 0;
				});

				// return last good comp
				return ret;
			});

			return this.trigger('sort');
		},

		/**
		 * @description Reverses the order of a collection
		 * @fires sort
		 * @returns {collection}
		 */
		reverse: function(){
			// reversing is just sorting in reverse.
			this._models.reverse();

			return this.trigger('sort');
		},

		/**
		 * @description Searches for models that match an expression
		 * @param {String} expression to parse
		 * @returns {Array}
		 */
		find: function(expression){
			/*jshint eqeqeq:false */
			// model search engine, based upon the MooTools Slick.parse DOM parser
			var parsed = slicker.parse(expression),
				exported = [],
				found = this,
				map = {
					'=': function(a, b){
						return a == b;
					},
					'!=': function(a, b){
						return a != b;
					},
					'^=': function(a, b){
						return a.indexOf(b) === 0;
					},
					'*=': function(a, b){
						return a.indexOf(b) !== -1;
					},
					'$=': function(a, b){
						return a.indexOf(b) == a.length - b.length;
					},
					'*': function(a){
						return typeof a !== 'undefined';
					}
				},
				fixOperator = function(operator){
					return (!operator || !map[operator]) ? null : map[operator];
				},
				finder = function(attributes){
					var attr = attributes.key,
						value = attributes.value || null,
						tag = attributes.tag || null,
						operator = fixOperator(attributes.operator);

					found = found.filter(function(el){
						var t, a;
						if (tag && attr){
							t = el.get(tag);
							a = t ? t[attr] : null;
						}
						else if (tag){
							a = el.get(tag);
						}
						else {
							a = el.get(attr);
						}

						if (a !== null && value !== null && operator !== null)
							return operator(a, value);

						return a != null;
					});

				};

			if (parsed.expressions.length){
				var j, i;
				var attributes;
				var currentExpression, currentBit, expressions = parsed.expressions, id, t, tag;
				var cb = function(a){
					a.tag = tag;
					return a;
				};

				search: for (i = 0; (currentExpression = expressions[i]); i++){
					for (j = 0; (currentBit = currentExpression[j]); j++){
						attributes = currentBit.attributes;
						// support by id
						id = currentBit.id;
						if (id){
							t = {
								key: 'id',
								value: id,
								operator: '='
							};
							attributes || (attributes = []);
							attributes.push(t);
						}
						// by tag
						tag = currentBit.tag;
						if (tag && tag != '*'){
							attributes || (attributes = [
								{
									key: null,
									value: '',
									operator: '*'
								}
							]);

							attributes = _.map(attributes, cb);
						}

						if (!attributes) continue search;

						_.forEach(attributes, finder);
					}
					exported[i] = found;
					found = this;
				}

			}

			return _.flatten(exported);
		},

		/**
		 * @description Searches for the first model that matches an expression
		 * @param {String} expression
		 * @returns {collection.model}
		 */
		findOne: function(expression){
			var results = this.find(expression);
			return results.length ? results[0] : null;
		},

		/**
		 * @description Searches for a model that matches passed attributes via getters EXACTLY
		 * @param {Object} attributes
		 * @returns {collection.model|undefined}
		 */
		where: function(attributes){
			var keys = _.keys(attributes);
			return _.find(this._models, function(model){
				return _.isEqual(model.get(keys), attributes);
			});
		}

	});

	// move wrapped methods from lodash to our proto
	_.forEach(['forEach', 'filter', 'map', 'some', 'indexOf', 'contains', 'invoke', 'every'], function(method){
		// proxy to lodash methods like on a Type
		collection.prototype[method] = function(args){
			args = slice(arguments);
			args.unshift(this._models);
			return _[method].apply(this, args);
		};
	});

	// also add these
	_.forIn({
		each: function(){
			return this.forEach.apply(this, arguments);
		},
		getRandom: function(){
			return this._models[_.random(0, this.length-1)];
		},
		getLast: function(){
			return this._models[this.length-1];
		}
	}, function(cb, method){
		collection.prototype[method] = cb;
	});

	return collection;

});
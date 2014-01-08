;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index', './model', 'slicker'], factory);
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
		slice = Array.prototype.slice;

	var collection = primish({

		implement: [emitter, options],

		// base model is just epik model
		model: Model,

		constructor: function(models, options){
			this.setOptions(options);
			this._models = [];
			this.length = 0;
			models && this.reset(models, true);

			// collections should have an id for storage
			this.id = this.options.id || _.uniqueId();

			return this.trigger('ready');
		},

		/**
		 * @description adds model(s) to collection, typically initially.
		 * @param {Array|Object} model(s)
		 * @param {Boolean} [quiet]
		 * @returns {collection}
		 */
		reset: function(models, quiet){
			var self = this;

			// empty models first, quietly.
			this.length && this.removeModel(this._models, true);

			_.isArray(models) || (models = [models]);
			_.forEach(models, function(model){
				self.addModel(model, true);
			});

			quiet || this.trigger('reset');

			return this;
		},

		addModel: function(model, replace){
			// add a new model to collection
			var exists,
				self = this;

			// if it's just an object, make it a model first
			if (_.isObject(model) && !(model instanceof this.model)){
				model = new this.model(model);
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
				var args = slice.call(arguments);
				args[0] = model;
				self.trigger(event, args);
				if (event === 'destroy'){
					self.removeModel(model, true);
				}
			});

			this._models.push(model);

			_.indexOf(model._collections, this) === -1 && model._collections.push(this);

			this.length = this._models.length;

			// export model and cid added, fire reset.
			return this.trigger('add', model, model.cid); //.trigger('reset', model, model.cid);
		},

		removeModel: function(models, quiet){
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

		get: function(what){
			// compat for storage
			return this[what];
		},

		getModelByCID: function(cid){
			// return a model based upon a cid search
			var last = null;

			this.some(function(el){
				return el.cid === cid && (last = el);
			});

			return last;
		},

		getModelById: function(id){
			// return a model based upon an id search
			var last = null;

			this.some(function(el){
				return el.get('id') === id && (last = el);
			});

			return last;
		},

		at: function(index){
			// return a model based upon the index in the array
			return this._models[index];
		},

		toJSON: function(){
			// get the toJSON of all models.
			return _.map(this._models, function(model){
				return model.toJSON();
			});
		},

		empty: function(quiet){
			this.removeModel(this._models, quiet);
			return this.trigger('empty');
		},

		sort: function(how){
			// no arg. natural sort
			if (!how){
				this._models.sort();
				return this.trigger('sort');
			}

			// callback function
			if (typeof how === 'function'){
				this.model.sort(how);
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

		reverse: function(){
			// reversing is just sorting in reverse.
			this._models.reverse();

			return this.trigger('sort');
		},

		find: function(expression){
			/*jshint eqeqeq:false */
			// experimental model search engine, powered by MooTools Slick.parse
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

		findOne: function(expression){
			var results = this.find(expression);
			return results.length ? results[0] : null;
		}

	});

	// move wrapped methods from lodash to our proto
	_.forEach(['forEach', 'filter', 'map', 'some', 'indexOf', 'contains', 'invoke'], function(method){
		// proxy to lodash methods like on a Type
		collection.prototype[method] = function(args){
			args = slice.call(arguments);
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
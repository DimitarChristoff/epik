;(function(factory){
		if (typeof define == 'function' && define.amd){
		define('epik/model', ['./index'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index')
		);
	} else {
		this.epik.model = factory(
			this.epik
		);
	}
}).call(this, function(epik){
	var primish = epik.primish,
		options = epik.options,
		emitter = epik.emitter,
		_ = epik._,
		util = epik.util,
		slice = epik.primish.slice;

		/**
	 * @class model
	 * @constructor
	 */
	return primish('model', {

		implement: [options, emitter],

		properties: {
			id: {
				get: function(){
					// need a cid to identify model.
					var id = this._attributes.id || _.uniqueId('model-');
					// always need a collection id.
					this.cid || (this.cid = id);

					return this._attributes.id || id;
				}
			}
		},

		options: {},

		validators: [],

		/**
		 * @constructs model
		 * @param {Object=} obj with initial model properties
		 * @param {Object=} options to pass into
		 * @fires ready
		 * @returns {model}
		 */
		constructor: function(obj, options){
			this._collections = [];
			this._attributes = {};

			obj && typeof obj == 'object' || (obj = {});
			this.defaults && _.defaults(obj, _.cloneDeep(typeof this.defaults === 'function' ? this.defaults.call(this) : this.defaults));

			this.set(obj);
			this.setOptions(options);

			primish.hide(this, 'isEqual', _.isEqual);
			return this.trigger('ready');
		},

		/**
		 * @description overloaded setter of properties for model
		 * @param {String|Object} key or object to get keys->values from
		 * @pram {*=} value to set when key is not an object
		 * @fires change
		 * @fires change:key
		 * @fires error
		 * @return {model}
		 */
		set: function(){
			// call the real getter. we proxy this because we want
			// a single event after all properties are updated and the ability to work with
			// either a single key->value pair or an object
			this.propertiesChanged = [];
			this.validationFailed = [];

			this._set.apply(this, arguments);
			// if any properties did change, fire a change event with the array.
			this.propertiesChanged.length && this.trigger('change', this.propertiesChanged);
			this.validationFailed.length && this.trigger('error', this.validationFailed);

			return this;
		},

		/**
		 * @description real setter function, see model:set above
		 * @param {String} key in attribute
		 * @param {*} value to assign to key
		 * @returns {model}
		 * @private
		 */
		_set: util.setter(function(key, value){
			// needs to be bound the the instance.
			if (typeof key === 'undefined' || typeof value === 'undefined') return this;

			var a = this._attributes,
				p = this.properties;

			// custom setter - see bit further down
			if (p[key] && p[key].set){
				value = p[key].set.call(this, value);
				if (typeof value === 'undefined') return this;
			}

			// no change? this is crude and works for primitives.
			if (a.hasOwnProperty(key) && this.isEqual(a[key], value))
				return this;

			// basic validator support
			if (this.validators.hasOwnProperty(key)){
				var validator = this.validate(key, value);
				if (validator !== true){
					var obj = {
						key: key,
						value: value,
						error: validator
					};
					this.validationFailed.push(obj);
					this.trigger('error:' + key, obj);
					return this;
				}
			}

			// fire an event.
			this.trigger('change:' + key, value, a[key]);

			a[key] = value;

			// store changed keys...
			this.propertiesChanged.push(key);

			return this;
		}),

		/**
		 * @description Return a single property or a map of properties
		 * @param {String|Array} key or keys to retrieve
		 * @returns {*|Object}
		 */
		get: util.getter(function(key){
			// custom accessors take precedence and have no reliance on item being in attributes
			if (key && this.properties[key] && this.properties[key].get){
				return this.properties[key].get.call(this);
			}

			// else, return from attributes or return null when undefined.
			return (key && typeof this._attributes[key] !== 'undefined') ? this._attributes[key] : null;
		}),

		/**
		 * @description Property validator API, can be overridden
		 * @param {String} key
		 * @param {*} value
		 * @returns {Boolean} true when validated or no validator, true|false from validator cb
		 */
		validate: function(key, value){
			// run validation, return true (validated) if no validator found
			return this.validators[key].call(this, value);
		},

		/**
		 * @description Removes one multiple properties from model
		 * @param {String|Array} key or keys
		 * @fires change
		 * @fires change:key
		 * @returns {model}
		 */
		unset: function(){
			// can remove keys from model, passed on as multiple string arguments or an array of string keys
			var keys = slice(arguments),
				props = [],
				len = keys.length,
				a = this._attributes;

			if (!len)
				return this;

			// no change? this is crude and works for primitives.
			_.forEach(_.flatten(keys), function(key){
				if (a.hasOwnProperty(key)){
					delete a[key];
					props.push(key);
				}
			});

			len = props.length;
			if (len){
				this.propertiesChanged = props;
				while (len--){
					this.trigger('change:' + props[len], null);
				}

				this.trigger('change', props);
			}
			return this;
		},

		/**
		 * @description Empties model of all attributes
		 * @fires change
		 * @fires change:key
		 * @fires empty
		 * @returns {model}
		 */
		empty: function(){
			// empty the model and fire change event
			var keys = _.keys(this._attributes),
				self = this;

			// let the instance know.
			this.trigger('change', keys);

			// fire change for all keys in the model.
			_.forEach(keys, function(key){
				self.trigger('change:' + key, null);
			});

			this._attributes = {};
			this.trigger('empty');

			return this;
		},

		/**
		 * @description Brute force emptying of model without events
		 * @returns {model}
		 */
		destroy: function(){
			this._attributes = {};
			this.trigger('destroy');

			return this;
		},

		/**
		 * @description Serialize the model's attributes and dereference it. Deep.
		 * @returns {Object}
		 */
		toJSON: function(){
			return _.cloneDeep(this._attributes);
		}

	});

});
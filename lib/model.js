;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index')
		);
	} else {
		this.epic.model = factory(
			this.epic
		);
	}
}).call(this, function(epic){
	var primish = epic.primish,
		options = epic.options,
		emitter = epic.emitter,
		_ = epic._,
		util = epic.util;

	return primish({

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

		options: {
			defaults: {}
		},

		collections: [],

		validators: [],

		_attributes: {},

		constructor: function(obj, options){

			options && options.defaults && (this.options.defaults = _.merge(this.options.defaults, options.defaults));

			this.set(_.merge(this.options.defaults, obj && typeof obj == 'object' ? obj : {}));
			this.setOptions(options);

			return this.trigger('ready');
		},

		set: function(){
			// call the real getter. we proxy this because we want
			// a single event after all properties are updated and the ability to work with
			// either a single key, value pair or an object
			this.propertiesChanged = [];
			this.validationFailed = [];

			this._set.apply(this, arguments);
			// if any properties did change, fire a change event with the array.
			this.propertiesChanged.length && this.trigger('change', this.propertiesChanged);
			this.validationFailed.length && this.trigger('error', this.validationFailed);

			return this;
		},

		// private, real setter functions, not on prototype, see note above
		_set: util.setter(function(key, value){
			// needs to be bound the the instance.
			if (!key || typeof value === 'undefined') return this;

			// custom setter - see bit further down
			if (this.properties[key] && this.properties[key].set){
				value = this.properties[key].set.call(this, value);
				if (typeof value === 'undefined') return this;
			}

			// no change? this is crude and works for primitives.
			if (this._attributes[key] && _.isEqual(this._attributes[key], value))
				return this;

			// basic validator support
			var validator = this.validate(key, value);
			if (this.validators[key] && validator !== true){
				var obj = {
					key: key,
					value: value,
					error: validator
				};
				this.validationFailed.push(obj);
				this.trigger('error:' + key, obj);
				return this;
			}

			if (value === null){
				delete this._attributes[key]; // delete = null.
			}
			else {
				this._attributes[key] = value;
			}

			// fire an event.
			this.trigger('change:' + key, value);

			// store changed keys...
			this.propertiesChanged.push(key);

			return this;
		}),

		get: util.getter(function(key){
			// custom accessors take precedence and have no reliance on item being in attributes
			if (key && this.properties[key] && this.properties[key].get){
				return this.properties[key].get.call(this);
			}

			// else, return from attributes or return null when undefined.
			return (key && typeof this._attributes[key] !== 'undefined') ? this._attributes[key] : null;
		}),

		validate: function(key, value){
			// run validation, return true (validated) if no validator found
			return (key in this.validators) ? this.validators[key].call(this, value) : true;
		},

		unset: function(){
			// can remove keys from model, passed on as multiple string arguments or an array of string keys
			var keys = Array.prototype.slice.apply(arguments),
				obj = {},
				len = keys.length;

			if (!len)
				return this;

			_.forEach(_.flatten(keys), function(key){
				obj[key] = null;
			});

			this.set(obj);

			return this;
		},

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
		},

		destroy: function(){
			// destroy the model, send delete to server
			this._attributes = {};
			this.trigger('destroy');
		},

		toJSON: function(){
			return _.clone(this._attributes);
		}

	});

});


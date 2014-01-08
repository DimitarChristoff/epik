;(function(factory){
	if (typeof define == 'function' && define.amd){
		define([
			'primish/primish',
			'primish/options',
			'primish/emitter',
			'lodash'
		], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('primish'),
			require('primish/options'),
			require('primish/emitter'),
			require('lodash')
		);
	} else {
		this.epik = factory(
			this.primish,
			this.options,
			this.emitter,
			this._
		);
	}
}).call(this, function(primish, options, emitter, _, slicker){

	var slice = Array.prototype.slice;

	/**
	 * @module emitter
	 * @description extends default func to support subscribers
	 * @type {primish.emitter}
	 */
	emitter = primish({

		extend: emitter,

		/**
		 * @description allows subscribing to a particular event or all events on
		 * another instance implementing emitter
		 * @param {obj} {object} instance to subscribe from
		 * @param {string} [event] optional event type.
		 * @param {function} [fn] optional callback
		 * @returns {emitter}
		 */
		listenTo: function(obj, event, fn){
			var t = typeof event,
				eventObj = {
					context: obj,
					subscriber: this
				},
				subscribers = obj._subscribers || primish.hide(obj, '_subscribers');

			if (t === 'function'){
				fn = event;
				event = '*';
			}
			else if (t === 'undefined'){
				event = '*';
			}

			fn && (eventObj.fn = fn);
			subscribers[event] || (subscribers[event] = []);

			_.indexOf(subscribers[event], eventObj) === -1 && subscribers[event].push(eventObj);

			return this;
		},

		/**
		 * @descriptions stops subscribed events from other instances
		 * @param {object} obj instance to stop listening to
		 * @param {string} [event] event type: particular event to unsubscribe from,
		 * or all events by default. '*' for wildcard events only
		 * @param {function} [fn] particular callback to remove only, in pair with [event]
		 * @returns {emitter}
		 */
		stopListening: function(obj, event, fn){
			_.forIn(obj._subscribers, function(value, key, len){
				len = value.length;
				if (typeof event !== 'undefined'){
					if (key === event) while (len--)
						(((fn && fn === value[len].fn) || !fn) && value[len].context === obj) && value.splice(len, 1);
				}
				else {
					// no type, unsubscribe from all for that context object
					while (len--) value[len].context === obj && value.splice(len, 1);
				}
			});

			return this;
		},

		/**
		 * @description fires an event to an instance and all of its subscribers
		 * @param {string} event name to fire.
		 * @param {mixed} [rest] args to pass to callback,
		 * @returns {emitter}
		 */
		trigger: function(event){
			var listeners = this._listeners,
				subscribers = this._subscribers,
				events,
				k,
				args = slice.call(arguments, 1),
				copy = {},
				subscriber;

			if (listeners && (events = listeners[event])){
				// freeze events
				for (k in events) copy[k] = events[k];
				for (k in copy) copy[k].apply(this, args);
			}

			if (subscribers){
				events = subscribers['*'] || [];
				for (k = 0; k < events.length; k++){
					subscriber = events[k];
					if (subscriber.fn){
						subscriber.fn.apply(subscriber.context, args);
					}
					else {
						this.trigger.apply(subscriber.subscriber, args);
					}
				}
				events = subscribers[event] || [];
				args.unshift(event);
				for (k = 0; k < events.length; k++){
					subscriber = events[k];
					if (subscriber.fn){
						subscriber.fn.apply(subscriber.context, args);
					}
					else {

						this.trigger.apply(subscriber.subscriber, args);
					}
				}

			}

			return this;
		},

		/**
		 * @description stops all event listeners and subscribers for a particular event
		 * @param {string} event to stop emitting
		 * @returns {emitter}
		 */
		offAll: function(event){
			var listeners = this._listeners,
				subscribers = this._subscribers,
				events;

			// danger danger. no arg = removes all events. use sparringly
			if (!event || !event.length){
				this._listeners = {};
				this._subscribers = {};
				return this;
			}

			if (listeners && (events = listeners[event])){
				delete listeners[event];
			}
			if (subscribers && (events = subscribers[event])){
				delete subscribers[event];
			}
			return this;
		}
	});

	var util = {
		/**
		 * @description memoizes a function key->value setter to work with objects
		 * @param {function} fn to memoize
		 * @returns {Function}
		 */
		setter: function(fn){
			return function(a, b){
				if (a == null) return fn;
				if (_.isObject(a))
					for (var k in a) fn.call(this, k, a[k]);
				else
					fn.call(this, a, b);
			};
		},
		/**
		 * @description memoizes a function key->value getter to work with objects
		 * @param {function} fn to memoize
		 * @returns {Array} values returned as per keys
		 */
		getter: function(fn){
			return function(a){
				var result,
					args,
					i;

				args = typeof a != 'string' ? a : arguments.length > 1 ? arguments : false;
				if (args){
					result = {};
					for (i = 0; i < args.length; i++) result[args[i]] = fn.call(this, args[i]);
				}
				else {
					result = fn.call(this, a);
				}
				return result;
			};
		}
	};

	emitter.prototype.on = util.setter(emitter.prototype.on);

	/**
	 * sugar methods to save constant dependency calls
	 */
	return {
		_: _,
		primish: primish,
		options: options,
		emitter: emitter,
		slicker: slicker,
		util: util
	};
});

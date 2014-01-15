;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['../index', 'rivets'], factory);
	}
	else {
		this.epik.rivets = factory(
			this.epik,
			this.rivets
		);
	}

}).call(this, function(epik, rivets){

	var primish = epik.primish,
		model = 'model',
		isModel = function(obj){
			return obj._id === model;
		};

	/**
	 * configure prefix and delimiters
	 */
	rivets.configure({
		prefix: 'ep',
		templateDelimiters: [
			'{{',
			'}}'
		]
	});

	/**
	 * Adapters for epik are hiding behind #
	 * @type {{subscribe: subscribe, unsubscribe: unsubscribe, read: read, publish: publish}}
	 */
	rivets.adapters['#'] = {
		/**
		 * @description Subscribes to events on models or collections that make sense for re-rendering
		 * @param {Model|Collection} obj to bind to
		 * @param {String} [keypath] optional keypath to listen to
		 * @param {Function} callback to call
		 */
		subscribe: function(obj, keypath, callback){
			isModel(obj) ?
				obj.on('empty destroy change:' + keypath, function(){
					callback();
				}) :
				obj.on('reset empty change sort', function(){
					callback();
				});
		},
		/**
		 * @description Un-subscribes from events on models or collections when unbinding
		 * @param {Model|Collection} obj to bind to
		 * @param {String} [keypath] optional keypath to listen to
		 * @param {Function} callback to call
		 */
		unsubscribe: function(obj, keypath, callback){
			if (isModel(obj)){
				obj.off('change:' + keypath, callback);
				obj.off('empty', callback);
				obj.off('destroy' + keypath, callback);
			}
			else {
				obj.off('reset', callback);
				obj.off('empty', callback);
				obj.off('change', callback);
				obj.off('sort', callback);
			}
		},
		/**
		 * @param {Model|Collection} obj to bind to
		 * @param {String} [keypath] optional keypath to listen to
		 * @returns {*|Array}
		 */
		read: function(obj, keypath){
			return isModel(obj) ? obj.get(keypath) : obj._models;
		},
		/**
		 * @param {Model|Collection} obj to bind to
		 * @param {String} [keypath] optional keypath to listen to
		 * @param {*} value to set
		 */
		publish: function(obj, keypath, value){
			isModel(obj) ?
				obj.set(keypath, value) :
				obj.set(value);
		}
	};

	/**
	 * @Class rivets
	 * @description mixin class
	 */
	return primish({

		/**
		 * {Object} rivets refernece to original rivets
		 */
		rivets: rivets,

		/**
		 * @description manually process template bindings, triggers a render
		 */
		syncRivets: function(){
			this.boundRivets && this.boundRivets.sync() && this.trigger('render');
		},

		/**
		 * @description binds an object to an element or to this.element if not passed.
		 * @param {Object} [element] element to bind to, optional, inferred to this.element
		 * @param {Object} object to bind to template
		 */
		bindRivets: function(element, object){
			// if no element supplied, assume it's this.element
			typeof object === 'undefined' && (object = element, element = this.element);
			this.boundRivets = this.rivets.bind(element, object);
		},

		/**
		 * @description unbinds rivets bindings when possible
		 */
		unbindRivets: function(){
			this.boundRivets && this.boundRivets.unbind();
			delete this.boundRivets;
		}
	});

});

;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index')
		);
	} else {
		this.epik.storage = factory(
			this.epik
		);
	}
}).call(this, function(epik){
	var primish = epik.primish,
		_ = epik._,
		win = this;

	return (function(){
		// returns 2 classes for use with localStorage and sessionStorage as mixins

		// feature detect if storage is available
		var hasNativeStorage = !!(typeof win.localStorage === 'object' && win.localStorage.getItem),

			// default storage method
			localStorage = 'localStorage',

			// alternative storage
			sessionStorage = 'sessionStorage',

			setStorage = function(storageMethod){
				// mini constructor that returns an object with the method as context
				var s,
					privateKey = 'epik-' + storageMethod,
					// this actual object that holds state of storage data - per method.
					storage = {},
					// by default, prefix storage keys with model:
					storagePrefix = 'model';

				// try native
				if (hasNativeStorage){
					try {
						storage = JSON.parse(win[storageMethod].getItem(privateKey)) || storage;
					}
					catch (o_O) {
						// session expired / multiple tabs error (security), downgrade.
						hasNativeStorage = false;
					}
				}

				if (!hasNativeStorage){
					// try to use a serialized object in window.name instead
					try {
						s = JSON.parse(win.name);
						if (s && typeof s === 'object' && s[privateKey])
							storage = s[privateKey];
					}
					catch (e) {
						// window.name was something else. pass on our current object.
						serializeWindowName();
					}
				}

				// exported methods to classes, mootools element storage style
				var Methods = {
					store: function(model){
						// saves model or argument into storage
						model = model || this.toJSON();
						setItem([storagePrefix, this.get('id')].join(':'), model);
						this.trigger('store', model);
					},

					eliminate: function(){
						// deletes model from storage but does not delete the model
						removeItem([storagePrefix, this.get('id')].join(':'));
						return this.trigger('eliminate');
					},

					retrieve: function(){
						// return model from storage. don't set to Model!
						var model = getItem([storagePrefix, this.get('id')].join(':')) || null;
						this.trigger('retrieve', model);

						return model;
					}
				},

				// internal methods to proxy working with storage and fallbacks
				getItem = function(item){
					// return from storage in memory
					return item in storage ? storage[item] : null;
				},

				setItem = function(item, value){
					// add a key to storage hash
					storage = hasNativeStorage ? JSON.parse(win[storageMethod].getItem(privateKey)) || storage : storage;
					storage[item] = value;

					if (hasNativeStorage){
						try {
							win[storageMethod].setItem(privateKey, JSON.stringify(storage));
						}
						catch (o_O) {
							// session expired / tabs error (security)
						}
					}
					else {
						serializeWindowName();
					}

					return this;
				},

				removeItem = function(item){
					// remove a key from the storage hash
					delete storage[item];

					if (hasNativeStorage){
						try {
							win[storageMethod].setItem(privateKey, JSON.stringify(storage));
						}
						catch (o_O) {
							// session expired / tabs error (security)
						}
					}
					else {
						// remove from window.name also.
						serializeWindowName();
					}
				},

				serializeWindowName = function(){
					// this is the fallback that merges storage into window.name
					var obj = {},
						s = JSON.parse(win.name);

					obj[privateKey] = storage;
					win.name = JSON.stringify(_.merge(obj, s));
				};

				return function(storageName){
					storagePrefix = storageName;
					return primish(_.clone(Methods));
				};

			};


		// actual object returns 2 distinct mixin classes we can use.
		return {
			localStorage: setStorage(localStorage),
			sessionStorage: setStorage(sessionStorage)
		};
	}());
});
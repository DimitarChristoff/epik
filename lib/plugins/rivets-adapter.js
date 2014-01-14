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

	rivets.configure({
		prefix: 'ep',
		templateDelimiters: [
			'{{',
			'}}'
		]
	});

	var primish = epik.primish,
		model = 'model',
		isModel = function(obj){
			return obj._id === model;
		};

	// needs to configure both models and collections
	rivets.adapters['#'] = {
		subscribe: function(obj, keypath, callback){
			isModel(obj) ?
				obj.on('empty destroy change:' + keypath, function(){
					callback();
				}) :
				obj.on('set add remove empty', function(){
					callback();
				});
		},
		unsubscribe: function(obj, keypath, callback){
			if (isModel(obj)){
				obj.off('change:' + keypath, callback);
				obj.off('empty', callback);
				obj.off('destroy' + keypath, callback);
			}
			else {
				obj.off('add', callback);
				obj.off('remove', callback);
				obj.off('set', callback);
				obj.off('empty', callback);
			}
		},
		read: function(obj, keypath){
			return isModel(obj) ? obj.get(keypath) : obj.toJSON();
		},
		publish: function(obj, keypath, value){
			isModel(obj) ?
				obj.set(keypath, value) :
				obj.set(value);
		}
	};

	return primish({

		rivets: rivets,

		syncRivets: function(){
			this.boundRivets && this.boundRivets.sync();
		},

		bindRivets: function(){
			this.boundRivets = this.rivets.bind.apply(this, arguments);
		},

		unbindRivets: function(){
			this.boundRivets.unbind();
			delete this.boundRivets;
		}
	});
});
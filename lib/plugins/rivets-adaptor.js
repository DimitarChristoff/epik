;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index', './model', 'rivets'], factory);
	}
	else {
		this.epik.rivets = factory(
			this.epik,
			this.epik.model,
			this.rivets
		);
	}

}).call(this, function(epik, Model, rivets){

	// rivets.config();

	var isModel = function(obj){
		return obj instanceof Model;
	};

	// needs to configure both models and collections
	rivets.adapters['#'] = {
		subscribe: function(obj, keypath, callback){
			isModel(obj) ?
				obj.on('change:' + keypath, function(){
					callback();
				}) :
				obj.on('set', function(){
					callback();
				});
		},
		unsubscribe: function(obj, keypath, callback){
			if (isModel(obj)){
				obj.off('change:' + keypath, callback);
			}
			else {
				obj.off('add', callback);
				obj.off('remove', callback);
				obj.off('set', callback);
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

	return rivets;
});
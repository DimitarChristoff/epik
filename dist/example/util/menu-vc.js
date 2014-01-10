define(function(require){

	var view = require('lib/view'),
		primish = require('lib/index').primish,
		rivets = require('components/rivets/dist/rivets');

	rivets.adapters[':'] = {
		subscribe: function(obj, keypath, callback){
			obj.on('set', function(){
				callback();
			});
		},
		unsubscribe: function(obj, keypath, callback){
			obj.off('add', callback);
			obj.off('remove', callback);
			obj.off('set', callback);
		},
		read: function(obj, keypath){
			return obj.toJSON();
		},
		publish: function(obj, keypath, value){
			obj.set(keypath, value);
		}
	};

	return primish({
		extend: view,
		options: {
			template: '<a rv-each-item="examples:" class="item menu-item" rv-id="item.title" rv-href="item.route">{item.title}</a></div>'
		},
		constructor: function(options){
			this.parent('constructor', options);
			this.element.innerHTML = this.options.template;
			rivets.bind(this.element, {examples: this.collection});
		}
	});
});
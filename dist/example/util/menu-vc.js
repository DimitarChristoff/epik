define(function(require){

	var view = require('epik/view'),
		primish = require('epik/index').primish,
		rivets = require('epik/plugins/rivets-adapter'),
		template = require('text!example/templates/menu.tpl');

	return primish({
		implement: rivets,
		extend: view,
		options: {
			template: template
		},
		constructor: function(options){
			this.parent('constructor', options);
			this.element.innerHTML = this.options.template;
			this.bindRivets(this);
		}
	});
});
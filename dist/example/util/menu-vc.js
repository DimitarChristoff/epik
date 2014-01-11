define(function(require){

	var view = require('lib/view'),
		primish = require('lib/index').primish,
		rivets = require('rivets-adapter'),
		template = require('text!example/templates/menu.tpl');

	return primish({
		extend: view,
		options: {
			template: template
		},
		constructor: function(options){
			this.parent('constructor', options);
			this.element.innerHTML = this.options.template;
			rivets.bind(this.element, {examples: this.collection});
		}
	});
});
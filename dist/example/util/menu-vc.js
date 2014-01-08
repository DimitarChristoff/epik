define(function(require){

	var view = require('lib/view'),
		primish = require('lib/index').primish,
		tpl = require('hbs!example/templates/menu');

	return primish({
		extend: view,
		options: {
			template: tpl
		},
		render: function(){
			this.element.innerHTML = this.options.template({
				examples: this.collection.toJSON()
			});
			this.parent('render');
		}
	});
});
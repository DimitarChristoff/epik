define(function(require){
	return function(){
		var epik = require('epik/index'),
			_ = epik._,
			primish = epik.primish,
			Person = require('example/util/person'),
			view = require('epik/view'),
			template = require('text!example/templates/person.tpl'),
			rivets = require('epik/plugins/rivets-adapter');

		var PersonView = primish({
			implement: rivets,
			extend: view,
			options: {
				template: template
			},
			constructor: function(options){
				this.parent('constructor', options);
				this.element.innerHTML = this.options.template;
				this.attachEvents();
			},

			destroy: function(){
				this.unbindRivets();
				this.parent('destroy');
			},

			attachEvents: function(){
				var model = this.model,
					bound = {
						person: this.model,
						// global errors flag helps with view
						errors: false
					};

				this.bindRivets(bound);

				this.on('model:change', function(changed){
					// find at least one error
					var hasErrors = false;
					_.forEach(changed, function(key){
						var isError = key.indexOf('-error') === -1;
						hasErrors || isError && (hasErrors = true);
						isError && model.set(key + '-error', null);
					});
					// if no errors, let view know.
					hasErrors || (bound.errors = false);
				});

				this.model.on('error', function(error){
					_.forEach(error, function(e){
						model.set(e.key + '-error', e.error);
					});
					bound.errors = true;
				});
			}
		});

		window.pv = new PersonView({
			element: document.getElementById('example'),
			model: new Person({
				name: 'Epik'
			})
		});
	};
});
define(function(require){
	return function(){
		var epik = require('lib/index'),
			_ = epik._,
			primish = epik.primish,
			Person = require('example/util/person'),
			view = require('lib/view'),
			template = require('text!example/templates/person.tpl'),
			rivets = require('rivets');

		var PersonView = primish({
			extend: view,
			options: {
				template: template
			},
			constructor: function(options){
				this.parent('constructor', options);
				this.element.innerHTML = this.options.template;
				this.attachEvents();
			},

			attachEvents: function(){
				var model = this.model,
					el = this.element.querySelector('div.form'),
					classError = 'form ui';

				rivets.bind(this.element, {
					person: this.model
				});

				// crude error messages on the form
				this.model.on('change', function(changed){
					_.forEach(changed, function(key){
						key.indexOf('-error') === -1 && model.set(key + '-error', null);
					});
					el.className = classError;
				});

				this.model.on('error', function(error){
					_.forEach(error, function(e){
						model.set(e.key + '-error', e.error);
					});
					el.className = classError + ' error';
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
define(function(require){
	return function(){
		var epik = require('epik/index'),
			_ = epik._,
			primish = epik.primish,
			Person = require('example/util/person'),
			view = require('epik/view'),
			template = require('text!example/templates/person-lodash.tpl');

		var PersonView = primish({
			extend: view,
			options: {
				template: template,
				events: {
					'submit form': 'viewModelChange'
				}
			},
			render: function(){
				this.$element.html(this.template(this.model.toJSON()));
			}
		});

		window.pv = new PersonView({
			element: document.getElementById('example'),
			model: new Person({
				name: 'Epik',
				occupation: ''
			}),
			"onModel:change": function(){
				this.render();
			},
			onReady: function(){
				this.render();
			},
			onViewModelChange: function(e){
				e && e.preventDefault();
				var $el = this.$element.find(e.target),
					data = {};

				_.forEach($el.serializeArray(), function(el){
					data[el.name] = el.value;
				});

				this.model.set(data);
			}
		});




	};
});
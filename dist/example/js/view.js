define(function(require){
	return function(){
		var epik = require('lib/index'),
			_ = epik._,
			primish = epik.primish,
			Person = require('example/util/person'),
			view = require('lib/view'),
			template = require('text!example/templates/person.tpl'),
			rivets = require('components/rivets/dist/rivets');


		rivets.adapters['#'] = {
			subscribe: function(obj, keypath, callback){
				obj.on('change:'+keypath, function(){
					callback();
				});
			},
			unsubscribe: function(obj, keypath, callback){
				obj.off('change:'+keypath, callback);
			},
			read: function(obj, keypath){
				return obj.get(keypath);
			},
			publish: function(obj, keypath, value){
				obj.set(keypath, value);
			}
		};

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
				var bound = this.bound = {
					person: this.model,
					error: {
						messages: null
					}
				};

				rivets.bind(this.element, this.bound);

				// crude error messages on the form
				this.model.on('change', function(){
					bound.error.messages = null;
				});
				this.model.on('error', function(error){
					bound.error.messages = _.map(error, function(e){
						return '"' + e.key + '" failed (' + e.value + '), ' + e.error;
					});
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
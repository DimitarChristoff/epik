;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index', './model', './collection'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index'),
			require('./model'),
			require('./collection')
		);
	} else {
		this.epik.view = factory(
			this.epik,
			this.epik.model,
			this.epik.collection
		);
	}

}).call(this, function(epik, Model, Collection){


	var primish = epik.primish,
		emitter = epik.emitter,
		options = epik.options,
		_ = epik._,
		slice = Array.prototype.slice;

	var View = primish({

		options: {
			template: '',
			// the event map should be like `elementEvent`: `instanceEvent`
			// for example: '{click:relay(a.task-remove)': 'removeTask'}
			// will fire instance's onRemoveTask handler when a.task-remove is pressed within the element.
		},

		/**
		 * {Object} events maps delegated DOM events to instance events or methods
		 */
		events: {},

		implement: [options, emitter],

		constructor: function(options){
			this.collection = null;
			this.model = null;
			this.element = null;

			if (options && options.collection){
				this.setCollection(options.collection);
				delete options.collection;
			}

			// deal with model as well
			if (options && options.model){
				this.setModel(options.model);
				delete options.model;
			}

			// now we can hopefully setOptions safely.
			this.setOptions(options);

			// define the element.
			if (this.options.element){
				this.setElement(this.options.element, this.options.events);
				delete this.options.element;
			}

			// let the instance know
			return this.trigger('ready');
		},

		setModel: function(model){
			var self = this;
			if (model instanceof Model){
				this.model = model;
				this.listenTo(this.model, function(){
					var args = slice.call(arguments);
					args[0] = 'collection:' + args[0];
					self.trigger.apply(self, args);
				});
			}
			return this;
		},

		setCollection: function(collection){
			var self = this;
			if (collection instanceof Collection){
				this.collection = collection;
				this.listenTo(this.collection, function(){
					var args = slice.call(arguments);
					args[0] = 'collection:' + args[0];
					self.trigger.apply(self, args);
				});
			}
			return this;
		},

		setElement: function(el, events){
			// set the element and clean-up old one
			this.element && this.detachEvents() && this.destroy();
			this.element = el;
			events && this.attachEvents(events);

			return this;
		},

		attachEvents: function(events){
			var self = this,
				el = this.element,
				on = function(){
					//todo: implement bridge for delegation
				};

			_.forIn(events, function(method, type){
				on(el, type, function(){
					self.trigger(method, arguments);
				});
			});

			// this.element.store('attachedEvents', events);

			return this;
		},

		detachEvents: function(){

		},

		render: function(){
			// refactor this in your constructor object. for example:
			// this.element.innerHTML = this.template(this.options.data));
			// this.parent('render'); // fires the render event.
			return this.trigger('render');
		},

		empty: function(soft){
			// with soft flag it does not destroy child elements but detaches from dom
			if (soft){
				//todo: implement detach
				// this.element.empty();
			}
			else {
				this.element.innerHTML = '';
			}

			return this.trigger('empty');
		},

		dispose: function(){
			// detach the element from the dom.
			this.element.parentNode = null;

			return this.trigger('dispose');
		},

		destroy: function(){
			// remove element from dom and memory.
			this.element.destroy();

			return this.trigger('destroy');
		},

		template: function(data, template){
			// refactor this to work with any other template engine in your constructor
			template = template || this.options.template;

			// instantiate a template engine when needed
			var compiler = this.Template || _.template;

			return compiler(template, data);
		}

	});

	return View;
});
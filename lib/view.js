;(function(factory){
	if (typeof define == 'function' && define.amd){
		define('epik/view', ['./index', './model', './collection', 'jquery'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index'),
			require('./model'),
			require('./collection'),
			require('./jquery')
		);
	} else {
		this.epik.view = factory(
			this.epik,
			this.epik.model,
			this.epik.collection,
			this.jQuery
		);
	}

}).call(this, function(epik, Model, Collection, jQuery){

	var primish = epik.primish,
		emitter = epik.emitter,
		options = epik.options,
		_ = epik._,
		slice = Array.prototype.slice;

	var View = primish({

		options: {
			template: '',
			// the event map should `event (delegator)`: `instanceEventName`
			// for example: '{"click a.task-remove"': 'removeTask'}
			events: {}
		},

		/**
		 * {Object} events maps delegated DOM events to instance events or methods
		 */

		implement: [options, emitter],

		constructor: function(options){
			this.collection = null;
			this.model = null;
			this.element = null;
			this.events = {};

			if (options && options.collection){
				this.setCollection(options.collection);
				delete options.collection;
			}

			// deal with model as well
			if (options && options.model){
				this.setModel(options.model);
				delete options.model;
			}

			if (options && options.events){
				this.events = _.merge(this.events, options.events);
				delete options.events;
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
					args[0] = 'model:' + args[0];
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
			this.$element = jQuery(el);
			this.element = this.$element[0];
			events && this.attachEvents(events);

			return this;
		},

		attachEvents: function(events){
			var self = this,
				el = this.$element,
				fn = 'function',
				makeCb = function(method){
					return function(){
						var args = slice.call(arguments);
						// prefer method to event
						if (self[method] && typeof self[method] === fn){
							self[method].apply(self, args);
						}
						else {
							args.unshift(method);
							self.trigger.apply(self, args);
						}
					};
				};

			this.bound || (this.bound = {});

			_.forIn(events, function(method, type){
				var eventArgs = type.split(/\s+/),
					cb = makeCb(method);

				eventArgs.push(cb);
				el.on.apply(el, eventArgs);

				self.bound[type] || (self.bound[type] = []);
				self.bound[type].push(cb);
			});

			return this;
		},

		detachEvents: function(){
			var el = this.$element,
				bound = this.bound;

			_.forIn(this.bound, function(cb, type){
				var eventArgs = type.split(/\s+/);
				eventArgs.push(cb);
				el.off.apply(el, eventArgs);

				var found = _.indexOf(bound[type], cb);
				if (found !== -1){
					bound[type].splice(found, 1);
				}
				bound[type].length || (delete bound[type]);
			});
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
				this.$element.empty();
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
			this.$element.remove();

			this.detachEvents();
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
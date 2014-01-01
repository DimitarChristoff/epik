;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index')
		);
	} else {
		this.epic.router = factory(
			this.epic
		);
	}
}).call(this, function(epic){
	var primish = epic.primish,
		emitter = epic.emitter,
		options = epic.options,
		_ = epic._,
		hc = 'hashchange',
		// hcSupported = ('on' + hc) in window,
		getQueryString = function(queryString){
			var result = {},
				re = /([^&=]+)=([^&]*)/g,
				m;

			while (m = re.exec(queryString)){
				result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}

			return result;
		};


	// Router, has its own repo https://github.com/DimitarChristoff/Router
	return primish({

		implement: [emitter, options],

		options: {
			triggerOnLoad: true // check route on load
		},

		routes: {
			// '#!path/:query/:id?': 'eventname',
		},

		boundEvents: {},

		constructor: function(options){
			this.setOptions(options);
			this.options.routes && (this.routes = this.options.routes);

			var bound = _.bind(this.handleChange, this);
			window.addEventListener(hc, bound, true);

			this.trigger('ready');
			this.options.triggerOnLoad && bound();
		},

		handleChange: function(){
			/*jshint loopfunc:true */
			var hash = location.hash,
				path = hash.split('?')[0],
				query = hash.split('?')[1] || '',
				notfound = true,
				route;

			for (route in this.routes){
				var keys = [],
					regex = this.normalize(route, keys, true, false),
					found = regex.exec(path),
					routeEvent = false;

				if (found){
					notfound = false;
					this.req = found[0];

					var args = found.slice(1),
						param = {};

					_.forEach(args, function(a, i){
						typeof keys[i] !== 'undefined' && (param[keys[i].name] = a);
					});

					this.route = route;
					this.param = param || {};
					this.query = query && getQueryString(query);

					// find referenced events
					routeEvent = this.routes[route];

					// generic before route, pass route id, if avail
					this.trigger('before', routeEvent);

					// if there is an identifier and an event added
					if (routeEvent && this._listeners[routeEvent] && this._listeners[routeEvent].length){
						// route event was defined, fire specific before pseudo
						this.trigger(routeEvent + ':before');
						// call the route event handler itself, pass params as arguments
						this.trigger(routeEvent, _.values(this.param));
					}
					else {
						// requested route was expected but not found or event is missing
						this.trigger('error', ['Route', routeEvent, 'is undefined'].join(' '));
					}

					// fire a generic after event
					this.trigger('after', routeEvent);

					// if route is defined, also fire a specific after pseudo
					routeEvent && this.trigger(routeEvent + ':after');
					break;
				}
			}

			notfound && this.trigger('undefined');
			/*jshint loopfunc:false */
		},

		navigate: function(route, trigger){
			if (location.hash === route && trigger){
				this.handleChange();
			}
			else {
				location.hash = route;
			}
		},

		normalize: function(path, keys, sensitive, strict){
			// normalize by https://github.com/visionmedia/express
			if (path instanceof RegExp) return path;

			path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,function(_, slash, format, key, capture, optional){

				keys.push({
					name: key,
					optional: !!optional
				});

				slash = slash || '';

				return [
					(optional ? '' : slash),
					'(?:',
					(optional ? slash : ''),
					(format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')',
					(optional || '')
				].join('');
			}).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.*)');

			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		},

		addRoute: function(obj){
			// adds a new route, expects keys @route (string), @id (string), @events (object)
			if (!obj || !obj.route || !obj.id || !obj.events)
				return this.trigger('error', 'Please include route, id and events in the argument object when adding a route');

			if (!obj.id.length)
				return this.trigger('error', 'Route id cannot be empty, aborting');

			if (this.routes[obj.route])
				return this.trigger('error', 'Route "{route}" or id "{id}" already exists, aborting'.substitute(obj));


			this.routes[obj.route] = obj.id;
			this.on(this.boundEvents[obj.route] = obj.events);

			return this.trigger('route:add', obj);
		},

		removeRoute: function(route){
			if (!route || !this.routes[route] || !this.boundEvents[route])
				return this.trigger('error', 'Could not find route or route is not removable');

			this.off(this.boundEvents[route]);

			delete this.routes[route];
			delete this.boundEvents[route];

			return this.trigger('route:remove', route);
		}

	});
});

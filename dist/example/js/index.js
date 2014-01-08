require.config({
	baseUrl: '../../',
	paths: {
		examples: 'example/js/',
		util: 'example/util/',
		components: 'lib/components',
		primish: 'components/primish',
		lodash: 'components/lodash/dist/lodash',
		slicker: 'components/slicker/index',
		io: '/socket.io/socket.io',
		hbs: 'components/require-handlebars-plugin/hbs'
	},
	hbs: {
		helpers: true,
		i18n: false,
		templateExtension: 'hbs',
		partialsUrl: ''
	},
	urlArgs: 'burst=' + (+new Date())
});

define(function(require){

	var transport = new (require('util/transport'))(),
		epik = require('lib/index'),
		primish = epik.primish,
		_ = epik._,
		Router = require('lib/router'),
		Collection = require('lib/collection'),
		Menu = require('util/menu-vc');

	var Examples = primish({
		extend: Collection
	});

	var createRouter = function(routes){
		var obj = {
			routes: {
				'': 'index'
			},
			onBefore: function(id){
				menu.render();
				document.querySelector('.menu-' + id).className += ' active';
				console.clear();
				console.info('loaded ' + id);
			},
			onUndefined: function(){
				this.navigate('');
			}
		};

		var capitalize = function(string){
			string = string.split('');
			string[0] = string[0].toUpperCase();
			return string.join('');
		};

		var prefix = '#!';

		_.forEach(routes, function(route){
			obj.routes[prefix + route.title] = route.title;
			obj['on' + capitalize(route.title)] = function(){
				require(['example/js/' + route.title], function(example){
					console.info('ready ' + route.title);
					typeof example === 'function' && example();
				});
			};
		});

		return new Router(obj);
	};

	var menu = new Menu({
		element: document.getElementById('menu'),
		collection: new Examples([]),
		'onCollection:reset': function(){
			this.router || (this.router = createRouter(this.collection.toJSON()));
			this.render();
		}
	});

	transport.subscribe('demos:get', function(demos){
		menu.collection.reset(demos);
	});
	transport.send('demos:get');
});

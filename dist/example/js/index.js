require.config({
	baseUrl: '../../',
	paths: {
		examples: 'example/js/',
		util: 'example/util/',
		components: 'lib/components',
		primish: 'components/primish',
		lodash: 'components/lodash/dist/lodash',
		slicker: 'components/slicker/index',
		rivets: 'components/rivets/dist/rivets',
		'rivets-adapter': 'lib/plugins/rivets-adapter',
		io: '/socket.io/socket.io',
		hbs: 'components/require-handlebars-plugin/hbs',
		text: 'example/util/text'
	},
	hbs: {
		helpers: true,
		i18n: false,
		templateExtension: 'hbs',
		partialsUrl: ''
	}
	// urlArgs: 'burst=' + (+new Date())
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
				var active = document.querySelector('.menu-item.active');
				active && (active.className = active.className.replace('active', ''));
				active = document.querySelector('#' + id);
				active && (active.className += ' active');
				document.getElementById('example').innerHTML = '<h2>'+ id +'</h2>';
				console.clear();
				console.info('loaded ' + id);
			},
			onUndefined: function(){
				this.navigate('');
			},
			onIndex: function(){
				console.log('welcome');
			}
		};

		var capitalize = function(string){
			string = string.split('');
			string[0] = string[0].toUpperCase();
			return string.join('');
		};

		var prefix = '#!';

		_.forEach(routes, function(route){
			if (route.title === 'index' || route.title === 'router')
				return;

			obj.routes[prefix + route.title] = route.title;
			obj['on' + capitalize(route.title)] = function(){
				require(['example/js/' + route.title], function(example){
					typeof example === 'function' && example();
				});
			};
		});

		return new Router(obj);
	};

	var menu = new Menu({
		element: document.querySelector('#menu .container'),
		collection: new Examples([]),
		'onCollection:set': function(){
			this.router || (this.router = createRouter(this.collection.toJSON()));
			this.render();
		}
	});

	transport.subscribe('demos:get', function(demos){
		menu.collection.set(demos);
	});
	transport.send('demos:get');
});

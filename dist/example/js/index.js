require.config({
	baseUrl: '../../',
	paths: {
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
	}
});

define(function(require){

	var transport = new (require('util/transport'))(),
		primish = require('primish/primish'),
		collection = require('lib/collection'),
		Menu = require('util/menu-vc');

	var Examples = primish({
		extend: collection
	});

	var menu = new Menu({
		element: document.getElementById('menu'),
		collection: new Examples(),
		'onCollection:reset': function(){
			this.render();
		}
	});

	transport.subscribe('demos:get', function(demos){
		menu.collection.reset(demos);
	});
	transport.send('demos:get');
});
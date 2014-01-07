require.config({
	baseUrl: '../../',
	paths: {
		components: 'lib/components',
		primish: 'components/primish',
		lodash: 'components/lodash/dist/lodash',
		slicker: 'components/slicker/index',
		io: 'components/socket.io-client/dist/socket.io.min',
		hbs: 'components/require-handlebars-plugin/hbs'
	},
	hbs: { // optional
		helpers: true,
		i18n: false,
		templateExtension: 'hbs',
		partialsUrl: ''
	}
});

define(function(require){
	var io = require('io'),
		epik = require('lib/index'),
		collection = require('lib/collection'),
		menuTpl = require('hbs!example/menu'),
		primish = epik.primish,
		Examples = primish({
			extend: collection
		}),
		examples = new Examples([], {
			onReset: function(){
				var menu = document.getElementById('menu'),
					examples = this.toJSON();

				menu.innerHTML = menuTpl(examples);
			}
		}),
		socket = io.connect('ws://' + location.host);

	socket.on('connect', function(){
		socket.on('demos:get', function(demos){
			examples.reset(demos);
		});
		socket.emit('demos:get');
	});
});
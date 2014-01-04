require.config({

	baseUrl: '../',

	paths: {
		primish: 'lib/components/primish',
		lodash: 'lib/components/lodash/dist/lodash',
		slicker: 'lib/components/slicker/index'
	}
});

define(['lib/index', 'lib/router'], function(epik, router){

	var AppRouter = new router({
		// routes definition will proxy the events
		routes: {
			'': 'index',
			'#!help': 'help',
			'#!test1/:query/:id?': 'test1',
			'#!test2/:query/*': 'test2',
			'#!error': 'dummyerror'
		},
		// router init
		onReady: function(){
			console.log('init');
		},
		// before route method, fires before the event handler once a match has been found
		onBefore: function(routeId){
			console.log('before', routeId);
		},
		// specific pseudos for :before
		'onIndex:before': function(){
			console.log('we are about to go to the index route');
		},
		// specific pseudos for after
		'onIndex:after': function(){
			console.log('navigated already to index route, update breadcrumb?');
		},
		// after route method has fired, post-route event.
		onAfter: function(route){
			console.info('after', route);
		},
		// routes events callbacks are functions that call parts of your app
		// index
		onIndex: function(){
			// we want to always have a state
			this.navigate('#!/');
		},
		onHelp: function(){
			console.log('help');
			console.log(this.route, this.req, this.param, this.query)
		},
		onTest1: function(query, id){
			console.info('test1', query, id);
			console.log(this.route, this.req, this.param, this.query)
		},
		onTest2: function(query){
			console.info('test2', query);
			console.log(this.route, this.req, this.param, this.query)
		},
		// no route event was found, though route was defined
		onError: function(error){
			console.error(error);
			// recover by going default route
			this.navigate('');
		},
		onUndefined: function(){
			console.log('this is an undefined route');
		},
		'onRoute:remove': function(route){
			alert(route + ' was removed by popular demand');
		},
		'onRoute:add': function(constructorObject){
			console.log(constructorObject.id + ' was added as a new route');
		}
	});
});
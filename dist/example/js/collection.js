require.config({
	baseUrl: '../../',
	paths: {
		components: 'lib/components',
		primish: 'components/primish',
		lodash: 'components/lodash/dist/lodash',
		slicker: 'components/slicker/index'
	}
});

define(['lib/index', 'lib/collection'], function(epik, collection){

	var	primish = epik.primish;

	var Persons = primish({

		extend: collection

	});

	var peeps = new Persons([{
		name: 'Bob',
		surname: 'Roberts'
	}, {
		name: 'Rob',
		surname: 'Boberts'
	}]);


	var one = peeps.at(0);

	peeps.forEach(function(model){
		console.log(model);
	});

	peeps.on('change', function(model, etc) {
		console.log('changed props', model);
	});

	peeps.listenTo(one, 'change:foo', function(){
		console.log('foo has changed');
	});

	one.set('foo', 'bar');

	//console.log(peeps, peeps.toJSON());

});
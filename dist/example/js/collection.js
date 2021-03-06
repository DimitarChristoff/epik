define(function(require){
	return function(){
		var epik = require('epik/index'),
			collection = require('epik/collection'),
			primish = epik.primish;

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

		peeps.forEach(function(model, index){
			console.log(index, model);
		});

		peeps.on('change', function(model, etc) {
			console.log('changed props', model);
		});

		peeps.listenTo(one, 'change:foo', function(){
			console.log('foo has changed');
		});

		one.set('foo', 'bar');

	};
});

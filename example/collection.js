define(['../lib/index', '../lib/collection'], function(epic, collection){

	var	primish = epic.primish,
		_ = epic._;

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

	console.log(peeps, peeps.toJSON());


	peeps.forEach(function(model){
		console.log(model);
	})
});
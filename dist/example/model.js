require.config({

	baseUrl: '../../',

	paths: {
		primish: 'lib/components/primish',
		lodash: 'lib/components/lodash/dist/lodash',
		slicker: 'lib/components/slicker/index'
	}
});

define(['lib/index', 'person'], function(epik, Person){

	var	_ = epik._;

	var bob = new Person({
		job: 'accountant',
	}, {
		onChange: function(keys){
			console.log(keys);
		},
		'onChange:one': function(value){
			console.log('one changed to ' + value);
		},
		onEmpty: function(){
			console.log('emptied', this.toJSON());
		},
		onError: function(errors){
			console.warn('WARNING: validation errors have occurred');
			_.forEach(errors, function(error){
				console.log('rejected ' + error.key + ' => ' + error.value + ' hint: ' + error.error);
			});
		}
	});

	console.log(bob.get('id'));
	console.log(bob.toJSON());

	bob.set({
		age: bob.get('age') + 1,
		name: 'Bob'
	});

	bob.set('name', 'Bobby');

	console.log(bob.get(['name', 'surname', 'age']));

	bob.set({
		age: 31.5,
		name: 'bob'
	});
	bob.empty();

});
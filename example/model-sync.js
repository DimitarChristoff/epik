require.config({

	baseUrl: '../',

	paths: {
		primish: 'lib/components/primish',
		lodash: 'lib/components/lodash/dist/lodash'
	}
});

define(['lib/index', 'lib/model-sync'], function(epik, model){

	var	primish = epik.primish,
		_ = epik._;

	var Person = primish({

		extend: model,

		options: {
			defaults: {
				name: 'Robert',
				surname: 'Roberts',
				age: 30
			}
		},

		validators: {
			age: function(value){
				return parseInt(value, 10) == value ? true : 'Age needs to be an integer';
			},
			name: function(value){
				return (value.charAt(0).toLowerCase() !== value.charAt(0)) || 'Name needs to be capitalized';
			}
		}

	});

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
		},
		onFetch: function(){
			console.log('fetched', this.toJSON());
		},
		onFailure: function(response){
			console.log('sync error occurred', response.status);
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

	bob.set({
		id: '1.json',
		urlRoot: 'api/users'
	});

	bob.on('requestFailure', function(){
		console.count('here');
		this.set('lastUpdated', +(new Date()));
		this.fetch();
	});

	bob.save();
});
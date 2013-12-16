define(['../lib/index', '../lib/model'], function(epitome, Model){
	'use strict';

	var Person = new epitome.primish({
		options: {
			defaults: {
				name: 'Robert',
				surname: 'Roberts',
				age: 30
			}
		},
		validators: {
			age: function(value){
				return value > this.options.defaults.age;
			}
		},
		extend: Model
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
	bob.empty();

});
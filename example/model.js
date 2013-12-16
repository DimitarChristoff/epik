define(['../lib/model'], function(model){
	'use strict';

	var m = new model({
		one: 1
	}, {
		defualts: {
			name: 'Robert'
		},
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

	console.log(m.toJSON());

	m.set({
		one: m.get('one') + 1,
		name: 'Bob'
	});

	m.set('name', 'Bobby');
	m.empty();
});
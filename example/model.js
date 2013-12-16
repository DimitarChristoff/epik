define(['../lib/model'], function(model){
	'use strict';

	var m = new model({
		one: 1
	});

	console.log(m.toJSON());
});
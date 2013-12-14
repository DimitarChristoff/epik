require.config({
	paths: {
		primish: '../lib/components/primish',
		lodash: '../lib/components/lodash/dist/lodash'
	}
});

define(['../lib/model'], function(model){
	'use strict';

	console.log(model);
	var m = new model({
		one: 1
	});

	console.log(m);
});
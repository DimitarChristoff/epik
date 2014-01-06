require.config({

	baseUrl: '../../',

	paths: {
		primish: 'lib/components/primish',
		lodash: 'lib/components/lodash/dist/lodash',
		slicker: 'lib/components/slicker/index'
	}
});

define(['lib/index', 'lib/collection-sync'], function(epik, collection){

	var	primish = epik.primish;

	var Persons = primish({

		extend: collection,

		options: {
			urlRoot: 'api/collection/response.json'
		}
	});

	var peeps = new Persons(null, {
		onFetch: function(){
			console.log(this.toJSON());
		}
	});


	peeps.fetch();

	//console.log(peeps, peeps.toJSON());

});
define(function(require){
	return function(){
		var epik = require('lib/index'),
			collection = require('lib/collection-sync'),
			primish = epik.primish;

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
	};
});

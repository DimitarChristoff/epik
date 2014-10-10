define(function(require){
	return function(){
		var epik = require('epik/index'),
			Person = require('example/util/person'),
			_ = epik._;

		var bob = new Person({
			job: 'accountant',
			id: 1
		}, {
			urlRoot: '/api/users',
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

		console.log(bob.toJSON());

		bob.set();

		bob.set('name', 'Bobby');

		bob.on('fetch:once', function(){
			this.set({
				lastUpdated: +(new Date()),
				age: this.get('age') + 1,
			});

			this.on('save:once', function(){
				console.log('saved, getting from server again...');
				this.fetch();
			});
			this.save();

		});

		bob.fetch();
	};
});

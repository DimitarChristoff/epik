define(function(require){
	return function(){
		var storage = require('lib/storage'),
			Person = require('example/util/person');

		// get session storage from factory
		var sessionStorage = storage.sessionStorage();

		// mix it into existing protoype.
		Person.implement(new sessionStorage());


		var bob = new Person({
			id: 'bob'
		}, {
			onRetrieve: function(model) {
				console.log('read from storage', model)
			},
			onEliminate: function() {
				console.log('model removed from storage');
				console.log(this.retrieve());
			},
			onStore: function(model) {
				console.log('saved into storage', model);
			}
		});

		var savedBob = bob.retrieve();
		if (savedBob){
			bob.set(savedBob);
		}

		console.log(bob.toJSON());

		bob.set({
			age: bob.get('age') + 1,
			updated: +new Date()
		});

		bob.store();
	};
});

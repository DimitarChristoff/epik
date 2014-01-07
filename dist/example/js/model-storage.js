require.config({
	baseUrl: '../../',
	paths: {
		components: 'lib/components',
		primish: 'components/primish',
		lodash: 'components/lodash/dist/lodash',
		slicker: 'components/slicker/index'
	}
});

define(['lib/index', 'lib/model', 'lib/storage', 'example/js/person'], function(epik, model, storage, Person){

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
});
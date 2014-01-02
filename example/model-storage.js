require.config({

	baseUrl: '../',

	paths: {
		primish: 'lib/components/primish',
		lodash: 'lib/components/lodash/dist/lodash',
		slicker: 'lib/components/slicker/index'
	}
});

define(['lib/index', 'lib/model', 'lib/storage'], function(epic, model, storage){

	var	primish = epic.primish;

	var Person = primish({

		extend: model,

		implement: [storage.sessionStorage()],

		options: {
			defaults: {
				name: 'Robert',
				surname: 'Roberts',
				age: 30
			}
		}
	});

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
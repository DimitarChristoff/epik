var ModelSync = this.epik.model.sync,
	CollectionSync = this.epik.collection.sync,
	primish = this.primish,
	buster = this.buster;

buster.testCase('Basic epik empty collection via sync creation >', {
	setUp: function() {
		this.timeout = 1000;
		var testModel = primish({
			extend: ModelSync
		});

		this.CollectionProto = primish({

			extend: CollectionSync,

			options: {
				urlRoot: 'example/api/collection/response.json'
			},

			model: testModel
		});

		this.collection = new this.CollectionProto(null);
	},

	tearDown: function() {
		this.collection.empty();
		this.collection.offAll();
	},

	'Expect a collection to be created >': function() {
		buster.assert.isTrue(this.collection instanceof CollectionSync);
	},

	'Expect a collection to have fetch >': function() {
		buster.assert.isTrue(typeof this.collection.fetch === 'function');
	},

	'Expect models to fetch >': function(done) {
		this.collection.on('fetch', function(){
			buster.assert.equals(this.length, 10);
			done();
		});

		this.collection.fetch();
	},

	'Expect failed fetch to fire an event >': function(done){
		this.collection.request.url(this.collection.options.urlRoot + '404');
		this.collection.on('requestFailure', function(){
			buster.assert.equals(this.length, 0);
			done();
		});
		this.collection.fetch();
	}
});
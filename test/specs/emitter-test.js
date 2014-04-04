var primish = this.primish,
	emitter = this.epik.emitter,
	buster = this.buster;

buster.testRunner.timeout = 1000;

buster.testCase('Extended emitter functionality', {
	setUp: function(){
		var classy = primish({
			implement: emitter
		});


		this.classA = new classy;
		this.classB = new classy;
	},

	tearDown: function(){
		this.classA = this.classB = null;
	},

	'Should be able to subscribe to all events w/o a fn and bubble locally >': function(){
		this.classA.listenTo(this.classB);
		var spy = this.spy();

		this.classA.on('foo', spy);

		this.classB.trigger('foo', 'bar');
		buster.assert.calledWith(spy, 'bar');
	},

	'Should be able to subscribe to a particular event locally w/o a fn and bubble >': function(){
		this.classA.listenTo(this.classB, 'foo');
		var spy = this.spy();

		this.classA.on('foo', spy);

		this.classB.trigger('foo', 'bar');
		buster.assert.calledWith(spy, 'bar');
	},

	'Should be able to subscribe to all events w/ a fn and bubble locally with event name >': function(){
		var spy = this.spy();
		this.classA.listenTo(this.classB, spy);

		this.classB.trigger('foo', 'bar');
		buster.assert.calledWith(spy, 'foo', 'bar');
	},

	'Should be able to remove all own subscribers >': function(){
		var spy = this.spy(),
			spyLocal = this.spy();
		this.classA.listenTo(this.classB, spy);

		this.classB.on('foo', spyLocal);
		this.classB.offAll();
		this.classB.trigger('foo', 'bar');
		buster.refute.called(spy);
		buster.refute.called(spyLocal);
	},

	'Should be able to remove subscribers of a particular type >': function(){
		var spy = this.spy(),
			spyLocal = this.spy();

		this.classA.listenTo(this.classB, 'foo');
		this.classB.on('bar', spyLocal);
		this.classB.offAll('foo');
		this.classB.trigger('foo');
		this.classB.trigger('bar');
		buster.refute.called(spy);
		buster.assert.called(spyLocal);
	},

	'Should be able to stop listening to subscribed events from other instances >': function(){
		this.classA.listenTo(this.classB);
		var spy = this.spy();

		this.classA.on('foo', spy);

		this.classA.stopListening(this.classB);
		this.classB.trigger('foo', 'bar');
		buster.refute.called(spy);
	},

	'Should be able to stop listening to a particular subscribed event from other instances >': function(){
		this.classA.listenTo(this.classB, 'foo').listenTo(this.classB, 'bar');
		var spy = this.spy(),
			spy2 = this.spy();

		this.classA.on('foo', spy);
		this.classA.on('bar', spy2);

		this.classA.stopListening(this.classB, 'foo');
		this.classB.trigger('foo');
		this.classB.trigger('bar');

		buster.refute.called(spy);
		buster.assert.called(spy2);
	}

});

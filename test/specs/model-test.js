var Model = this.epic.model,
	_ = this.epic._,
	primish = this.primish,
	buster = this.buster;

buster.testRunner.timeout = 1000;

buster.testCase('Basic epic model creation with initial data >', {
	setUp: function(){
		var self = this;

		this.dataInitial = {
			foo: 'bar',
			id: '1234-5123'
		};

		this.dataAfter = {
			bar: 'foo'
		};

		this.dataMany = {
			foo: 'one',
			bar: 'two',
			charlie: 'winning'
		};

		this.options = {
			'onChange:foo': function(){
				self.initialEvents = true;
			},
			defaults: {
				foo: 'not bar',
				name: 'dimitar'
			}
		};

		this.initialEvents = false;

		this.getModel = function(){
			return new Model(this.dataInitial, this.options);
		};

	},

	'Expect a model to be created >': function(){
		var model = this.getModel.call(this);
		buster.assert.isTrue(model instanceof Model);
	},

	'Expect the _attributes object to contain the sent values >': function(){
		var testVal = 123;
		var model = this.getModel.call(this);
		model.set('testing', testVal);
		buster.assert.equals(testVal, model._attributes['testing']);
	},

	'Expect the model to have the default value if not overridden >': function(){
		var model = this.getModel.call(this);
		buster.assert.equals(model.get('name'), this.options.defaults.name);
	},

	'Expect the model to have the default value overridden by model object >': function(){
		var model = this.getModel.call(this);
		buster.refute.equals(model.get('foo'), this.options.defaults.foo);
	},

	'Expect a model not to fire initial change events on set >': function(){
		this.getModel.call(this);
		buster.assert.isFalse(this.initialEvents);
	},

	'Expect a model change not to fire if values have not changed >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.on('change', function(){
			spy();
		});
		model.set(this.dataInitial);
		buster.refute.called(spy);
	},

	'Expect a model change on non-primitive values that serialize to the same not to fire >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.set('obj', {
			foo: 'bar'
		});
		model.on('change', function(){
			spy();
		});
		model.set('obj', {
			foo: 'bar'
		});
		buster.refute.called(spy);
	},


	'Expect a model change to fire if values have changed >': function(done){
		var self = this;
		var model = this.getModel.call(this);
		model.on('change:bar', function(val){
			buster.assert.equals(val, self.dataAfter.bar);
			done();
		});

		model.set(this.dataAfter);
	},

	'Expect a model to fire change event for each property passed >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.on('change', function(){
			spy();
		});

		model.set(this.dataMany);
		buster.refute.calledThrice(spy);
	},

	'Expect a key that is not on model to be null >': function(){
		var model = this.getModel.call(this);
		buster.assert.isNull(model.get('foobar'));
	},

	'Expect that setting to null removes from model >': function(){
		var model = this.getModel.call(this);
		model.set('foo', null);
		buster.assert.isNull(model.get('foo'));
	},

	'Expect .unset() removes from model >': function(){
		var model = this.getModel.call(this);
		model.unset('foo');
		buster.assert.isNull(model.get('foo'));
	},

	'Expect .unset([array]) removes all keys from model >': function(){
		var model = this.getModel.call(this);
		var keys = _.keys(this.dataMany),
			data;

		// put some values in
		model.set(this.dataMany);

		// remove them
		model.unset(keys);

		// see what's left, should be null,null,null so an empty array.
		data = _.values(model.get(keys)).filter(function(el){
			return el !== null;
		});

		buster.assert.equals(data.length, 0);
	},


	'Expect model.toJSON to return an object >': function(){
		var model = this.getModel.call(this);
		buster.assert(_.isObject(model.toJSON()));
	},

	'Expect model.toJSON to return a dereferenced object >': function(){
		var model = this.getModel.call(this);
		var json = model.toJSON(),
			testStr = 'testing';

		json.foo = testStr;
		buster.refute.equals(model.get('foo'), json.foo);
	},

	'Expect model to fire a change passing all changed properties as an object >': function(){
		var self = this;
		var model = this.getModel.call(this);
		var before = model.toJSON();
		model.on('change', function(changed){
			if (changed.length !== 3) {
				console.log(before);
			}
			buster.assert.equals(changed, _.keys(self.dataMany));
		});

		model.set(this.dataMany);
	},

	'Expect model accessor `get` to fire instead of normal model get >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.properties = _.merge({
			foo: {
				get: function(){
					spy();
					return 'intercept';
				}
			}
		}, model.properties);

		model.get('foo');
		buster.assert.calledOnce(spy);
	},

	'Expect model accessor `get` to prefer custom value over model value >': function(){
		var newFoo = 'not old foo';
		var model = this.getModel.call(this);
		model.properties = _.merge({
			foo: {
				get: function(){
					return newFoo;
				}
			}
		}, model.properties);

		buster.assert.equals(model.get('foo'), newFoo);
	},

	'Expect model accessor `set` to fire instead of model set, passing the value >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.properties = _.merge({
			foo: {
				set: spy
			}
		}, model.properties);

		model.set('foo', 'bar');
		buster.assert.calledWith(spy, 'bar');
	},

	'Expect empty to fire the event and empty the model >': function(){
		var model = this.getModel.call(this);
		model.on('empty', function(){
			buster.assert.equals(this._attributes, {});
		});

		model.empty();
	},

	'Expect empty to fire the change event with all model properties >': function(){
		var model = this.getModel.call(this);
		var keys = _.keys(model.toJSON());

		model.on('change', function(properties){
			buster.assert.equals(properties, keys);
		});

		model.empty();
	}

});


buster.testCase('epic model validators >', {
	setUp: function(){
		this.dataInitial = {
			name: 'Bob'
		};

		this.dataPass = {
			age: 38
		};

		this.dataFail = {
			age: 31.5,
			name: 'bob'
		};

		this.errorMsg = 'Age needs to be an integer';

		var ModelProto = primish({

			extend: Model,

			validators: {
				age: function(value){
					return parseInt(value, 10) == value ? true : 'Age needs to be an integer';
				},
				name: function(value){
					return (value.charAt(0).toLowerCase() !== value.charAt(0)) || 'Name needs to be capitalized';
				}
			}
		});

		this.getModel = function(){
			return new ModelProto(this.dataInitial);
		};
	},

	'Expect model to set value when validation passes >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.on('change:age', spy);
		model.set(this.dataPass);

		buster.assert.calledWith(spy, this.dataPass.age);
	},

	'Expect no errors to be fired when validation passes >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.on('error', spy);
		model.set(this.dataPass);

		buster.refute.called(spy);
	},

	'Expect model not to set value when validation fails >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.on('change:age', spy);
		model.set(this.dataFail);

		buster.refute.calledWith(spy, this.dataPass.age);
	},

	'Expect error to fire when validation fails >': function(){
		var spy = this.spy();
		var model = this.getModel.call(this);
		model.on('error', spy);
		model.set(this.dataFail);

		buster.assert.calledOnce(spy);
	},

	'Expect error per key to fire when validation fails >': function(done){
		var msg = this.errorMsg;
		var model = this.getModel.call(this);
		model.on('error:age', function(errorObj){
			buster.assert.equals(msg, errorObj.error);
			done();
		});
		model.set(this.dataFail);
	},

	'Expect error event to pass the failed validation and error msg >': function(done){
		var msg = this.errorMsg;
		var model = this.getModel.call(this);
		model.on('error', function(errors){
			var error = _.filter(errors, function(el){
				return el.key === 'age';
			})[0];

			buster.assert.equals(error.error, msg);
			done();
		});
		model.set(this.dataFail);
	},

	'Expect error event to pass all failed validation objects >': function(){
		var self = this;
		var model = this.getModel.call(this);
		model.on('error', function(errors){
			buster.assert.equals(errors.length, Object.keys(self.dataFail).length);
		});
		model.set(this.dataFail);
	}
});
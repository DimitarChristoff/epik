var Model = this.epik.model,
	View = this.epik.view,
	_ = this.epik._,
	primish = this.primish,
	buster = this.buster,
	$ = this.jQuery;

buster.testRunner.timeout = 1000;

buster.testCase('Basic epik view test >', {
	setUp: function(){

		this.data = {
			name: 'View',
			type: 'test'
		};

		this.element = document.createElement('div');
		document.body.appendChild(this.element);

		var self = this,
			viewProto = primish({

				extend: View,

				options: {
					template: 'This is a <%=name%> <%=type%> render app <button></button>',
					element: this.element,
					events: {
						click: 'handleClick',
						'click button': 'handleDelegated'
					}
				},

				render: function(){
					this.$element.html(this.template(self.data));
					this.parent('render');
				}
			});

		this.model = new Model({
			name: 'bob'
		});

		this.view = new viewProto({
			model: this.model,
			element: this.element
		});
	},

	tearDown: function(){
		this.view.destroy();
		this.view.offAll();

	},

	'Expect the view to have an element >': function(){
		buster.assert.equals(this.element, this.view.element);
	},

	'Expect the view to render and call the onRender event >': function(){
		var spy = this.spy();
		this.view.on('render', spy);
		this.view.render();
		buster.assert.called(spy);
	},

	'Expect the .template to change based upon data >': function(){
		var data1 = this.view.template(this.data),
			data2 = this.view.template({
				name: 'foo',
				type: 'fail'
			});

		buster.refute.equals(data1, data2);
	},

	'Expect the view to render the compiled template >': function(done){
		this.view.on('render', function(){
			buster.assert.contains(this.$element.html(), 'This is a View test render app');
			done();
		});
		this.view.render();
	},

	'Expect the events to be added to the element from options event map >': function(){
		buster.assert.defined($._data(this.view.element, 'events').click);
	},

	'Expect the events on the element to bubble to class instance >': function(){
		var spy = this.spy();
		this.view.on('handleClick', spy);
		this.view.$element.click();
		buster.assert.called(spy);
	},

	'Expect the delegated events on children of element to bubble to class instance >': function(){
		var spy = this.spy();
		this.view.on('handleDelegated', spy);
		var event = $.Event('click');
		event.target = this.view.$element.find('button')[0];

		this.view.$element.trigger(event);
		buster.assert.called(spy);
	},


	'Expect a view to be able to listenTo any model changes >': function(){
		var spy = this.spy();
		this.view.on('model:change', spy);

		this.model.set('name', 'garry');
		buster.assert.called(spy);
	}

});
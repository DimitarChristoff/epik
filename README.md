epik
====

epitome 2 for primish and lodash, no depenency on mootools

> this is an experiment. if you like primish, mootools and epitome, feel free to contribute. otherwise, don't use.

## Contributing

Whilst this is being ported, you can help. Fork the repo or ask for commit access.

```sh
$ git clone git@github.com:DimitarChristoff/epik.git
...
$ cd epik/
$ npm i
...
$ bower install
...
$ cd test/
$ buster-static
...
```

Examples - run a grunt express server with socket.io etc. Install grunt if you don't have it, then run from root of the repo.

```sh
$ npm install -g grunt-cli
$ grunt
```

Then open your browser and go to http://locahost:8000/example/



## Getting started

Via bower:
```sh
$ bower install epik --save
```

For node:
```sh
$ npm install epik --save
```


## View

The view is very un-assuming. It can work with either DOM library (jquery, jquery-lite, zepto) and a templating
engine like handlebars or lodash.template. It can also work with a template binding engine like rivets.js. A combination
of both is also possible.

### constructor

---
<div class="alert">
<p>
_Expects arguments: `(Object) options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `ready`_
</p>
</div>

The default view is a pretty loose binding around a HTMLElement, it does not try to do much by default. It essentially binds an element to either a Model or a Collection, listening and propagating events that they fire in order to be able to react to them. It has glue to pass DOM events delegating into the element to the instance as events or by calling methods on the instance, when possible.

The expectation is that a `render` method will be defined that uses the data to output it in the browser. How the render can be called is up to you, eg. on `change` or `reset` events.

A single argument in the shape of an `options` Object is passed to the constructor of the View. It is expected to have special 'mutator'-like properties and key properties that it stores for future use.

Significant keys to the options passed in are:

* `element` - a String id or an element to bind events to and reference
* `model` - optional Model instance structure to bind to. Exchangeable with `collection`
* `collection` - optional Collection instance to bind to. Exchangeable with `model`
* `template` - a String of raw HTML that defines the raw template to use in output.
* `events` - an Object with MooTools style event bindings to apply to the `element`, delegated or not. values are implied event handlers on the instance
* `onEventHandlers` - code that reacts to various events that the instance fires.

Epik views do not support the `tag` options of Backbone, you need to figure the elements on your own.

```ace
define(function(require){

	var epik = require('epik/index'),
		primish = epik.primish,
		View = require('epik/view'),
		Model = require('epik/model'),
		tpl = 'I am template <a href="#" class="task-remove"><%=name%></a><br/><button class="done">done</button>',


	var testView = primish({

		extend: View,

		options: {
			events: {
				'click a.task-remove': 'removeTask',
				'click button.done': 'reset'
			}
		}

		render: function() {
			this.empty();
			this.$element.html(this.template(this.model.toJSON()));
			this.parent('render');
			return this;
		},

		reset: function() {
			this.model.empty();
			this.render();
		}
	});


	var testInstance = new testView({

		model: Model({name: 'View fun'}),

		element: 'main',

		template: tpl,

		onReady: function() {
			this.render();
		},

		'onModel:change': function(){
			this.model.set('name', new Date().getTime());
			this.render();
		},

		onRemoveTask: function(event, element) {
			event && event.preventDefault && event.preventDefault();
			console.log(element); // a.task-remove
			this.model.set('status', 'archived');
		}
	});
});
```

### render
---
<div class="alert">
<p>
_Expects arguments: unknown_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `render`_
</p>
</div>

It is essential that this method is defined in your View prototype declaration. It does not assume to do anything by default, you _need_ to define how the output takes place and how your data is being used. For convenience, it has access to either `this.model` or `this.collection` as the source of data that can be be passed to the [template](#view/template) method. It is expected that at the bottom of your definition, `this.parent('render')` is called in order for the `render` event to fire, though you can manually do a `this.trigger('render')` instead, if you want.

### setElement
---
<div class="alert">
<p>
_Expects arguments: `(Mixed) element`, optional `(Object) events`_
</p>
<p>
_Returns: `this`_
</p>
</div>

A public method that allows you to change or set an element that powers a view. If called the first time, it will get the Element (through `jQuery()`) and save the reference in `this.element` as well as `this.$element` to the wrapped jQuery object. If an events object is passed, it will bind the events. If called a second time, it will unbind all events on the old element, change the element reference and rebind any new events.

### template
---
<div class="alert">
<p>
_Expects arguments: `(Object) data`, optional `(String) template`_
</p>
<p>
_Returns: compiled template or function._
</p>
</div>

A simple sandbox function where you can either use the lodash templating engine or call an external engine like Mustache, Handlebars, Hogan etc. The second argument is optional and if not supplied, it will revert to `this.options.template` instead.

An example override to make it work with Mustache would be:
```javascript
var myView = primish({
    extends: Epitome.View,
    template: function(data, template) {
        template = template || this.options.template;
        return Mustache.render(template, data);
    },
    render: function() {
        this.$element.html(this.template({name:'there'}, 'Hello {{name}}'));
    }
});
```

You can change the View prototype to always have Mustache in your views. For example, via AMD/RequireJS, you could do a
small module that deals with the prototyping of the default View constructor. Say, `epitome-view-mustache.js`
```javascript

define(['epik/view'], function(View){
	// for everyone to use mustache in every view instance when .template()

	View.prototype.template = function(data, template) {
		// refactor this to work with any other template engine in your constructor
		template = template || this.options.template;

		return Mustache.render(template, data);
	}

	return View;
});
```

### empty
---
<div class="alert">
<p>
_Expects arguments: `(Boolean) soft`_
</p>
<p>
_Returns: this._
</p>
<p>
_Events: `empty`_
</p>
</div>

By default, it will empty the element through making `innerHTML` an empty string, calling GC on all child nodes. If the `soft` argument is true, will apply `this.$element.empty()`, which is a jQuery method that removes all child nodes without destroying them.

### dispose
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: this._
</p>
<p>
_Events: `dispose`_
</p>
</div>

Will detach `this.$element` from the DOM. It can be injected again later on.

### destroy
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: this._
</p>
<p>
_Events: `dispose`_
</p>
</div>

Removes and destroys `this.$element` from the DOM and from memory. You need to use [setElement](#view/setelement) to add a new one if you want to re-render.


## View rivets-adapter

There is an adapter for rivets.js provided, which does the following customisations:

 - prefix is `ep-` for your data bindings
 - the adapter suffix is `#`

Example view implementation:
```ace
define(function(require){

	var epik = require('epik/index'),
		primish = epik.primish,
		View = require('epik/view'),
		Model = require('epik/model'),
		rivets = require('epik/plugins/rivets-adapter');

	var MyView = primish({
		extend: View,
		options: {
			template: ''
		},
		constructor: function(options){
			this.parent('constructor', options);
			this.element.innerHTML = this.options.template;
			rivets.bind(this.element, {
				person: this.model
			});
		}
	});

	var person = new Model({
		name: 'Bob'
	});

	// new view with bi-directional binding between model and dom.
	var myView = new MyView({
		element: document.getElementById('main'),
		model: person,
		template: 'Name: <span ep-text="person#name"></span><br/><input ep-value="person#name"/>'
	});

	setTimeout(function(){
		person.set('name', 'Robert');
	}, 1500);
});
```

Any change of the model will fire events which the adapter is listening for and will automatically update the view
for the relevant bound nodes. Conversely, changes from the DOM via conventional `onChange` events will be exported
to the model's `.set()` method (subject to validation rules).

Collections are similarly implemented. Notice the use of `ep-` as opposed to `rv-` and the `#` call to pass through
the epik adapter (the rivets default PJSO one is `.` and it can still be used)

The full spectrum of Rivets.js API will work as expected.
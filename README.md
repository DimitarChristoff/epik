epik
====

epitome 2 for primish and lodash, no depenency on mootools

> this is an experiment. if you like primish, mootools and epitome, feel free to contribute. otherwise, don't use.


## Getting started

Via bower:
```sh
$ bower install epik --save
```

For node:
```sh
$ npm install epik --save
```

### AMD configuration

You can use epik in a number of ways.

In development, you can let requirejs fetch all dependencies as needed. A typical require.config looks like this:

```javascript
require.config({
	paths: {
			epik: '../bower_components/epik/lib',
			'rivets-adapter': '../bower_components/epik/lib/plugins/rivets-adapter',
			primish: '../bower_components/primish',
			lodash: '../bower_components/lodash/dist/lodash',
			slicker: '../bower_components/slicker/index',
			rivets: '../bower_components/rivets/dist/rivets',
			jquery: '../bower_components/jquery/jquery'
		}
	});
});
```

The above is applicable after a `bower install epik --save` and will dynamically load any components as needed.
Obviously, you may have a different config for `jquery`, `lodash` and `rivets` so reflect them as needed - epik will require
them via the root level ids of `jquery`, `lodash` and `rivets` respectively.

If you prefer, you can use the builds of epik instead. There are two builds shipped - a minimum one, which includes only
the epik files (and `slicker`) and a full one, which includes ALL dependencies, `lodash`, `rivets` and `jquery` into the
build.

There are module ids set so you can use the RequireJS 2.1.9 feature [bundles](http://requirejs.org/docs/api.html#config-bundles) and
define where to find the resolved modules.

An example config using the minified built epik would look like this:
```javascript
require.config({
	paths: {
		epik: '../bower_components/epik/lib',
		primish: '../bower_components/primish',
		lodash: '../bower_components/lodash/dist/lodash',
		rivets: '../bower_components/rivets/dist/rivets',
		jquery: '../bower_components/jquery/jquery'
	},
	bundles: {
		'epik/epik-min': [
			'epik/index',
			'epik/model',
			'epik/model-sync',
			'epik/collection',
			'epik/collection-sync',
			'epik/agent',
			'epik/storage',
			'epik/router',
			'epik/view',
			'epik/plugins/rivets-adapter',
			'slicker'
		]
	}
});
```

Once that is setup, requests for `epik/model` on an empty require module factory will get the minified built version and
prime the factory against the module IDs defined above. You should only see a single HTTP request in your console for
`epik-min.js`. Notice `slicker` is bundled already and the rivets adapter is with the id of `epik/plugins/rivets-adapter`.

Usage in both cases remains the same.
```javascript
require.config({ ... }});

define(function(require){

	var primish = require('primish/primish'),
		Model = require('epik/model-sync');

	var User = primish({
		extend: Model
	});

	// ...
});
```

If you use the FULL build from `dist/build/epik-full-min.js`, you would also have to add to the bundles config to let
requirejs know it will resolve rivets.js, jquery, lodash and primish as well:

```javascript
require.config({
	paths: {
		epik: '../bower_components/epik/lib',
		primish: '../bower_components/primish',
		lodash: '../bower_components/lodash/dist/lodash',
		rivets: '../bower_components/rivets/dist/rivets',
		jquery: '../bower_components/jquery/jquery'
	},
	bundles: {
		'epik/epik-min': [
			'epik/index',
			'epik/model',
			'epik/model-sync',
			'epik/collection',
			'epik/collection-sync',
			'epik/agent',
			'epik/storage',
			'epik/router',
			'epik/view',
			'epik/plugins/rivets-adapter',
			'slicker',
			'jquery',
			'lodash',
			'rivets',
			'primish/primish',
			'primish/emitter',
			'primish/options'
		]
	}
});
```

Keep in mind that the strings passed to the bundles config are module IDs, not expanded paths.

## Model

The epik Model implementation at its core is a [primish](https://github.com/DimitarChristoff/primish) class with custom data accessors that fires events. You can extend models or implement objects or other classes into your definitions.

The Model can fire the following events:

* `ready` - when instantiated
* `change` - when any properties have changed
* `change:key` - when a particular property `key` has changed
* `empty` - when a model has been emptied of all properties
* `destroy` - when a model has been `destroyed` and all data removed.
* `error` - when a model validator fails on a property set.
* `error:key` - when a particular key validation error has occurred

The following methods are official API on all Model Classes:

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `(Object) obj`, `(Object) options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `ready`_
</p>
</div>

The `obj` sets the internal data hash to a new derefrenced object. Special accessor properties, as defined in the `epik.model.prototype.properties`, will run first and be applicable. See [properties](#model/model-properties) for more info.

The `options` object is a `setOptions` override and is being merged with the `epik.model.prototype.options` when a new model is created. It typically contains various event handlers in the form of:

```ace
require(['epik/index', 'epik/model'], function(epik, Model){

	var Person = epik.primish('person', {
		extend: Model,
		defaults: {
			sex: 'male',
			title: 'Mr.',
			age: 0
		}
	});

	var bob = new Person({
		name: 'Bob',
		age: 30
	});

	console.log(bob.toJSON());
	console.log(bob._id); // 'person'
});
```

### set
---
<div class="alert" markdown="1">
<p>
_Expects arguments: mixed: `(String) key`, `(Mixed) value` - pair - or: `(Object) obj`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events:_

<ul>
 <li> `change: function(changedProperties) {}`</li>
 <li> `change:key: function(valueForKey) {}`</li>
 <li> `error: function(objectFailedValidation) {}`</li>
 <li> `error:key: function(objectFailedValidation) {}`</li>
</ul>
</p>
</div>

Allows changing of any individual model key or a set of key/value pairs, encapsulated in an object. Will fire a single `change` event with all the changed properties as well as a specific `change:key` event that passes just the value of the key as argument.

For typing of value, you can store anything at all (Primitives, Objects, Functions). Keep in mind that, when it comes to serialising the Model and sending it to the server, only Primitive types or ones with a sensible `toString()` implementation will make sense.

### get
---
<div class="alert">
<p>
_Expects arguments mixed: `(String) key` or `(Array) keys`_
</p>
<p>
_Returns: `this`_
</p>
</div>

Returns known values within the model for either a single key or an array of keys. For an array of keys, it will return an object with `key` : `value` mapping. Properties gotten are not implicitly de-refrenced so careful if you have stored an object - modifying the value of the `get` will modify your model as well.

The following example illustrates why it's a bad idea to store deep model properties. Alternatively, you can use `instance.toJSON()` and reference and modify properties off of that without them making it back into the model.

```ace
require(['epik/index', 'epik/model'], function(epik, Model){

	var Person = epik.primish('person', {
		extend: Model,
		defaults: {
			sex: 'male',
			title: 'Mr.',
			age: 0
		}
	});

	var bob = new Person({
		a: 'a',
		b: 'b',
		location: {
			country: 'UK',
			city: 'London'
		}
	});

	var location = bob.get('location');
	console.log(location.city); // London
	location.city = 'Manchester';
	console.log(bob.get('location').city); // Manchester. oh no!

	// get around dereferencing
	location = epik._.clone(bob.get('location'));
	location.city = 'London';
	console.log(bob.get('location').city); // Still Manchester.

	// multiple property getters
	console.log(bob.get(['a','b']));
});
```

### toJSON
------
<div class="alert">
<p>
_Expects arguments: none_
</p>
</div>

Returns a de-referenced Object, containing all the known model keys and values.

### unset
-----
<div class="alert">
<p>
_Expects arguments: mixed: `(String) key` or `(Array) keys`_
</p>
<p>
_Returns: `this`_
</p>
</div>

Removes keys from model, either a single one or an array of multiple keys. Should fire a change event for every property removed as well as a `change`.

### empty
-----
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `empty`_
</p>
</div>

Empties the model of all data and fires a single change event with all keys as well as individual `change:key` events.

### destroy
-------
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `destroy`_
</p>
</div>

Empties the model. No change event. Event is observed by Collections the model is a member of, where it triggers a `remove()`

### validate
-------
<div class="alert">
<p>
_Expects arguments: {String} key, {*} value_
</p>
<p>
_Returns: `{Boolean} validates`_
</p>
</div>

Internal method that gets run whenever a property is being set. Checks to see if there is a validator for the `key`, is so, returns the result of the validator function, else, assumes it's allowed and returns `true`

### Model properties*

There are several additional properties each model instance will have.

#### _attributes: {Object}
-------
The attributes object is __public__ (exposed to manipulation on the instance) and it holds the hash data for the model, based upon keys. It is de-referenced from the constructor object used when creating a model but should not be read directly (normally). Exported by `model.toJSON()`. Avoid changing this directly as it won't fire any change events at all.

#### _collections: {Array}
-------
An array that contains references to all instances of epik.collection that the model is currently a member of. Useful for iteration as well as utilised by collections that subscribe to events for models.

#### options: {Object}
-------
A default options set, which can be on the prototype of the Model constructor.

#### defaults: {Object}
-------
An object with default Model Attributes to use when instantiating. Merged with Model object when populating model data via the constructor.

#### propertiesChanged: {Array}
-------
An array of all property keys that reflect the last `change` event. Available on all instances.

#### validationFailed: {Array}
-------
An array of all error Objects with info on all validation failed properties after a `set`. Available on all instances.

#### properties: {Object}
-------
A collection of custom accessors that override default `model.get` and `model.set` methods. For example:

```javascript
properties: {
    dob: {
        get: function() {
            // scope is model
            return new Date(this._attributes.dob);
        },
        set: function(value) {
            // return a value to be set
            return value instanceof Date ? +value : value;
        }
    },
    id: {
        get: function(){
            // returns a property from instance instead of _attributes
            return this.id;
        },
        set: function(id){
            this.id = id;
            // may want to fire events manually here.
        }
    }
}
```
In the examples above, any calls to `model.set('dob', new Date(1985, 5, 15))` and `model.get('dob')` are handled by custom functions as we want our model to deal with unix timestamps only but return Date instances. This is a pattern that allows you to use getters and setters for properties that are handled differently than normal ones. If the `set` function returns a value, it will use the normal `set` chain and act as a formatter/pre-processor, firing events etc. You don't have to use this and can do as in the `id` example, where the value is simply redirected elsewhere.

Avoid setting them on prototypes that you extend from, better to have them on the instance from the constructor or another method as they are not de-referenced and are not being merged. If you need to extend them and keep the default id getter, you need to merge with `model.prototype.properties` in your new model definitions. This may change in future versions.

```javascript
var Person = primish({
	properties: _.merge({
		foo: {
			get: function(){},
			set: function(){}
		}
	}, epik.model.prototype.properties);
});
```

## Model Sync

tbc

## Collection

tbc

## Collection Sync

tbc

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
		tpl = 'I am template <a href="#" class="task-remove"><%=name%></a><br/><button class="done">done</button>';

	var testView = primish({

		extend: View,

		options: {
			events: {
				'click a.task-remove': 'removeTask',
				'click button.done': 'reset'
			}
		},

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
require([
	'epik/index',
	'epik/view',
	'epik/model',
	'epik/plugins/rivets-adapter'
], function(epik, View, Model, rivets) {

	var primish = epik.primish;

	var MyView = primish({
		// mixin the rivets class
		implement: [rivets],
		extend: View,
		options: {
			template: ''
		},
		constructor: function(options){
			this.parent('constructor', options);
			this.element.innerHTML = this.options.template;
			this.bindRivets(this.element, {
				person: this.model
			});
		},
		destroy: function(){
			this.unbindRivets();
			this.parent('destroy');
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

### bindRivets

Sugar that passes an object to be bound to `this.element`. Optionally, you can pass a different element as the first
argument. Creates a `this.boundRivets` property on the object, containing reference to the current rivet view context instance

### unbindRivets

Used as a destructor to unbind existing events from `this.boundRivets`

### syncRivets

A method that calls `rivets.sync()` on the bound view to force manual processing, like `$digest`



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
$ grunt build
$ grunt requirejs
```

The web server is on port 8000 - visit [http://locahost:8000/example/](http://locahost:8000/example/) to view live examples


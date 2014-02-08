epik
====

epik is [Epitome](http://epitome-mvc.github.io/Epitome/) ver 2 for `primish`, `lodash` and `jquery/zepto`, no depenency on MooTools

> Warning: this is a fully functional experiment. If you like primish, MooTools and Epitome, feel free to use or to contribute

epik is a small, modular and extensible MVC framework for modern web development, built in the spirit of AMD and bower components. It will also work with global exports (w/o a dependency loader) and it works under node.js. epik offers 90% of the functionality of Backbone but allows you to develop in the style of MooTools classes via [primish](http://dimitarchristoff.github.io/primish/). The views are either powered by jQuery or via a built-in [rivets.js](http://www.rivetsjs.com/) adapter for bi-directional binding in the style of AngularJS.

- __Q: Why would you use it?__ It allows you to quickly prototype and develop code that runs in the browser or in node.js, sharing components between client and server. It also makes it easy to work with for any ex MooTools developers who are being forced to use jquery in their work.

- __Q: Should I use it?__ Whereas epik is fully functional, tested and powerful, it has literally no adoption in the wild, therefore no community help. For the time being, only use it if you know what you are doing.

[![Build Status](https://secure.travis-ci.org/DimitarChristoff/epik.png?branch=master)](http://travis-ci.org/DimitarChristoff/epik)


## Getting started

To install epik in your project, you have several routes.

### bower
```sh
$ bower install epik --save
```

A bower install will only bring down the following files:

 - `lib/index.js`
 - `lib/model.js`
 - `lib/model-sync.js`
 - `lib/collection.js`
 - `lib/collection-sync.js`
 - `lib/agent.js`
 - `lib/router.js`
 - `lib/storage.js`
 - `lib/plugins/rivets-adapter.js`
 - `lib/epik-min.js`

### script tags

You can grab the minified concatenated version:

<a class="btn btn-large btn-primary" rel="download" target="_blank" href="https://rawgithub.com/DimitarChristoff/epik/master/lib/epik-min.js">epik-min.js (27.5k)</a> (pointing to master branch)


`epik` uses the following packages as dependencies, not part of the build:

 - lodash (utils)
 - primish (classes)
 - jquery (views)
 - rivets.js (views)

Additionally, `slicker`, MooTools Slick parser for the web, is bundled in the concatenated minified files but if you use it in development mode and reference all the files locally, you'd need to resolve it as well. Should be done automatically if you use bower/AMD, see below.

Make sure that the dependencies listed above - `primish`, `lodash` and view helpers `jquery` and `rivets.js`, if applicable, are loaded beforehand and use the global object `epik` to reference components.

### node.js

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

### constructor
---
<div class="alert">
<p>
_Expects arguments: `{Object} obj`, `{Object} options`_
</p>
<p>
_Returns: `modelInstance`_
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
_Expects arguments: mixed: `{String} key`, `{Mixed} value` - pair - or: `{Object} obj`_
</p>
<p>
_Returns: `modelInstance`_
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
_Expects arguments mixed: `{String} key` or `{Array} keys`_
</p>
<p>
_Returns: `{mixed|Object}`_
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
<p>
_Returns: `{Object} data`_
</p>
</div>

Returns a de-referenced Object, containing all the known model keys and values.

### unset
-----
<div class="alert">
<p>
_Expects arguments: mixed: `{String} key` or `{Array} keys`_
</p>
<p>
_Returns: `modelInstance`_
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
_Returns: `modelInstance`_
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
	},
	price: {
		set: function(value){
			return this.formatCurrency(value);
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

### Model validators*

You can also include basic validators into your model. Validators are an object on the Model prototype that maps any expected key to a function that will return `true` if the validation passes or a `string` error message or `false` on failure.

Here is an example:
```ace
require(['epik/index', 'epik/model'], function(epik, Model){

	var Person = epik.primish('person', {
		extend: Model,
		validators: {
			email: function(value) {
				return (/(.+)@(.+){2,}\.(.+){2,}/).test(value) ? true : 'This looks like an invalid email address';
			}
		}
	});

	var userInstance = new Person({}, {
		onError: function(allErrors) {
			console.log('The following fields were rejected', allErrors);
		},
		'onError:email': function(errorObj) {
			// can have a custom message, action or whatever.
			console.log('Email rejected', errorObj.error);
		}
	});

	userInstance.set('email', 'this will fail!');

});
```
The `error` event is observed by collections and views and fires on all view and collection instances.


## Model Sync

This is an example implementation of RESTful module that extends the base epik.model class and adds the ability to read, update and delete models with remote server. In terms of implementation, there are subtle differences. The API and methods are as per the normal [Model](#model), unless outlined below:

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `{Object} model`, `{Object} options`_
</p>
</div>

model-sync extends the normal model by adding some extra properties, namely `id` and a `urlRoot` either as a property of the model or as an options property, which allow you to sync it. The constructor function first calls the parent model constructor and then sets up the XHR instance and methods via a custom implementation of [agent](https://github.com/kamicane/agent), which supports XHR2. `agent.js` is a local file that does not need to be included separately due to certain changes around CORS headers and primish that are not available upstream.

<div class="alert">
`options.headers` {Object} is a way to pass headers to the Agent instance, such as the `content-type` to `application/json` (by default), etc.
 </div>

### sync
---
<div class="alert">
<p>
Expects optional arguments: `{String} method`, `{Object} model`, `{Function} callback`_
</p>
<p>
_Events: `success|failure`: `function(responseObj) {}`_
</p>
</div>

Sync acts as a proxy/interface to the XHR instance in the model `this.request` A method can be one of the following:
> get, post, create, read, delete, update

If no method is supplied, a `read` is performed.

The second argument `model` is optional and should be a simple object. If it is not supplied, the default `model.toJSON()` is used instead.

If a callback is supplied, it will be called when done - although it will still raise the `success` or `failure` events

As a whole, you should probably NOT use the sync directly but elect to use the API methods for each specific request task.

__WARNING:__ epik is a REST framework. Please make sure you are returning a valid JSON string or 204 (no content) after all requests -
otherwise, the save events may not fire. Additionally, try to ensure `application/json` content type of your response so that the response is converted to an Object when passed back. Failing to do so will return it raw as plain text or whatever content type you have supplied.

### postProcessor
---
<div class="alert">
<p>
_Expects arguments: `{Object} response`_
</p>
<p>
_Expected return: `{Object} response`_
</p>
</div>

A method that you pass in your definition of Models for doing any post-processing of data `returned` by sync from the server. For example:

```javascript
postProcessor: function(response) {
	// data comes back with decoration. split them first.
	this.meta = response.meta;
	return response.data;
}
```

### save
---
<div class="alert">
<p>
_Expects optional arguments: `{String} key`, `{String} value` or `{Object} keyValues`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `save`, `success|failure`, also either `create` or `update`, dependent on if the model is new_
</p>
</div>

The save should send the contents of the model to the server for storage. If it is a model that has not been saved before or fetched from the server, it will do so via `create()`, else, it will use `update()` instead.

If the optional `key` => `value` pair is passed, it will set them on the model and then save the updated model.

### preProcessor
---
<div class="alert">
<p>
_Expects arguments: `{Object} response`_
</p>
<p>
_Expected return: `{Object} response`_
</p>
</div>

A method that you can add to your definition of Models for doing any pre-processing of data before using `CREATE` or `UPDATE` via, `.save` when syncing to a server. For example:

```javascript
preProcessor: function(data) {
	// remove local property 'meta' which the server does not like.
	delete data.meta;
	return data;
}
```

### fetch
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `fetch`, `read`_
</p>
</div>

It will request the server to return the model object for the current id via a `.read()`. It will also change the status of the model (`model.isNewModel`) to false, meaning `.save()` will never use `.create()`. The fetch event will fire once the response object has been returned. The response object is then merged with the current model via a `.set`, it won't empty your data. To do so, you need to issue a `.empty()` first.

### CRUD

As a side note, the following methods are exported on the model instance:

- `create` - maps to POST
- `read` - maps to GET
- `update` - maps to POST
- `delete_` - maps to DELETE (note that due to IE8, use of `delete` and dot notation throws so it has been renamed)


## Collection

Collections are in essence, an Array-like Type with Models as members. By passing a model prototype, adding and removing of models works either based with simple JSPO data has or an actual Model instance. Collections observe and bubble all events that all of its model members emit, firing them on the collection instance. It also allows for filtering, mapping, sorting and many sugar methods, copied from the Array.prototype and applied on the Model.

Unlike Arrays, collections here also allow a powerful search/filter that can return a subset {Array} of Models from the collection that match CSS-like selectors for model attributes

Instances of collection should have a `._id` property of collection, unless you override that.

### constructor
---
<div class="alert">
<p>
_Expects arguments: `{Array|Object} models|objects` (or a single model /object), `{Object} options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `ready`_
</p>
</div>

The constructor method will accept a large variety of arguments. You can pass on either an Array of Models or an Array of Objects or a single Model or a single Object. You can also pass an empty Array and populate it later. Typical Collection prototype definition looks something like this:
```javascript
var userModel = primish({extend: epik.model}),
	usersCollection = primish({
		extend: epik.collection,
		model: userModel // or epik.model by default
	});

var users = new usersCollection([{
	id: 'bob'
}], {
	onChange: function(model, props) {
		console.log('model change', model, props);
	},
	onReady: function() {
		console.log('the collection is ready');
	}
});
```
For reference purposes, each Model that enters a collection needs to have a `cid` - collection id. If the Model has an `id`, that is preferred. Otherwise, a `cid` will be generated. If the Model gets an `id` later on, the `cid` will not be changed.

<div class="alert alert-info">
<p>
_Please note that Collections **observe** and bubble **all** model events. For instance, if a Model fires `change`, the Collection instance will fire `onChange`, passing the model as `arguments[0]` and then keeping the rest of the arguments in their original order. For the purposes of implementing this, a decorated local copy of each Model's `.fireEvent` method is created instead of the one from Class.Event prototype. Once a Model stops being a member of collections, the original `fireEvent` is restored by deleting the local method on the Model instance._
</p>
</div>

### set
---
<div class="alert">
<p>
_Expects arguments: `{Array|Object} model(s)` , `{Boolean} quiet`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `set: function() {}`_
</p>
</div>

Sets models into the collection 'sugar'. Accepts a single model or an array of models to add, passing through to `.add` and also firing a `set` event when done. Previously `.reset` in Epitome.

### add
---
<div class="alert">
<p>
_Expects arguments: `{Object|Model} model` , `{Boolean} replace`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `add: function(model, cid) {}`, `reset`_
</p>
</div>

Previously `addModel` in Epitome. Adding a Model to a Collection should always go through this method. It either appends the Model instance to the internal `_models` Array or it creates a new Model and then appends it. It also starts observing the Model's events and emitting them to the Collection instance with an additional argument passed `Model`. So, if you add a Model stored in `bob` and then do `bob.trigger('hai', 'there')`, the collection will also fire an event like this: `this.trigger('hai', [bob, 'there']); Adding a Model also increases the `Collection.length` property.

When a model is added, the collection uses `listenTo()` to subscribe to all methods from the model and bubble them locally. Previously, this used to overload the `fireEvent` method in Epitome's Models but it no longer does.

Increments the `Collection.length` property (if not replacing existing models).

### remove
---
<div class="alert">
<p>
_Expects arguments: `{Mixed} model(s)`, `{Boolean} quiet`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `remove: function(model, cid) {}`, `reset`_
</p>
</div>

This method allows you to remove a single model or an array of models from the collection in the same call. For each removed model, a `remove` Event will fire (if `quiet` is not true). When removing of all Models is done, the collection will also fire a `reset` event, allowing you to re-render your views etc.

In addition to removing the Model from the Collection, it removes the reference to the Collection in the Model's `_collections` Array and stops observing the Model's events.

Decrements the `Collection.length` property.

### at
---
<div class="alert">
<p>
_Expects arguments: `(Number) index`_
</p>
<p>
_Returns: `modelInstance` or `undefined`_
</p>
</div>

Returns a particular model by reference to current oder, eg. `collection.at(3)` will return `collection._models[3]`. Index is 0-based.

### getModelById
---
<div class="alert">
<p>
_Expects arguments: `{String} id`_
</p>
<p>
_Returns: `modelInstance` or `null`_
</p>
</div>

Performs a search in the collection by the Model's `id` via the standard model `getter`. Returns found Model instance or `null` if no match is found.

### getModelByCID
---
<div class="alert">
<p>
_Expects arguments: `{String} cid`_
</p>
<p>
_Returns: `modelInstance` or `null`_
</p>
</div>

Performs a search in the collection by the `cid` property (Collection ID). Returns found Model instance or `null` if no match is found.

### toJSON
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `modelsData`_
</p>
</div>

Returns an array of the results of the `.toJSON()` method called on all Models instances in the collection. Resulting array is de-referenced from both the collection and models instances.

### empty
---
<div class="alert">
<p>
_Expects arguments: `{Boolean} quiet`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `remove`, `set`, `empty`_
</p>
</div>

Applies `this.remove` to all Models of the collection. Fires `empty` when done - though before that, a `remove` and `reset` will fire unless `quiet` is set as `true`, see [remove](#collection/remove)

### sort
---
<div class="alert">
<p>
_Expects arguments: {String|Function} how_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `sort`_
</p>
</div>

Sorting is quite flexible. It works a lot like `Array.prototype.sort`. By default, you can sort based upon strings that represent keys in the Models. You can also stack up secondary, trinary etc sort keys in case the previous keys are equal. For example:
```javascript
users.sort('name');
// descending order pseduo
users.sort('name:desc');
// by type and then birthdate in reverse order (oldest first)
users.sort('type,birthdate:desc');
```
Sorting also allows you to pass a function you define yourself as per the [Array.prototype.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort) interface. When done, it will fire a `sort` event.

### reverse
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `sort`_
</p>
</div>

Reverses sort the order of Models in the collection. Fires a `sort` event, not `reverse`

### find
---
<div class="alert">
<p>
_Expects arguments: {String} expression_
</p>
<p>
_Returns: `{Array} MatchingModelObjects`_
</p>
</div>

This is an experimental API and is subject to change without notice. `Collection.find` is currently powered by the MooTools `Slick.parse` engine. This means you can
 search through your Collection for Models by attributes and `#ids` like you would search in a CSS selector.

For example:
```ace
require([
	'epik/collection'
], function(Collection) {

	var collection = new Collection([{
		name: 'Bob',
		id: 2
	}, {
		name: 'Angry Bob',
		id: 3
	}]);

	console.log(collection.find('[name]')); // where name is defined.
	console.log(collection.find('[name=Bob]')); // where name is exactly Bob.
	console.log(collection.find('[name*=Bob]')); // where name contains Bob.
	console.log(collection.find('[name$=Bob]')); // where name ends on Bob.
	console.log(collection.find('[name^=Bob]')); // where name starts with Bob.
	console.log(collection.find('[name=Bob],[name^=Angry]')); // name Bob OR starting with Angry.
	console.log(collection.find('[name=Bob][id]')); // name Bob AND to have an id
	console.log(collection.find('#2[name=Bob],#3')); // (name Bob AND id==2) OR id==3
	console.log(collection.find('[name=Bob][id=2]')); // name Bob AND id==2
});
```

Supported operators are `=` (equals), `!=` (not equal), `*=` (contains), `$=` (ends on), `^=` (starts with). Currently, you cannot reverse a condition by adding `!` or `not:` - in fact, pseudos are not supported yet. Find is just sugar and for more complicated stuff, you can either extend it or use `filter` instead.

A sugar 'feature' has been added that allows you to quickly select deeper object properties by treating any parent keys as tags. For instance:

```ace
require([
	'epik/collection'
], function(Collection) {

	var collection = new Collection([{
		name: 'Bob',
		permissions: {
			edit: 'true'
		}
	}, {
		name: 'Angry Bob',
		permissions: {
			edit: 'false'
		}
	}]);

	console.log(collection.find('permissions[edit]')); // all where there is an edit property
	console.log(collection.find('permissions[edit=true]')); // all where there edit is true
});
```

However, this is more of a convenience than convention. Since it does not do type checking, it is difficult to pass what type of a value you are after in a string. In the example above, `edit` needs to be exactly the string `true`. For complex selectors and non-string data, you should use your own `.filter` methods.

It also won't allow you to do complex CSS-like selections as you cannot combine 'tag' with properties. This means you cannot do `permissions[edit][name=Bob]` as the search context changes to the permissions property. This kind of structure is possibly an anti-pattern anyway, try to keep your models flat and avoid nested objects where possible.

### findOne
---
<div class="alert">
<p>
_Expects arguments: {String} expression_
</p>
<p>
_Returns: `{Model} First matching Model instance or null`_
</p>
</div>

Useful for getting a single Model via the `.find`, this method will return the first matched Model or null if none found.

```javascript
var bob = collection.findOne('[name=bob]');
// if found, set
bob && bob.set('name','Robert');
```

### Array helpers

The following Array methods are also available directly on the Collection instances:

* forEach
* each (alias for forEach)
* invoke
* filter
* map
* some
* indexOf
* contains
* getRandom
* getLast

### Collection properties*

#### _models
---
Each Collection instance has an Array property called `_models` that contains all referenced Model instances. Even though it is not a real private property, it is recommended you do not alter it from outside of the API.

#### length
---
Tries to always reference the length of `_models`, unless you have directly modified `_models` without using the API.

#### model
---
Each Collection prototype has that property that references a Model prototype constructor. When data is being received in raw format (so, simple Objects), Models are being created by instantiating the stored constructor object in `this.model`.

#### id
---
Due to serialisation and the ability to use storage to retrieve a collection later, each collection has an, derrived either from the options object or generated at random.

## Collection Sync

The Sync collection is just a tiny layer on top of the normal [collection](#collection). It `extends` the default Collection class and adds an agent instance that can retrieve an array of Model data from a server and add / update the Collection after.

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `{Array|Object} models|objects` (or a single model /object), `{Object} options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `ready`_
</p>
</div>

In terms of differences with the original prototype, the `options`, needs just one extra key: `urlRoot`, which should contain the absolute or relative URL to the end-point that can return the Model data.

### fetch
---
<div class="alert">
<p>
_Expects optional arguments: `{Boolean} refresh`, `{Object} queryParams`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_Events: `fetch`_
</p>
</div>

When called, it will asynchronously try to go and fetch Model data. When data arrives, Models are reconciled with the Models in the collection already by `id`. If they exist already, a `set()` is called that will merge new data into the Model instance and fire `change` events as appropriate. If the optional `refresh` argument is set to true, the current collection will be emptied first via [empty](#epitomecollection/empty).

Returns the instance 'now' but because it is async, applying anything to the collection before the `fetch` event has fired may have unexpected results.

The `queryParams` object, which is also optional, allows you to pass on any `GET` arguments to the `baseUrl`. If your default endpoint looks like this:

`/comments/2/` and you call `collection.fetch(false, {page: 2})`, it will actually get `/comments/2/?page=2`.

Keep in mind that agent will serialize the response as per the content type, just like in Model Sync. If it's `application/Json`, the decoder will kick in and set the response into the instance.

### postProcessor
---
<div class="alert">
<p>
_Expects arguments: `{Array|Mixed} response`_
</p>
<p>
_Expected return: `{Array} response`_
</p>
</div>

A method that you can extend in your definition of Epitome.Collection.Sync for doing any pre-processing of data returned by sync from the server. For example:

```javascript
var Users = primish({
	extend: epik.collection,
	model: UserModel,
	postProcessor: function(response){
		// data comes back with decoration. split them first.
		// { meta: { something: 'here' }, models: [] }
		this.meta = response.meta;
		return response.models;
	}
});
```

## View

The view is very un-assuming. It can work with either DOM library (jquery, jquery-lite, zepto) and a templating
engine like handlebars or lodash.template. It can also work with a template binding engine like rivets.js. A combination
of both is also possible.

### constructor

---
<div class="alert">
<p>
_Expects arguments: `{Object} options`_
</p>
<p>
_Returns: `viewInstance`_
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
require([
	'epik/index',
	'epik/view',
	'epik/model'
], function(epik, View, Model) {
	'use strict';

	var primish = epik.primish,
		tpl = 'I am template <a href="#" class="task-rename"><%=name%> <%=status%></a><br/><button class="done">completed</button>';

	var testView = primish({

		extend: View,

		options: {
			events: {
				'click a.task-rename': 'renameTask',
				'click button.done': 'reset'
			}
		},

		render: function(){
			this.empty();
			this.$element.html(this.template(this.model.toJSON()));
			this.parent('render');
			return this;
		},

		reset: function(){
			this.model.set('status', 'done');
			this.render();
		},

		renameTask: function(event){
			event && event.preventDefault && event.preventDefault();
			this.model.set('name', 'Changed name');
		}
	});


	var testInstance = new testView({

		model: new Model({name: 'View fun', status: 'pending'}),

		element: '#main',

		template: tpl,

		onReady: function(){
			this.render();
		},

		'onModel:change': function(){
			this.model.set('name', new Date().getTime());
			this.render();
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
_Returns: `viewInstance`_
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
_Expects arguments: `{Object|String} element`, optional `{Object} events`_
</p>
<p>
_Returns: `viewInstance`_
</p>
</div>

A public method that allows you to change or set an element that powers a view. If called the first time, it will get the Element (through Sizzle / `jQuery()`) and save a reference in `this.element` to the raw object, as well as `this.$element` to the wrapped jQuery object. If an events object is passed, it will bind the events. If called a second time, it will unbind all events on the old element, change the element reference and rebind any new events.

### template
---
<div class="alert">
<p>
_Expects arguments: `{Object} data`, optional `{String} template`_
</p>
<p>
_Returns: compiled template or function._
</p>
</div>

A simple sandbox function where you can either use the lodash templating engine or call an external engine like Mustache, Handlebars, Hogan etc. The second argument is optional and if not supplied, it will revert to `this.options.template` instead.

An example override to make it work with Mustache would be:
```javascript
var myView = epik.primish({
	extends: epik.view,
	template: function(data, template) {
		template = template || this.options.template;
		return Mustache.render(template, data);
	},
	render: function() {
		this.$element.html(this.template(this.model.toJSON(), 'Hello {{name}}'));
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
_Expects arguments: `{Boolean} soft`_
</p>
<p>
_Returns: `viewInstance`_
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
_Returns: `viewInstance`._
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
_Returns: `viewInstance`._
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


## router

The Router prime is a hashbang controller, useful for single page applications. Currently, it works with `window.onhashchange` and a `setInterval` polyfill for older browsers. It may change to push/pop state soon.

### constructor
---
<div class="alert">
<p>
_Expects arguments: `{Object} options`_
</p>
<p>
_Returns: `routerInstance`_
</p>
<p>
_Events: `ready`, `before`, `after`, mixed, `undefined`, `error`, `route:add`, `route:remove`_
</p>
</div>

As this is quite involved and can act as a Controller for your app, here's a practical example that defines a few routes and event handlers within the epik.router prime instantiation:

```javascript
App.router = new epik.router({
	// routes definition will proxy the events
	routes: {
		''						: 'index',
		'#!help'				: 'help',
		'#!test1/:query/:id?'	: 'test1',
		'#!test2/:query/*'		: 'test2',
		'#!error'				: 'dummyerror'
	},

	// router init
	onReady: function(){
		console.log('init');
	},

	// before route method, fires before the event handler once a match has been found
	onBefore: function(routeId){
		console.log('before', routeId)
	},

	// specific pseudos for :before
	'onIndex:before': function() {
		console.log('we are about to go to the index route');
	},

	// specific pseudos for after
	'onIndex:after': function() {
		console.log('navigated already to index route, update breadcrumb?');
	},

	// after route method has fired, post-route event.
	onAfter: function(route){
		console.info('after', route)
	},

	// routes events callbacks are functions that call parts of your app

	// index
	onIndex: function() {
		console.log('index')
	},

	onHelp: function() {
		console.log('help');
		console.log(this.route, this.req, this.param, this.query)
	},

	onTest1: function(query, id) {
		console.info('test1', query, id);
		console.log(this.route, this.req, this.param, this.query)
	},

	onTest2: function(query) {
		console.info('test2', query);
		console.log(this.route, this.req, this.param, this.query)
	},

	// no route event was found, though route was defined
	onError: function(error){
		console.error(error);
		// recover by going default route
		this.navigate('');
	},

	onUndefined: function() {
		console.log('this is an undefined route');
	},

	'onRoute:remove': function(route) {
		alert(route + ' was removed by popular demand');
	},

	'onRoute:add': function(constructorObject) {
		console.log(constructorObject.id + ' was added as a new route');
	}
});
```
### addRoute
---
<div class="alert">
<p>
_Expects arguments: `{Object} route`_
</p>
<p>
_Returns: `routerInstance`_
</p>
<p>
_Events: `route:add`_
<p>
</div>

Example late adding of route to your instance (after instantiation):

```javascript
App.router.addRoute({
	route: '#!dynamicRoute',
	id: 'dynamic',
	events: {
		onDynamic: function() {
			alert('you found the blowfish');
			if (confirm('remove this route?'))
				this.removeRoute('#!dynamicRoute');
		}
	}
});
```

### removeRoute
---
<div class="alert">
<p>
_Expects arguments: `{String} route`_
</p>
<p>
_Returns: `routerInstance`_
</p>
<p>
_Events: `route:remove`_
</p>
</div>

Removes a route by the route identifier string.

For more examples of Router, have a look inside the `dist/example` folder, it's powered by a router instance.

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


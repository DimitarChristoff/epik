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

The view is very un-assuming. It can work with either DOM library (jquery, jquery-lite, zepto or custom) and a templating
engine like handlebars or lodash.template. It can also work with a template binding engine like rivets.js. A combination
of both is also possible.

### rivets-adapter

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

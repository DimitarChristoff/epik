var config = exports;

config['Browser tests'] = {
	rootPath: '../',

	environment: 'browser',

	libs: [
		'lib/components/lodash/dist/lodash.js',
		'lib/components/primish/primish.js',
		'lib/components/primish/emitter.js',
		'lib/components/primish/options.js',
		'lib/index.js'
	],

	sources: [
		//'lib/index.js',
		'lib/agent.js',
		'lib/model.js',
		'lib/model-sync.js',
		'lib/collection.js',
		'lib/collection-sync.js'
	],

	tests: [
		// find matching test specs as above sources
		//'test/specs/model-test.js',
		//'test/specs/model-sync-test.js',
		'test/specs/collection-sync-test.js'
		//'test/specs/*-test.js'
	],

	//extensions: [require('buster-amd')]

	resources: [
		// used as a static response json stub for model.sync
		'example/api/users/*',
		'example/api/collection/*'
	]
};

/*
// tests disabled as buster-test with both groups right now does not proc.exit
config['Node tests'] = {
	rootPath: '../',

	environment: 'node',

	libs: [
		// server-only, no request or element.
		'test/lib/mootools-core-1.4.5-server.js'
	],

	sources: [
		// core
		'src/epitome.js',
		// utils
		'src/epitome-isequal.js',
		// model core
		'src/epitome-model.js',
		// controller/collection
		'src/epitome-collection.js',

		// template
		'src/epitome-template.js'
	],

	tests: [
		// find matching test specs as above sources
		'test/tests/epitome-isequal-test.js',

		'test/tests/epitome-model-test.js',

		'test/tests/epitome-collection-test.js'
	]
};
*/
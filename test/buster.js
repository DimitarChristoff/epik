var config = exports;

config['Epik browser tests'] = {
	rootPath: '../',

	environment: 'browser',

	libs: [
		'lib/components/lodash/dist/lodash.js',
		'lib/components/primish/primish.js',
		'lib/components/primish/emitter.js',
		'lib/components/primish/options.js',
		'lib/components/slicker/index.js',
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
		'test/specs/model-test.js',
		'test/specs/model-sync-test.js',
		'test/specs/collection-test.js',
		'test/specs/collection-sync-test.js'
		//'test/specs/*-test.js'
	],

	//extensions: [require('buster-amd')]

	resources: [
		// used as a static response json stub for model.sync
		'dist/example/api/users/*',
		'dist/example/api/collection/*'
	]
};


// tests disabled as buster-test with both groups right now does not proc.exit
config['Node tests'] = {
	rootPath: '../',

	environment: 'node',

	libs: [
		'lib/components/lodash/dist/lodash.js',
		'lib/components/primish/primish.js',
		'lib/components/primish/emitter.js',
		'lib/components/primish/options.js',
		'lib/components/slicker/index.js',
		'lib/index.js'
	],

	sources: [
		//'lib/index.js',
		'lib/model.js',
		'lib/collection.js'
	],

	tests: [
		// find matching test specs as above sources
		'test/specs/model-test.js',
		'test/specs/collection-test.js'
	]
};

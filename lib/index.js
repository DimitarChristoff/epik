;(function(factory){
	if (typeof define == 'function' && define.amd){
		require.config({
			paths: {
				primish: '../lib/components/primish',
				lodash: '../lib/components/lodash/dist/lodash',
				slicker: '../lib/components/slicker/slicker'
			}
		});

		define([
			'primish/prime',
			'primish/options',
			'primish/emitter',
			'lodash',
			'slicker'
		], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('primish'),
			require('primish/options'),
			require('primish/emitter'),
			require('lodash'),
			require('slicker')
		);
	} else {
		this.factory.model = factory(
			this.primish,
			this.options,
			this.emitter,
			this._,
			this.slicker
		);
	}
}).call(this, function(primish, options, emitter, _, slicker){
	return {
		_: _,
		primish: primish,
		options: options,
		emitter: emitter,
		slicker: slicker,
		util: {
			setter: function(fn){
				return function(a, b){
					if (a == null) return fn;
					if (_.isObject(a))
						for (var k in a) fn.call(this, k, a[k]);
					else
						fn.call(this, a, b);
				};
			},
			getter: function(fn){
				return function(a){
					var result,
						args,
						i;

					args = typeof a != 'string' ? a : arguments.length > 1 ? arguments : false;
					if (args){
						result = {};
						for (i = 0; i < args.length; i++) result[args[i]] = fn.call(this, args[i]);
					}
					else {
						result = fn.call(this, a);
					}
					return result;
				};
			}
		}
	};
});

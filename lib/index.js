;(function(factory){
	'use strict';

	if (typeof define == 'function' && define.amd){
		define([
			'primish/prime',
			'primish/options',
			'primish/emitter',
			'lodash'
		], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('primish'),
			require('primish/options'),
			require('primish/emitter'),
			require('lodash')
		);
	} else {
		this.epitome.model = factory(
			this.epitome,
			this.primish,
			this.options,
			this.emitter,
			this._
		);
	}

}).call(this, function(epitome, primish, options, emitter, _){
	'use strict';

	return {
		_: _,
		primish: primish,
		options: options,
		emitter: emitter,
		util: {
			setter: function(fn){
				return function(a, b){
					if (a == null) return fn;
					if (_.isObject(a))
						for (var k in a) fn.call(this, k, a[k]);
					else
						fn.call(this, a, b);
				};
			}
		}
	};
});

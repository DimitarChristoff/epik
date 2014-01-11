;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['lib/index', 'lib/model-sync'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('../../../lib/index'),
			require('../../../lib/model')
		);
	} else {
		this.Person = factory(
			this.epik,
			this.epik.model.sync
		);
	}
}).call(this, function(epik, model){
	var primish = epik.primish;

	return primish({

		extend: model,

		defaults: {
			name: 'Robert',
			surname: 'Roberts',
			age: 30
		},

		validators: {
			age: function(value){
				return value && parseInt(value, 10) == value && value >= 0 ? true : 'Age needs to be a positive integer';
			},
			name: function(value){
				return (value && value.charAt(0).toLowerCase() !== value.charAt(0)) || 'Need a capitalized name.';
			},
			surname: function(value){
				return (value && value.charAt(0).toLowerCase() !== value.charAt(0)) || 'Need a capitalized surname';
			}
		}
	});

});

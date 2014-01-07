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
				return parseInt(value, 10) == value ? true : 'Age needs to be an integer';
			},
			name: function(value){
				return (value.charAt(0).toLowerCase() !== value.charAt(0)) || 'Name needs to be capitalized';
			}
		}
	});

});

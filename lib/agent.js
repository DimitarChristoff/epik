;(function(factory){
	if (typeof define == 'function' && define.amd){
		define(['./index'], factory);
	} else if (typeof module != 'undefined' && module.exports){
		module.exports = factory(
			require('./index')
		);
	} else {
		this.epic.agent = factory(
			this.epic
		);
	}

}).call(this, function(epic){
	// agent by kamicane. MIT
	var primish = epic.primish,
		emitter = epic.emitter,
		_ = epic._;

		//todo: implement these
	var trim = (function(){
			var protoTrim = String.prototype.trim;
			return (protoTrim) ?
				function(string){return protoTrim.call(string);} :
				function(string){return String(string).replace(/^\s+|\s+$/gm, '');};
		}()),
		capitalize = function(string){
			return String(string).replace(/\b[a-z]/g, function(match){
				return match.toUpperCase();
			});
		};

	var getRequest = (function(){
		var XMLHTTP = function(){
			return new XMLHttpRequest();
		}, MSXML2 = function(){
			return new ActiveXObject('MSXML2.XMLHTTP');
		}, MSXML = function(){
			return new ActiveXObject('Microsoft.XMLHTTP');
		};

		try {
			XMLHTTP();
			return XMLHTTP;
		} catch(o_O){}

		try {
			MSXML2();
			return MSXML2;
		} catch(o_O){}

		try {
			MSXML();
			return MSXML;
		} catch(o_O){}

		return null;
	})();

	var encodeJSON = function(object){
		if (object == null) return '';
		if (object.toJSON) return object.toJSON();
		return JSON.stringify(object);
	};

	var encodeQueryString = function(object, base){

		if (object == null) return '';
		if (object.toQueryString) return object.toQueryString();

		var queryString = [];

		_.forIn(object, function(key, value){
			if (base) key = base + '[' + key + ']';
			var result;

			if (value == null) return;

			if (_.isArray(value)){
				var qs = {};
				for (var i = 0; i < value.length; i++) qs[i] = value[i];
				result = encodeQueryString(qs, key);
			} else if (_.isObject(value)){
				result = encodeQueryString(value, key);
			} else {
				result = key + '=' + encodeURIComponent(value);
			}

			queryString.push(result);

		});

		return queryString.join('&');

	};

	var decodeJSON = JSON.parse;

	// decodeQueryString by Brian Donovan
	// http://stackoverflow.com/users/549363/brian-donovan

	var decodeQueryString = function(params){

		var pairs = params.split('&'),
			result = {};

		for (var i = 0; i < pairs.length; i++){

			var pair = pairs[i].split('='),
				key = decodeURIComponent(pair[0]),
				value = decodeURIComponent(pair[1]),
				isArray = /\[\]$/.test(key),
				dictMatch = key.match(/^(.+)\[([^\]]+)\]$/);

			if (dictMatch){
				key = dictMatch[1];
				var subkey = dictMatch[2];

				result[key] = result[key] || {};
				result[key][subkey] = value;
			} else if (isArray){
				key = key.substring(0, key.length - 2);
				result[key] = result[key] || [];
				result[key].push(value);
			} else {
				result[key] = value;
			}

		}

		return result;

	};

	var encoders = {
		'application/json': encodeJSON,
		'application/x-www-form-urlencoded': encodeQueryString
	};

	var decoders = {
		'application/json': decodeJSON,
		'application/x-www-form-urlencoded': decodeQueryString
	};

	// parseHeader from superagent
	// https://github.com/visionmedia/superagent
	// MIT
	var parseHeader = function(str){
		var lines = str.split(/\r?\n/), fields = {};

		lines.pop(); // trailing CRLF

		for (var i = 0, l = lines.length; i < l; ++i){
			var line = lines[i],
				index = line.indexOf(':'),
				field = capitalize(line.slice(0, index)),
				value = trim(line.slice(index + 1));

			fields[field] = value;
		}

		return fields;
	};

	//todo: refactor to work as a simple mixin to classes.
	var Request = primish({

		implement: emitter,

		constructor: function Request(){
			var xhr = this._xhr = getRequest(),
				self = this;

			if (xhr.addEventListener) _.forEach('progress|load|error|abort|loadend'.split('|'), function(method){
				xhr.addEventListener(method, function(event){
					self.trigger(method, event);
				}, false);
			});

			this._header = {
				// 'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/x-www-form-urlencoded'
			};
		},

		header: function(name, value){
			if (_.isObject(name)) for (var key in name) this.header(key, name[key]);
			else if (!arguments.length) return this._header;
			else if (arguments.length === 1) return this._header[capitalize(name)];
			else if (arguments.length === 2){
				if (value == null) delete this._header[capitalize(name)];
				else this._header[capitalize(name)] = value;
			}
			return this;
		},

		running: function(){
			return !!this._running;
		},

		abort: function(){
			if (this._running){
				this._xhr.abort();
				delete this._running;
				this._xhr.onreadystatechange = function(){};
				this._xhr = getRequest();
			}
			return this;
		},

		method: function(m){
			if (!arguments.length) return this._method;
			this._method = m.toUpperCase();
			return this;
		},

		data: function(d){
			if (!arguments.length) return this._data;
			this._data = d;
			return this;
		},

		url: function(u){
			if (!arguments.length) return this._url;
			this._url = u;
			return this;
		},

		user: function(u){
			if (!arguments.length) return this._user;
			this._user = u;
			return this;
		},

		password: function(p){
			if (!arguments.length) return this._password;
			this._password = p;
			return this;
		},

		send: function(callback){

			if (!callback) callback = function(){};

			if (this._running) this.abort();
			this._running = true;

			var method = this._method || 'POST',
				data = this._data || null,
				url = this._url,
				user = this._user || null,
				password = this._password || null;

			var self = this, xhr = this._xhr;

			if (data && typeof data !== 'string'){
				var contentType = this._header['Content-Type'].split(/ *; */).shift(),
					encode = encoders[contentType];
				if (encode) data = encode(data);
			}

			if (/GET|HEAD/.test(method) && data) url += (url.indexOf('?') > -1 ? '&' : '?') + data;

			xhr.open(method, url, true, user, password);
			if (user != null && 'withCredentials' in xhr) xhr.withCredentials = true;

			xhr.onreadystatechange = function(){
				if (xhr.readyState === 4){
					var status = xhr.status;
					var response = new Response(xhr.responseText, status, parseHeader(xhr.getAllResponseHeaders()));
					var err = response.error ? new Error(method + ' ' + url + ' ' + status) : null;

					delete self._running;
					xhr.onreadystatechange = function(){};
					callback(err, response);
				}
			};

			for (var field in this._header) xhr.setRequestHeader(field, this._header[field]);

			xhr.send(data || null);

			return this;

		}

	});

	var Response = primish({

		constructor: function Response(text, status, header){

			this.text = text;
			this.status = status;

			var contentType = header['Content-Type'] ? header['Content-Type'].split(/ *; */).shift() : '',
				decode = decoders[contentType];

			this.body = decode ? decode(this.text) : this.text;

			this._header = header;

			// statuses from superagent
			// https://github.com/visionmedia/superagent
			// MIT

			var t = status / 100 | 0;

			this.info = t === 1;
			this.ok = t === 2;
			this.clientError = t === 4;
			this.serverError = t === 5;
			this.error = t === 4 || t === 5;

			// sugar
			this.accepted = status === 202;
			this.noContent = status === 204 || status === 1223;
			this.badRequest = status === 400;
			this.unauthorized = status === 401;
			this.notAcceptable = status === 406;
			this.notFound = status === 404;

		},

		header: function(name){
			return (name) ? this._header[capitalize(name)] : null;
		}

	});

	var methods = 'get|post|put|delete|head|patch|options',
		rMethods = RegExp('^' + methods + '$', 'i');

	var agent = function(method, url, data, callback){
		var request = new Request();

		if (!rMethods.test(method)){ // shift
			callback = data;
			data = url;
			url = method;
			method = 'post';
		}

		if (_.isFunction(data)){
			callback = data;
			data = null;
		}

		request.method(method);

		if (url) request.url(url);
		if (data) request.data(data);
		if (callback) request.send(callback);

		return request;
	};

	agent.encoder = function(ct, encode){
		if (arguments.length === 1) return encoders[ct];
		encoders[ct] = encode;
		return agent;
	};

	agent.decoder = function(ct, decode){
		if (arguments.length === 1) return decoders[ct];
		decoders[ct] = decode;
		return agent;
	};

	_.forEach(methods.split('|'), function(method){
		agent[method] = function(url, data, callback){
			return agent(method, url, data, callback);
		};
	});

	agent.Request = Request;
	agent.Response = Response;

	return agent;
});

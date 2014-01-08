define(function(require){
	'use strict';

	var primish = require('primish/primish'),
		options = require('primish/options'),
		emitter = require('primish/emitter'),
		io = require('io');

	return primish({

		implement: [options, emitter],

		options: {
			host: location.host,
			adapter: io
		},

		constructor: function(options){
			this.setOptions(options);
			this.socket = this.options.adapter.connect('ws://' + this.options.host);

			this.attachEvents();

			// this is a singleton. only one instance is allowed
			// memoize the AMD definition for self
			// var self = this;

			/*define('transport', function(){
			 return self;
			 });*/
			this.subscriptions = [];
		},

		attachEvents: function(){
			var self = this;

			// spy on socket.
			this.socket.on('connect', function(){
				self.trigger('connect');
			});

			this.socket.on('disconnect', function(){
				self.trigger('disconnect');
			});

			this.socket.on('reconnect', function(){
				self.trigger('reconnect');
			});
		},

		send: function(message){
			this.socket.emit.apply(this.socket, arguments);
			this.trigger('send', {
				message: message,
				ts: +new Date()
			});
		},

		subscribe: function(message, callback){
			this.subscriptions.push(message);
			this.socket.on(message, callback);
		},

		unsubscribe: function(message, callback){
			// arg1 only: unsubscribe all, arg1 + arg2: specific callback
			var args = [message];
			callback && args.push(callback);

			this.socket[callback? 'removeListener' : 'removeAllListeners'].apply(this.socket, args);
		},

		unsubscribeAll: function(){
			// loop though all subscriptions and remove them.
			var socket = this.socket;
			this.subscriptions.forEach(function(el){
				socket.removeAllListeners(el);
			});
			this.subscriptions = [];
		}
	});
});

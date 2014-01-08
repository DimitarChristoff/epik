var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	path = require('path');

// var io = require('socket.io').listen(8080);

app.use(express.logger('dev'));
app.use(express.bodyParser());

//app.use(express.static('dist/example'));
app.use('/lib/', express.static(path.resolve('lib')));
app.use('/socket.io/', express.static(path.resolve('lib/components/socket.io-client/dist/')));

// factory of restful model resources
var resources = {},
	constructors = {
		users: require('../example/util/person')
	};

app.get('/api/:resource/:id', function(req, res){
	var id = req.params.id,
		resource = req.params.resource;

	resources[resource] || (resources[resource] = {});
	resources[resource][id] || (resources[resource][id] = new constructors[resource]({
		id: id
	}));

	res.send(resources[resource][id].toJSON());
});

app.put('/api/:resource/:id', function(req, res){
	var id = req.params.id,
		resource = req.params.resource;

	resources[resource] || (resources[resource] = {});
	resources[resource][id] || (resources[resource][id] = new constructors[resource]({
		id: id
	}));

	resources[resource][id].set(req.body);
	res.send(resources[resource][id].toJSON());
});




io.sockets.on('connection', function(socket){
	var glob = require('glob');

	socket.on('demos:get', function(){
		glob('dist/example/js/*.js', function(er, files){
			files.sort();
			files = files.map(function(file){
				file = path.basename(file);
				return {
					name: file,
					title: path.basename(file, '.js')
				};
			});
			socket.emit('demos:get', files);
		});
	});
});

exports = module.exports = server;
// delegates user() function
exports.use = function(){
	app.use.apply(app, arguments);
};
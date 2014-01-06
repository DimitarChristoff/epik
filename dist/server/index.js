var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	path = require('path');

app.use(express.logger('dev'));
app.use(express.bodyParser());

//app.use(express.static('dist/example'));
console.log(path.resolve('lib'));
app.use('/lib/', express.static(path.resolve('lib')));

var users = {},
	Person = require('../example/person');

app.get('/api/:resource/:id', function(req, res){
	var id = req.params.id;
	if (!users[id]){
		users[id] = new Person({
			id: id
		}) ;
	}
	res.send(users[id].toJSON());
});

app.put('/api/:resource/:id', function(req, res){
	var id = req.params.id[0];
	if (!users[id]){
		users[id] = new Person({
			id: id
		}) ;
	}
	console.log(res);
	users[id].set(req.body);
	res.send(users[id].toJSON());
});
//
//app.post('api/:resource/:id', function(req, res){
//	res.send({message:'ok'});
//});



io.sockets.on('connection', function(socket){
	// socket.emit('news', { hello: 'world' });
	// socket.on('my other event', function (data) {
	//	console.log(data);
	// });
});

module.exports = app;
/*// delegates user() function
 exports.use = function() {
 app.use.apply(app, arguments);
 };*/

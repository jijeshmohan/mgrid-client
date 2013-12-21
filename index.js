var config = require('./config.json');

var io = require('socket.io-client');
var socket = io.connect(config.serverUrl);


 socket.on('connect', function(){
 	console.log("Connecting Device");
 	socket.emit('deviceInfo', config.device);
    socket.on('disconnect', function(){
    	console.log("Disconnected");
    });
 });

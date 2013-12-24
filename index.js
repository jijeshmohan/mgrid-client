var config = require('./config.json');

var io = require('socket.io-client');
var socket = io.connect(config.serverUrl);


 socket.on('connect', function(){
 	console.log("Connecting Device");
 	socket.emit('deviceInfo', config.device);
 	socket.on("execute",function(data){
 		console.log(data.runitem)
 		console.log("Running tests.......");
 		socket.emit("status",{runitem: data.runitem,status: 'Running'})
 	});
    socket.on('disconnect', function(){
    	console.log("Disconnected");
    	process.exit(0);
    });
 });

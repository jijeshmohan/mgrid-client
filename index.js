var config = require('./config.json');

var io = require('socket.io-client');
var socket = io.connect(config.serverUrl);
var testexecution = require('./testexecution');

 socket.on('connect', function(){
 	console.log("Connecting Device");
 	socket.emit('deviceInfo', config.device);

 	socket.on("execute",function(data){
 		console.log("Running tests.......");
 		socket.emit("status",{runitem: data.runitem,status: 'Running'})
 		testexecution.run(socket,data.runitem.id,config);
 	});
    
    socket.on('disconnect', function(){
    	console.log("Disconnected");
    	process.exit(0);
    });
 });

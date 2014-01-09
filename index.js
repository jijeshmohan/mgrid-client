var io = require('socket.io-client');

var Parser = require('commandline-parser').Parser;

var parser = new Parser({
        name : "mgrid-client",
        desc : 'Mobile grid client',
        extra : 'This command helps you to connect a new device to mobile grid for execution'
    });

parser.addArgument('config' ,{
    flags : ['c','config'], 
    desc : "Specify configuration file",
});

parser.exec();

if(parser.get("help")){
	process.exit(0);
}

run(parser);

function run( parser){
	var config = require(parser.get('config') || './config.json');
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
}
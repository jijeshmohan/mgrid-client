var io = require('socket.io-client');
var exec = require('child_process').exec;
var Parser = require('commandline-parser').Parser;
var testexecution = require('./testexecution');

var isConnected=false;
var firstRun=true;
var socket;
var parser = new Parser({
        name : "mgrid-client",
        desc : 'Mobile grid client',
        extra : 'This command helps you to connect a new device to mobile grid for execution'
    });

parser.addArgument('config' ,{
    flags : ['c','config'], 
    desc : "Specify configuration file ( default is ./config.json )",
});

parser.exec();

if(parser.get("help")){
	process.exit(0);
}

var config = require(parser.get('config') || './config.json');

if(config.device.platform==="android"){
	waitForDevice();
}else{
	run();
}

function waitForDevice () {

	var options = { encoding: 'utf8',
					  timeout: 2000,
					  maxBuffer: 200*1024,
					  killSignal: 'SIGTERM',
					  cwd: null,
					  env: null 
				};
	var child = exec("adb devices",options,function(error, stdout, stderr) {
	 	if(error != null){
	 		console.log(error);
	 	}
	 	else if (stdout.trim().split('\n').length > 1){
	 		if(isConnected===false){ 
	 			console.log('device connected');
	 			isConnected=true;
	 			run();
	 		};
	 	}else{
	 		if(isConnected===true){
	 			console.log('device disconnected');
	 			isConnected=false;
	 			socket.disconnect();
	 		} 
	 	}
	 });	
	 setTimeout(waitForDevice,5*1000);
}

function run(){
	socket=null;
	socket = io.connect(config.serverUrl,{'force new connection': true});
	socket.on('connecting', function () {
		console.log('connecting....');
	});
	socket.on('error', function () {
		console.log("error while connecting to server");
	})
	 socket.on('connect', function(){
	 	console.log("Device Connected");
	 	socket.emit('deviceInfo', config.device);

	 	socket.on("execute",function(data){
	 		console.log("Running tests.......");
	 		socket.emit("status",{runitem: data.runitem,status: 'Running'})
	 		testexecution.run(socket,data.runitem.id,config);
	 	});
	    
	    socket.on("get_scenarios",function(data){
	 		console.log("request scenario lists.......");
	 		testexecution.list(socket,config);
	 	});

	    socket.on('disconnect', function(){
	    	console.log("Disconnected");
	    	if(config.device.platform!=="android"){ process.exit(0); }
	    });
	 });
}


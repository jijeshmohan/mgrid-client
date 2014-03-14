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
	 	}else if(config.device.id){
	 		if(findDevice(config.device.id,stdout.trim())){
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
	 	}else if (stdout.trim().split('\n').length > 1){
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
function findDevice (deviceId,txt) {
	var lines = txt.split('\n')
	if(lines.length<2){
		return false
	}
	for (var i =1;i<lines.length;i++) {
		if(lines[i].split("\t")[0]==deviceId){
			return true
		}
	};
	return false
}
function run(){
	socket=null;
	socket = io.connect(config.serverUrl,{'force new connection': true});
	socket.on('connecting', function () {
		console.log('connecting....');
	});
	socket.on('error', function (data) {
		console.log("error while connecting to server :"+ data);
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

			socket.on("execute_scenario",function(data){
				console.log("execute scenario ......." + JSON.stringify(data));
				testexecution.runScenario(socket,data.runitem_id,data.scenario,config);
			});

		socket.on('disconnect', function(){
			console.log("Disconnected");
			if(config.device.platform!=="android"){ process.exit(0); }
		});
	 });
}


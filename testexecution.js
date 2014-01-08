var path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;
    mkdirp = require('mkdirp');
 
 exports.run = function(socket,id,config){
      var report_folder = new Date().getTime();
      var environment = process.env;
      var path = __dirname + "/" + config.reportDir + "/" + report_folder;

      mkdirp.sync(path);

      for(key in config.environment){
        environment[key]=config.environment[key];
      }

      var command = 'cucumber -d -f json -o '+ path +'/result.json';

      var options = {
        cwd: config.projectPath,
        env: environment
      };
      child = exec(command, options,function(error, stdout, stderr) {
            if (error !== null) {
            	console.log("Error while execution");
              	socket.emit('result',{result: {},id: id});
            }
           	var result = require(path +'/result.json');
            socket.emit('result',{result: result,id: id});
      });

};

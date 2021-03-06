var path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;
    mkdirp = require('mkdirp');
 
exports.run = function(socket,id,config){
  if(config.type && config.type==="mvn"){
      maven_run(socket,id,config);
   }else if(config.type==="android"){
     android_run(socket,id,config);
   }else {
     cucumber_run(socket,id,config);
   }
};


exports.runScenario = function(socket,id,scenario,config){
  if(config.type && config.type==="mvn"){
      // TODO
   }else if(config.type==="android"){
     android_run(socket,id,config,scenario);
   }else {
     cucumber_run(socket,id,config,scenario);
   }
};

exports.list=function(socket,config){
  if(config.type && config.type==="mvn"){
      console.log("Not implemented..")
   }else {
     cucumber_dry_run(socket,config)
   }
};

function android_run(socket,id,config,scenario){
   var report_folder = new Date().getTime();
      var environment = process.env;
      var path = __dirname + "/" + config.reportDir + "/" + report_folder;

      mkdirp.sync(path);

      for(key in config.environment){
        environment[key]=config.environment[key];
      }
    
      var command = 'calabash-android run '+ config.apk +' -f json -o '+ path +'/result.json';
      if (typeof scenario !== 'undefined') {
        command = command + " " + scenario.uri
      }
      var options = {
        cwd: config.projectPath,
        env: environment
      };
      child = exec(command, options,function(error, stdout, stderr) {
            if (error !== null) {
                console.log("Error while execution" + error);
                // socket.emit('result',{result: {},id: id});
            }
            var result = require(path +'/result.json');
            if (typeof scenario !== 'undefined') {
              socket.emit('scenario_result',{result: result,id: id,scenario: scenario});
            }else{
               socket.emit('result',{result: result,id: id});
            }
      });
}

function maven_run(socket,id,config){
   var report_folder = new Date().getTime();
      var environment = process.env;
      
      for(key in config.environment){
        environment[key]=config.environment[key];
      }

      var command = 'mvn clean test';

      var options = {
        cwd: config.projectPath,
        env: environment
      };

      child = exec(command, options,function(error, stdout, stderr) {
            if (error !== null) {
                console.log("Error while execution" + error);
                // socket.emit('result',{result: {},id: id});
            }
            var result = require(config.projectPath +'/target/cucumber-json-report.json');
            socket.emit('result',{result: result,id: id});
      });
}

function cucumber_run(socket,id,config,scenario){
   var report_folder = new Date().getTime();
      var environment = process.env;
      var path = __dirname + "/" + config.reportDir + "/" + report_folder;

      mkdirp.sync(path);

      for(key in config.environment){
        environment[key]=config.environment[key];
      }

      var command = 'cucumber -f json -o '+ path +'/result.json';
      if (typeof scenario !== 'undefined') {
        command = command + " " + scenario.uri
      }
      var options = {
        cwd: config.projectPath,
        env: environment
      };
      child = exec(command, options,function(error, stdout, stderr) {
            if (error !== null) {
                console.log("Error while execution");
                // socket.emit('result',{result: {},id: id});
            }
            var result = require(path +'/result.json');
             if (typeof scenario !== 'undefined') {
              socket.emit('scenario_result',{result: result,id: id,scenario: scenario});
            }else{
               socket.emit('result',{result: result,id: id});
            }
      });
}

function cucumber_dry_run(socket,config){
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
              socket.emit('result',{result: {}});
              return;
            }
            var result = require(path +'/result.json');
            socket.emit('scenarios',{result: result});
      });
}
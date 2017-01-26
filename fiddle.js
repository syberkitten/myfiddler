
  "use strict";

  // CORE MODULES

  var proxyPort        = 8080;
  var fs          = require('fs');

  // NPM PACKAGES


  // CONFIGURATION

  var staticServerPort  = 9001;


  var currentDir = process.cwd();
  var files      = [];
  var target;




  const proxy = require('./lib/proxy');


  function log() {
    console.log.apply(this,arguments)
  }

  /*====== CREATE FILE REPLACEMENT LIST ======*/

  if ( process.argv.length > 2 ){

    // PRODUCE FILE REPLACEMENT LIST FROM COMMAND LINE ARGUMENTS
    var args = process.argv.slice(2);
    process.argv.slice(2).forEach(function (fileName) {
      files.push( fileName );
    });

    if (args.indexOf('start')>-1) {
      log('starting server');

      proxy.init(staticServerPort,proxyPort);
    } else {
      log('unknown command!');
    }


  } else {

    // PRODUCE FILE REPLACEMENT LIST FROM CURRENT DIR
    files = fs.readdirSync(currentDir);

  }



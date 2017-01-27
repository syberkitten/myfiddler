
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




  var proxyModule = require('./lib/proxy');


  function log() {
    console.log.apply(this,arguments)
  }

  /*====== CREATE FILE REPLACEMENT LIST ======*/

  //const proxy = proxyModule.init(staticServerPort,proxyPort);
  //log('starting proxyModule server')


  if ( process.argv.length > 2 ){

    // PRODUCE FILE REPLACEMENT LIST FROM COMMAND LINE ARGUMENTS
      var proxy = proxyModule.init(staticServerPort,proxyPort);

  } else {

    // PRODUCE FILE REPLACEMENT LIST FROM CURRENT DIR
    //files = fs.readdirSync(currentDir);

  }


  module.exports = {
      init: function () {
          return new Promise((resolve, reject) => {
              log('starting proxyModule server')
              var proxy = proxyModule.init(staticServerPort,proxyPort).then((proxyApp)=>{
                  //if (err) {
                  //    return reject(e);
                  //} else {
                      return resolve(proxyApp);
                  //}
              });

          });

      }
  }



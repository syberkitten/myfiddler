(function() {

  "use strict";

  // CORE MODULES

  var port        = 8080;
  var path        = require('path');
  var url         = require('url');
  var fs          = require('fs');
  var http        = require('http');

  // NPM PACKAGES

  var util        = require('util');
  var colors      = require('colors');
  var httpProxy   = require('http-proxy');
  var connect     = require('connect');
  var serveStatic = require('serve-static');

  // CONFIGURATION

  var localPort  = 9000;
  var localhost  = "http://localhost:" + localPort + "/";
  var proxy      = httpProxy.createProxyServer({});
  var currentDir = process.cwd();
  var files      = [];
  var target;

  /*====== CREATE FILE REPLACEMENT LIST ======*/

  if ( process.argv.length > 2 ){

    // PRODUCE FILE REPLACEMENT LIST FROM COMMAND LINE ARGUMENTS
    var args = process.argv.slice(2);
    process.argv.slice(2).forEach(function (fileName) {
      files.push( fileName );
    });

  } else {

    // PRODUCE FILE REPLACEMENT LIST FROM CURRENT DIR
    files = fs.readdirSync(currentDir);

  }

  /*====== CREATE PROXY SERVER ======*/

  var server = http.createServer(function(req, res) {

    if ( files.indexOf(path.basename(req.url)) > -1 ){

      req.url = localhost + path.basename( req.url );
      target  = localhost;

    } else {

      target = 'http://' + req.headers.host;

    }

    proxy.web( req, res, { target: target }); 

  }).listen( port, function(){

    util.puts('HTTP PROXY SERVER'.red + ' LISTENING ON PORT: '.green.bold + port.toString().yellow);

  });

  /*====== STATIC SERVER : SERVING REPLACEMENT FILES ======*/

  var app        = connect();
      app.use(serveStatic(currentDir));

  http.createServer(app).listen( localPort, function(){

    util.puts('LOCAL STATIC HTTP SERVER'.red + ' SERVING ON PORT: '.green.bold + localPort.toString().yellow);

  });

  /* proxy.close(); */

}).call(this);

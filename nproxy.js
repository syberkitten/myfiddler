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

  var localPort  = 9001;
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

    var reqUrl = path.basename(req.url).split("?");
        reqUrl = reqUrl[0];

    var headers = req.headers;
    var userAgent = headers['user-agent'];

    console.log('reqUrl:',reqUrl.cyan);
    console.log('headers:',headers);
    /*if ( process.argv.length < 3 ){

      files = fs.readdirSync(currentDir);

    }
    console.log('files:',files)
    */
    var matches = reqUrl.match(/\.mp4/gi);
    if (matches && matches.length == 1) {

      util.puts("matched mp4: " + reqUrl.cyan.bold,' replacing with default'.green );
      //req.url = localhost + reqUrl;
      req.url = localhost + "SampleVideo_1280x720_1mb.mp4";
      target  = localhost;

    } else {

      target = 'http://' + req.headers.host;

    }

    util.puts('target:',target.yellow)
    // todo remove this favor for above match
    //target = 'http://' + req.headers.host;

    proxy.web( req, res, { target: target }); 

  }).listen( port, function(){

    util.puts('HTTP PROXY SERVER'.red + ' LISTENING ON PORT: '.green.bold + port.toString().yellow);

  });

  /*====== STATIC SERVER : SERVING REPLACEMENT FILES ======*/

  var app        = connect();
      app.use(serveStatic(currentDir+"/static/"));

  http.createServer(app).listen( localPort, function(){

    util.puts('LOCAL STATIC HTTP SERVER'.red + ' SERVING ON PORT: '.green.bold + localPort.toString().yellow);

  });

  /* proxy.close(); */

}).call(this);

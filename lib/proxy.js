/**
 * Created by liam.bilich on 26/01/2017.
 */


var util        = require('util');
var colors      = require('colors');
var connect     = require('connect');
var serveStatic = require('serve-static');
var httpProxy   = require('http-proxy');
var http        = require('http');
var path        = require('path');
var url         = require('url');


var proxy      = httpProxy.createProxyServer({});

proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. proxy unable to route request');
});



var currentDir = process.cwd();

var server;
var app  = connect();
var localHost;

function start_static_server(localPort) {

    var static_serve_url = currentDir+"/media/static/";
    log('static_serve_url:',static_serve_url );
    app.use(serveStatic(static_serve_url));

    http.createServer(app).listen( localPort, function(){

        util.puts('LOCAL STATIC HTTP SERVER'.red + ' SERVING ON PORT: '.green.bold + localPort.toString().yellow);

    });

}

function start_proxy_server(port) {
    server = http.createServer(function(req, res) {

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
            req.url = localHost + "SampleVideo_1280x720_1mb.mp4";
            target  = localHost;

        } else {

            target = 'http://' + req.headers.host;

        }

        if (target.search(/:\d{4,6}/) >-1) {
            log('not legal redirect, ignoring');
            //return;
        }

        util.puts('Request URL:'.yellow,target.yellow)
        // todo remove this favor for above match
        //target = 'http://' + req.headers.host;

        proxy.web( req, res, { target: target });


    }).listen( port, function(){

        util.puts('HTTP PROXY SERVER'.red + ' LISTENING ON PORT: '.green.bold + port.toString().yellow);

    });
}


function log() {
    console.log.apply(this,arguments)
}



module.exports = {
    init:function(staticServerPort,proxyPort) {

        localHost = "http://localhost:" + staticServerPort + "/";
        start_static_server(staticServerPort);
        start_proxy_server(proxyPort);
        return proxy;
    }
}
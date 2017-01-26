/**
 * Created by liam.bilich on 26/01/2017.
 */


const util        = require('util');
const colors      = require('colors');
const connect     = require('connect');
const serveStatic = require('serve-static');
const httpProxy   = require('http-proxy');
const http        = require('http');
const path        = require('path');
const url         = require('url');
const transformerProxy = require('transformer-proxy');
const Promise = require('promise');
const replaceStream = require('replacestream');
const proxy      = httpProxy.createProxyServer({});


var currentDir = process.cwd();
var middlerWareArr = []
var server;
var app  = connect();
var proxyApp  = connect();
var localHost;


var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var middleWare = require('./middleware');

proxy.on('error', function (err, req, res) {
    if (!res) {
        return;
    }
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. proxy unable to route request');
});

proxy.on('proxyRes', function (proxyRes, req, res) {
    //log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    //log('RAW Response from the target', res);
});

proxy.on('open', function (proxySocket) {
    // listen for messages coming FROM the target here
    proxySocket.on('data', function(data){
        log('got data:',data)
    });
});





function start_static_server(localPort) {

    var static_serve_url = currentDir+"/media/static/";
    var styles_serve_url = currentDir+"/media/css/";
    log('static_serve_url:',static_serve_url );

    app.use(serveStatic(static_serve_url));
    app.use(serveStatic(styles_serve_url));


    http.createServer(app).listen( localPort, function(){

        util.puts('LOCAL STATIC HTTP SERVER'.red + ' SERVING ON PORT: '.green.bold + localPort.toString().yellow);

    });

}


var streamMiddler = function(req,res,next) {
    // Magic starts HERE
    // Put here any Transform stream you wish, I used replaceStream,
    // you can write your own using following method
    // http://codewinds.com/blog/2013-08-20-nodejs-transform-streams.html#creating-transform-stream-which-uppercases-all-text

    var replace = replaceStream('hello', 'there');
     var _write = res.write;
     var _end = res.end;

     replace.on('data', function(buf){
        _write.call(res, buf);
         //console.log('DATA|<<<<')
     });

     replace.on('end', function(){
     _end.call(res);
     });

     res.write = function(data){
         var str = decoder.write(data);
         log('data::',str)
        replace.write(str);
     };
     res.end = function(){
        replace.end();
     };
     // Magic ends HERE


    next()
}




var transformerFunction = function (data, req, res) {

    var StringDecoder = require('string_decoder').StringDecoder;
    var decoder = new StringDecoder('');

    return new Promise(function(resolve, reject) {


        var str = decoder.write(data);
        log('data1:',str);
        //resolve(data + '<br />Google.com request status code: ');
        resolve(str);
        //reject(error.message);

    });
};

var transformerFunctionSimple = function (data, req, res) {


    //log('data2:',data);
    //return data + "THIS IS A TEST" // an additional line at the end of every file";
    var str = decoder.write(data);
    log('data1:',str);
    return str;
};



var proxyMiddler = function(req,res,next){

    // Magic starts HERE
    // Put here any Transform stream you wish, I used replaceStream,
    // you can write your own using following method
    // http://codewinds.com/blog/2013-08-20-nodejs-transform-streams.html#creating-transform-stream-which-uppercases-all-text
    /*var replace = replaceStream('hello', 'there');
    var _write = res.write;
    var _end = res.end;

    replace.on('data', function(buf){
        _write.call(res, buf);
    });
    replace.on('end', function(){
        _end.call(res);
    });

    res.write = function(data){
        replace.write(data);
    };
    res.end = function(){
        replace.end();
    };
    // Magic ends HERE
*/


    //var reqUrl = path.basename(req.url).split("?");
    var target = 'http://' + req.headers.host;
    const reqUrl = req.url;
    var headers = req.headers;
    var userAgent = headers['user-agent'];

    log('reqUrl:',reqUrl.cyan);
    log('headers:',headers);
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



    /*var _write = res.write;
    var _end = res.end;

    replace.on('data', function(buf){
        _write.call(res, buf);
        //console.log('DATA|<<<<')
    });

    replace.on('end', function(){
        _end.call(res);
    });

    res.write = function(data){
        //var str = decoder.write(data);
        //log('data::',str)
        replace.write(data);

    };
    res.end = function(){
        replace.end();
    };*/




    proxy.web( req, res, { target: target });
    res.pipe(replaceStream('component', 'gagmeter'));

    //proxy.web( req, res);

    //next()


};



function start_proxy_server(port) {

    //proxyApp.use(streamMiddler);


    //proxyApp.use(transformerProxy(transformerFunctionSimple));
    //proxyApp.use(streamMiddler);
    proxyApp.use(middleWare);
    proxyApp.use(proxyMiddler);


    server = http.createServer(proxyApp).listen( port, function(){

        //util.puts('HTTP PROXY SERVER'.red + ' LISTENING ON PORT: '.green.bold + port.toString().yellow);

    });
}

function log() {
    console.log.apply(this,arguments)
}




module.exports = {
    init:function(staticServerPort,proxyPort) {
        log('init()!!!!!!');
        localHost = "http://localhost:" + staticServerPort + "/";
        start_static_server(staticServerPort);
        start_proxy_server(proxyPort);
        return proxy;
    },
    use: function(middleWare) {
        found = false;
        middlerWareArr.forEach(function(item){
            if (item == middleWare) {
                log('middleware:',middleWare,' current:',item)
                found = true;
            }
        });
        if (!found) {
            middlerWareArr.push(middleWare)
        }
    }
}
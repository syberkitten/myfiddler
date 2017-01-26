/**
 * Created by liam.bilich on 26/01/2017.
 */
var zlib = require('zlib');
const replaceStream = require('replacestream');



function prepareResponseSelectors(req, res,next) {

    var _write      = res.write;
    var _end        = res.end;
    var _writeHead  = res.writeHead;
    var gunzip      = zlib.Gunzip();
    const _htmlOnly = false;
    var replace = replaceStream('.','...');
    //var replace = replaceStream('','');


    // data should be normal text here, and not gzippped
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
    };

    //prepareSelectors(tr, _resSelectors, req, res);

    // Assume response is binary by default
    res.isHtml = false;

    // Assume response is uncompressed by default
    res.isGziped = false;

    res.writeHead = function () {
        var code = arguments[0];
        var headers = (arguments.length > 2) ? arguments[2] : arguments[1]; // writeHead supports (statusCode, headers) as well as (statusCode, statusMessage, headers)

        var contentType = this.getHeader('content-type');
        var contentEncoding = this.getHeader('content-encoding');

        /* Sniff out the content-type header.
         * If the response is HTML, we're safe to modify it.
         */
        if (!_htmlOnly || ((typeof contentType != 'undefined') && (contentType.indexOf('text/html') == 0))) {
            res.isHtml = true;

            // Strip off the content length since it will change.
            res.removeHeader('Content-Length');

            if (headers) {
                delete headers['content-length'];
            }
        }

        /* Sniff out the content-type header.
         * If the response is Gziped, we're have to gunzip content before and ungzip content after.
         */
        if (res.isHtml && contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
            res.isGziped = true;

            // Strip off the content encoding since it will change.
            res.removeHeader('Content-Encoding');

            if (headers) {
                delete headers['content-encoding'];
            }
        }

        _writeHead.apply(res, arguments);
    };




    /*
    res.write = function(data){
        //var str = decoder.write(data);
        //log('data::',str)
        replace.write(str);
    };
    res.end = function(){
        replace.end();
    };
*/


    res.write = function (data, encoding) {
        // Only run data through trumpet if we have HTML
        if (res.isHtml) {
            if (res.isGziped) {
                gunzip.write(data);
            } else {
                replace.write(data);
            }
        } else {
            _write.apply(res, arguments);
        }
    };

    replace.on('data', function(buf){
        _write.call(res, buf);
        //console.log('DATA|<<<<')
    });

    replace.on('end', function(){
        _end.call(res);
    });


    gunzip.on('data', function (buf) {
        replace.write(buf);
    });

    res.end = function (data, encoding) {
        if (res.isGziped) {
            gunzip.end(data);
        } else {
            replace.end(data,encoding);
        }
    };

    gunzip.on('end', function (data) {
        replace.end(data);
    });

    next();

}


module.exports = prepareResponseSelectors;
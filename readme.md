rerequest
=========

This module creates fake (mock) HTTP request/response objects that you can feed in to an Express app.  The entire request is handled in-process, meaning you don't waste time and resources making TCP connections to localhost.

Example
-------

    var express = require('express')
        , app = express()
        , Rerequest = require('rerequest')
        , rrq = new Rerequest(app);

    app.get('/test-real', function(req, res) {
        res.send('I just return some text.');
    });

    app.get('/test-rerequest', function(req, res) {
        rrq.get('/test-real', function(result) {
            res.send('The other route returns ' + result.statusCode + ' and says ' + result.body);
        });
    });

Everything that your rerequested route "writes" is buffered in memory, and when it calls `res.end`, your callback is called with the response object with a few things added:

- `res.body` - a `Buffer` containing the body of the HTTP response (if there was one), **or** if the `Content-Type` header was set to `application/json`, the response body is automatically parsed and and you get an object.
- `res._content` - always the raw body `Buffer`.

Most of the other normal response properties (like `headers` and `statusCode`) are of course available.

Options
-------

    rrq.post('/url', {
        session: req.session, // pass along the client's session object
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': req.host // if you're doing any vhosty type stuff
        },
        body: 'key=value&awesome=true', // Content-Length is automatically set
        socket: req.socket // copies socket.remoteAddress and friends to the rerequest
    }, function (result) {
        // ...
    });

If your app uses the session middleware, you must pass the client's session object (or an empty one), otherwise things break.
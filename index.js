var Request = require('./request')
	, Response = require('./response');

var Rerequest = module.exports = exports = function Rerequest(app) {
	this.app = app;
	return this;
}

Rerequest.prototype.get = function(url, opts, cb) {
	this.request('GET', url, opts, cb);
};
Rerequest.prototype.post = function(url, opts, cb) {
	this.request('POST', url, opts, cb);
};
Rerequest.prototype.put = function(url, opts, cb) {
	this.request('PUT', url, opts, cb);
};
Rerequest.prototype.delete = function(url, opts, cb) {
	this.request('DELETE', url, opts, cb);
};
Rerequest.prototype.options = function(url, opts, cb) {
	this.request('OPTIONS', url, opts, cb);
};
Rerequest.prototype.head = function(url, opts, cb) {
	this.request('HEAD', url, opts, cb);
};

Rerequest.prototype.request = function(method, url, opts, cb) {

	if (typeof opts == 'function') {
		cb = opts;
		opts={};
	}
	opts = opts || {};
	opts.headers = opts.headers || {};

	if (method == 'POST' || method == 'PUT') {
		if (opts.body) {
			if (typeof opts.body == 'object') {
				opts.headers['x-rerequest-body'] = 'direct-object';
			} else {
				opts.body = new Buffer(opts.body.toString());
				opts.headers['content-length'] = opts.body.length;
				if (!opts.headers['content-type']) opts.headers['content-type'] = 'application/x-www-form-urlencoded';
			}
		}
	} else opts.body = null;


	var req = new Request(method, url, opts.headers)
		, res = new Response()
		, reqProto = this.app.request.__proto__.__proto__
		, resProto = this.app.response.__proto__.__proto__;

	if (typeof opts.body == 'object') req.body = opts.body;
	req.session = opts.session;

	// Express fucks with the prototype chain, so we have to replace the real
	// ServerResponse with our own
	this.app.request.__proto__.__proto__ = req.__proto__;
	this.app.response.__proto__.__proto__ = res.__proto__;



	res.on('end', function() {
		process.nextTick(function() { // we have to do this on the next tick because of the prototype chain fuckery
			if (res._content) res.body = res._content.toString();

			res.headers = res._headers;

			var ct = res.headers['Content-Type'] || res.headers['content-type'] || '';
			if (ct.substr(0,16).toLowerCase() == 'application/json') { // substr because content-type can include charset info too
				try {
					// Yes, it's wasteful that we have to deserialize JSON text here,
					// but there's no way to get the pre-serialized object without
					// requiring rerequest-specific modifications to your web server library
					// (ie Express), so we'll just suck it up and take the perf hit.
					res.body = JSON.parse(res.body);
				} catch (ex) {
					console.error('json parse error', ex);
					res.body = null;
				}
			}
			cb(res);
		});
	});

	this.app(req, res);

	req.end(opts.body);

	// ...and then restore it after the request is initiated
	this.app.request.__proto__.__proto__ = reqProto;
	this.app.response.__proto__.__proto__ = resProto;


}
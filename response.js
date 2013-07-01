var util = require('util'),
	statusCodes = require('http').STATUS_CODES
	EventEmitter = require('events').EventEmitter;

var MockHTTPResponse = module.exports = exports = function MockHTTPResponse() {
	var self = this, status = 200;

	this.writable = true;
	
	Object.defineProperty(this, 'statusCode', { // define a setter so that we can change the reason text when the code changes
		configurable: true,
		enumerable: true,
		get: function() {
			return status;
		},
		set: function(val) {
			status = val;
			self._reason = statusCodes[val] || 'unknown';
		}
	});

	this.sendDate = false;
	this._headers = {};
	this._reason = 'OK';
	this._content = null;
	this._trailers = {};
	//this.output = [];
	//this.outputEncodings = [];
}


util.inherits(MockHTTPResponse, EventEmitter);

MockHTTPResponse.prototype.writeContinue = function() {};
MockHTTPResponse.prototype._implicitHeader = function() {};

MockHTTPResponse.prototype.writeHead = function(statusCode, reason, headers) {
	if (typeof reason == 'object') {
		headers = reason;
		reason = null;
	}

	if (typeof headers == 'object') for (var k in headers) {
		this._headers[k] = headers[k];
	}

	if (typeof reason == 'string') this._reason = reason;
	else this._reason = statusCodes[statusCode] || 'unknown'; // consistent with node/lib/http.js

	this.statusCode = statusCode;
};

MockHTTPResponse.prototype.setHeader = function(name, value) {
	this._headers[name] = value;
};

MockHTTPResponse.prototype.getHeader = function(name) {
	return this._headers[name];
};

MockHTTPResponse.prototype.removeHeader = function(name) {
	delete this._headers[name];
};

MockHTTPResponse.prototype.write = function(chunk, encoding) {
	if (!this._content) this._content = new Buffer(chunk, encoding);
	else this._content = Buffer.concat([this._content, new Buffer(chunk, encoding)]);

	return true;
};

MockHTTPResponse.prototype.addTrailers = function(trailers) {
	for (var k in trailers) this._trailers[k] = trailers[k];
};

MockHTTPResponse.prototype.end = function(data, encoding) {
	if (data) this.write(data, encoding);

	// make statusCode a regular property so that the int actually shows up in the console
	Object.defineProperty(this, 'statusCode', {
		configurable: true,
		enumerable: true,
		value: this.statusCode
	});

	this.emit('end');
};



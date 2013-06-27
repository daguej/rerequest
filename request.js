var util = require('util'),
	EventEmitter = require('events').EventEmitter;

var MockHTTPRequest = module.exports = exports = function MockHTTPRequest(method, url, headers) {
	this.httpVersion = '1.0';
	this.headers = headers || {};
	this.trailers = {};
	this.method = method || 'GET';
	this.url = url;
	this.connection = {};
	/*this.socket = {
		destroy: function() {
			process.exit(1);
		}
	}*/

}

util.inherits(MockHTTPRequest, EventEmitter);

MockHTTPRequest.prototype.setEncoding = function(encoding) {
	this._encoding = encoding;
}

MockHTTPRequest.prototype.write = function(chunk, encoding) {
	chunk = new Buffer(chunk, encoding);
	if (!this._content) this._content = chunk;
	else this._content = Buffer.concat([this._content, chunk]);

	this.emit('data', this._encoding ? chunk.toString(encoding) : chunk);
};

MockHTTPRequest.prototype.addTrailers = function(trailers) {
	for (var k in trailers) this.trailers[k] = trailers[k];
};

MockHTTPRequest.prototype.end = function(data, encoding) {
	if (data) this.write(data, encoding);

	this.emit('end');
};


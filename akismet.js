var sys = require('sys'),
	http = require('http'),
	querystring = require('querystring')
	;

var VERSION = '0.1',
	DEFAULT_AGENT = 'akismetjs',
	akismet = exports
	;

akismet.AkismetError = function(msg) {
	this.getMessage = function() { return msg; };
};

akismet.Akismet = function(options) {
	var _baseUrl = 'rest.akismet.com',
		_apiVersion = '1.1',
		_key,
		_blog,
		_userAgent,

		// All supported Akismet methods
		_methods = {
			verifyKey: {
				methodName: 'verify-key',
				url: _baseUrl,
				requires: [],
				callback: function(data, callback) {
					callback(data != 'invalid');
				}
			}
		},

		self = this

		;

	this.setOptions = function(o) {
		_key = o.key;
		_blog = o.blog;
		_userAgent = o.userAgent;
	};
	
	if (options) {
		this.setOptions(options);
	}

	if (_userAgent) _userAgent = [DEFAULT_AGENT, VERSION].join('/');

	// Make each method callable
	for (var k in _methods) {
     	self[k] = function(params) {
          	self.call(k, params);
		};
	}

	/* 
	 * Akismet API call
	 * See: http://akismet.com/development/api/
	 */ 
	this.call = function(name, params, callback) {
		if (!_key || !_blog) throw new akismet.AkismetError('Akismet API key  or blog URL not set');
		if (!_methods[name]) throw new akismet.AkismetError('Method not found: ' + name);

		var m = _methods[name],
			path = _getPath(m.methodName)
			;

		if (!params) params = {};

		params.key = _key;
		params.blog = _blog;

		// Check we have all required keys
		for (var i=0, key; key = m.requires[i]; i++) {
         	if (!(key in params)) {
             	throw new akismet.AkismetError('Required key not found for method ' + name + ': ' + key);
			}
		}

		_fetchUrl(m.url, path, params, function(data) { 
			m.callback(data, callback);
		});
	};

	/*
	 * Returns the URL for our webservice calls
	 */
	function _getUrlWithKey() {
		return [_key, _baseUrl].join('.');
	}

	/*
	 * Returns a HTTP path corresponding to the name of the API call 
	 */
	function _getPath(methodName) {
     	return ['', _apiVersion, methodName].join('/');
	}

	function _fetchUrl(host, path, params, callback) {
		var client = http.createClient(80, host),
			toWrite = querystring.stringify(params),
			request = client .request('POST', path, {
				host: host,
				'Content-Length': toWrite.length
			}),
			data = []
			;

		request.addListener('response', function (response) {
		  response.setEncoding('utf8');
		  response.addListener('data', function (chunk) {
			  data.push(chunk);
		  });
		  response.addListener('data', function (chunk) {
			  callback(data.join(''));
		  });
		});
		
		request.write(toWrite);
		request.end();
	}
};


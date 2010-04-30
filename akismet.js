var sys = require('sys'),
	http = require('http'),
	querystring = require('querystring'),
    events = require('events')
	;

var VERSION = '0.1',
    PLUGIN = 'akismetjs',
	DEFAULT_APP = 'Akismet for Node.js',
	akismet = exports
	;

akismet.Akismet = function(options) {
	var self = this,
        _baseUrl = 'rest.akismet.com',
		_apiVersion = '1.1',
		_key,
		_blog,
		_userAgent,

		// All supported Akismet methods
		_methods = {
			verifyKey: {
				methodName: 'verify-key',
                includeKey: false,
				requires: [],
				callback: function(response, data) {
					return data == 'valid';
				}
			},
            commentCheck: {
                methodName: 'comment-check',
                includeKey: true,
                requires: ['user_ip'],
                callback: function(response, data) {
                    return data == 'true';
                }
            },
            submitSpam: {
                methodName: 'submit-spam',
                includeKey: true,
                requires: ['user_ip'],
                callback: function(response, data) {
                    // nothing?
                }
            },
            submitHam: {
                methodName: 'submit-ham',
                includeKey: true,
                requires: ['user_ip'],
                callback: function(response, data) {
                    // nothing?
                }
            }
		}
		;
	
	if (options) setOptions(options);

	_userAgent = (_userAgent || DEFAULT_APP + '/' +  VERSION) + ' | ' + PLUGIN + '/' + VERSION

	// Make each method callable
	for (var k in _methods) {
        (function(methodName) {
            self[methodName] = function(params) {
                self.call(methodName, params);
            };
        })(k);
	}

    /*
     * @param {hash} o 
     */
	self.setOptions = function(o) {
        setOptions(o);
	};

	/* 
	 * Akismet API call
	 * See: http://akismet.com/development/api/
     *
     * @param {string} name
     * @param {hash} params
	 */ 
	self.call = function(name, params) {
		if (!_key || !_blog) throw new Error('Akismet API key  or blog URL not set');
		if (!_methods[name]) throw new Error('Method not found: ' + name);

		var m = _methods[name],
			path = _getPath(m.methodName),
            host = m.includeKey ? _getUrlWithKey() : _baseUrl
			;

		if (!params) params = {};

		params.key = _key;
		params.blog = _blog;

		// Check we have all required keys
		for (var i=0, key; key = m.requires[i]; i++) {
         	if (!(key in params)) {
             	throw new Error('Required key not found for method ' + name + ': ' + key);
			}
		}

		_fetchUrl(host, path, params, m.callback);

	};

    /*
     * @param {hash} o
     */
    function setOptions(o) {
		_key = o.key;
		_blog = o.blog;
		_userAgent = o.userAgent;
    }

	/*
	 * @return the URL for our webservice calls
	 */
	function _getUrlWithKey() {
		return [_key, _baseUrl].join('.');
	}

	/*
     * @param {string} methodName
	 * @return a HTTP path corresponding to the name of the API call 
	 */
	function _getPath(methodName) {
     	return ['', _apiVersion, methodName].join('/');
	}

    /*
     * @param {string} host
     * @param {string} path
     * @param {hash} params
     * @param {function} callback
     */
	function _fetchUrl(host, path, params, callback) {
		var client = http.createClient(80, host),
            postBody = querystring.stringify(params),
			request = client.request('POST', path, {
				'host': host,
                'User-Agent': _userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postBody.length
			}),
			data = []
			;

        request.addListener('response', function (response) {
            response.setEncoding('utf8');
            response.addListener('data', function (chunk) {
                data.push(chunk);
            });
            response.addListener('data', function () {
                //for (var k in response.headers) sys.puts([k, response.headers[k]].join('='));
                self.emit('response', callback(response, data.join('')));
            });
        });

        request.write(postBody);
		request.end();
	}
};

akismet.createClient = function(options) {
    return new akismet.Akismet(options);
};

sys.inherits(akismet.Akismet, events.EventEmitter);

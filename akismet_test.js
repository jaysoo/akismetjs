var akismet = require('./akismet'),
	sys = require('sys')
	;

var a = new akismet.Akismet({
   	key: 'some_key',
	blog: 'http://www.example.com/'
});

a.addListener('response', function(valid) {
    sys.puts(valid);
});

a.call('verifyKey');

var akismet = require('./akismet'),
	sys = require('sys')
	;

var a = new akismet.Akismet({
   	key: 'fake',
	blog: 'http://www.example.com/'
});

a.addListener('response', function(valid) {
    sys.puts(valid);
});

a.call('verifyKey');

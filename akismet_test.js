var akismet = require('./akismet'),
	sys = require('sys')
	;

var a = new akismet.Akismet({
   	key: 'fake',
	blog: 'http://www.example.com/'
});

sys.puts(a.verifyKey());

var akismet = require('./akismet'),
	sys = require('sys')
	;

var a = new akismet.Akismet({
   	key: 'fake',
	blog: 'http://www.example.com/'
});

a.call('verifyKey', {},
 	function(data) {
     	sys.puts(data);
	}
);

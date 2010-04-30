// TODO: These are very ad-hoc tests... maybe should make them more structured?
var akismet = require('./akismet'),
	sys = require('sys'),
    assert = require('assert'),
    client
	;

// test invalid key
client = akismet.createClient({
    key: 'fake',
    blog: 'http://www.example.com/'
});

client.addListener('response', function(valid) {
    assert.ok(!valid, 'Key should be invalid');
});
client.verifyKey();

// test valid key
client  = akismet.createClient({
    key: '1ea6b9a6af0e', // some test key I created (not actually used)
    blog: 'http://www.example.com/'
});

client.addListener('response', function(valid) {
    assert.ok(valid, 'Key should be valid');
});
client.verifyKey();

// test spam comment
client  = akismet.createClient({
    key: '1ea6b9a6af0e', // some test key I created (not actually used)
    blog: 'http://www.example.com/'
});

client.addListener('response', function(spam) {
    assert.ok(spam, 'This should be marked as spam');
});
client.commentCheck({
    'user_ip': '22.192.26.123', // Known spam IP
    'comment_type': 'comment',
    'comment_author': 'jzdgoisge',
    'comment_author_url': 'http://vjiowrtmikay.com/',
    'comment_content': 'hUYDrb kwbvfsmqumfi, [url=http://fvgxzuvgnfke.com/]fvgxzuvgnfke[/url], [link=http://yqqkrjzyyhtg.com/]yqqkrjzyyhtg[/link], http://sfnhmnbpsxbr.com/'
});

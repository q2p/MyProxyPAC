var tor9052 = 'PROXY localhost:9052';

var queued = [
	'*.onion',
	'derpibooru.org',
	'*.derpibooru.org'
];

function FindProxyForURL(url, host) {
	for(var i = queued.length-1; i != -1; i--) {
		if(shExpMatch(host, queued[i]))
			return tor9052;
	}
	
	return "DIRECT";
}

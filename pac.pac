function FindProxyForURL(url, host) {
	var queued = [
		'*.onion',
		
		'derpibooru.org',
		'*.derpibooru.org'
	];
	
	for(var i = queued.length-1; i != -1; i--) {
		if(shExpMatch(host, queued[i]))
			return 'PROXY localhost:9052';
	}
	
	return 'DIRECT';
}

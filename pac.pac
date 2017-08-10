function prefixTest(host, path) {
	return shExpMatch(host, path) || (path.startsWith('*.') && shExpMatch(host, path.substring(2, path.length)));
}

function FindProxyForURL(url, host) {
	var queued = [
		'*.onion',
		
		'*.derpibooru.org',
		'*.derpicdn.net',
		
		'*.e621.net',
		'*.rule34.xxx',
		'*.gelbooru.com',
		'*.donmai.us',
		'*.paheal.net',
		
		'*.metapix.net',
		'*.booru.org',
		
		'*.pornreactor.cc',
		'*.luscious.net',
		
		'*.nhentai.net',
		'*.hentaihere.com',
		'*.hentaicdn.com',
		'*.yuki.la'
	];
	
	for(var i = queued.length-1; i != -1; i--) {
		if(prefixTest(host, queued[i]))
			return 'SOCKS5 localhost:9052';
	}
	
	return 'DIRECT';
}

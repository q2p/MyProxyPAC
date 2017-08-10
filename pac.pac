function prefixTest(host, path) {
	return shExpMatch(host, path) || (path.startsWith('*.') && shExpMatch(host, path.substring(2, path.length)));
}

function FindProxyForURL(url, host) {
	var queued = [
		'*.onion',
		
		//'derpibooru.org',
		'*.derpibooru.org',
		
		'*.nhentai.net',
//		'*.metapix.net'
//		'*.pornreactor.cc'
//		'*.luscious.net'
//		'*.hentaihere.com'
//		'*.hentaicdn.com'
//		'*.yuki.la'
//		'*.paheal.net'
//		'*.donmai.us'
//		'*.rule34.xxx'
//		'*.e621.net'
//		'*.booru.org'
//		'*.gelbooru.com'
	];
	
	for(var i = queued.length-1; i != -1; i--) {
		if(prefixTest(host, queued[i]))
			return 'SOCKS5 localhost:9052';
		/*(function(host, path){
			if(path.startsWith('*.')) {
				return shExpMatch(host, path) || shExpMatch(host, path.substring(2, path.length));
			}
		})(host, queued[i]);*/
	}
	
	return 'DIRECT';
}

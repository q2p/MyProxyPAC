chrome.runtime.onMessage.addListener(function(message:any, sender:any, sendResponse:(value:any)=>void) {
	switch(message.a) {
		case 'setState':
			if(!chrome.extension.inIncognitoContext)
				// TODO: working = request.working;
			sendResponse({});
			break;
		case 'getState':
			// TODO: sendResponse({ working: working });
			break;
		case 'clear':
			// TODO: banHttp.length = 0;
			
			sendResponse({});
			break;
		case 'domainAction': // 0: redetect, 1: enforce, 2: ignore, 3: remove
			if(!chrome.extension.inIncognitoContext) {
				if(message.action==0) {

				}
			}
			sendResponse({});
			break;
	}
});

class TransportMessagesGenerator {
	static generateSimple(type:TransportMessageType):TransportMessageBase {
		return { type: type }
	}
}
const banHttp:string[] = [];

// TODO: http://, https://, ftp://, file://, ws://, wss://, chrome-extension://

const bannedRequests = new Set<number>();

let working = true;

chrome.storage.local.get('s', (result:any) => {
	if(chrome.runtime.lastError == undefined) {
	}
});

function isStrict(domain:string):boolean {
	return banHttp.indexOf(domain) != -1;
}
function banRequest(requestId:number):void {
	bannedRequests.add(requestId);
}
function unbanRequest(requestId:number):void {
	bannedRequests.delete(requestId);
}
function isBannedRequest(requestId:number):boolean {
	return bannedRequests.delete(requestId);
}

function generateNote(tabs:number, note:string):TransportSwitchElement { // TODO: только для теста
	return { tabs: tabs, icon: null, note: note };
}

function generateRule(tabs:number, address:string, profile:string, note:string):TransportSwitchRule { // TODO: только для теста
	return { tabs: tabs, icon: null, address: address, profile: profile, note: note };
}

chrome.webRequest.onBeforeRedirect.addListener(
	(details:any) => {
		let url = new URL(details.url);
		let newUrl = new URL(details.redirectUrl, details.url);

		if(url.hostname == newUrl.hostname && isStrict(newUrl.hostname) && newUrl.protocol == 'http:' &&
			(url.protocol == 'http:' || url.protocol == 'https:') && // Старый URL был http или https
			details.url.substr(url.protocol.length) == details.redirectUrl.substr(5) // URL ничем не отличаются, кроме пртокола
		) {
			banRequest(details.requestId);
			// TODO: выкинуть сообщение в лог о таком косяке
		}
	}, { urls: ['*://*/*'] }, ['responseHeaders']
);

chrome.webRequest.onBeforeRequest.addListener(
	(details:any) => {
		if(isBannedRequest(details.requestId))
			return { cancel: true };
		
		if(isStrict(new URL(details.url).hostname))
			return { redirectUrl: 'https' + details.url.substr(4) };
		
		return {};
	}, { urls: ['http://*/*'] }, ['blocking']
);

chrome.webRequest.onErrorOccurred.addListener(
	(details:any) => unbanRequest(details.requestId),
	{ urls: ['*://*/*'] }
);

chrome.webRequest.onCompleted.addListener(
	(details:any) => unbanRequest(details.requestId),
	{ urls: ['*://*/*'] }, []
);

chrome.runtime.onMessage.addListener(function(message:TransportMessageBase, sender:any, sendResponse:(value:any)=>void) {
	switch(message.type) {
		case TransportMessageType.PopupInit: 
			sendResponse(<TransportPopupInitAnswer> {
				chromeSyncEncryptionEnabled:  ChromeSync.encryptionEnabled.getValue(),
				chromeSyncEncryptionPassword: ChromeSync.encryptionPassword.getValue(),
				chromeSyncAutoUploadEnabled:  ChromeSync.autoUploadEnabled.getValue(),

				previousPage: PreviousPage.mainView
			});
			return;
		case TransportMessageType.StateUpdate:
			ChromeSync.encryptionPassword.update((<TransportStateUpdateMessage> message).chromeSyncEncryptionPassword);
			sendResponse({});
			return;
		case TransportMessageType.ChromeSyncEnableEncryption:
			ChromeSync.encryptionEnabled.update(true);
			sendResponse({});
			return;
		case TransportMessageType.ChromeSyncDisableEncryption:
			ChromeSync.encryptionEnabled.update(false);
			sendResponse({});
			return;
		case TransportMessageType.ChromeSyncEnableAutoUpload:
			ChromeSync.autoUploadEnabled.update(true);
			sendResponse({});
			return;
		case TransportMessageType.ChromeSyncDisableAutoUpload:
			ChromeSync.autoUploadEnabled.update(false);
			sendResponse({});
			return;
		case TransportMessageType.SwitchGetRules:
			sendResponse([
				generateNote(0, '# misc'),
				generateRule(1, 'onion', 'tor', 'TOR network'),
				generateRule(1, 'hide.me', 'main proxy', 'Proxy'),
				generateNote(0, ''),
				generateNote(0, '# booru services'),
				generateNote(0, ''),
				generateNote(0, 'derpi booru'),
				generateRule(1, 'derpibooru.org', 'main proxy', 'main gateway'),
				generateRule(1, 'derpicdn.net', 'main proxy', 'image cdn'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e6212'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
				generateNote(0, ''),
				generateNote(0, 'e621'),
				generateRule(1, 'e621.net', 'main proxy', 'main gateway'),
				generateRule(1, 'e926.net', 'main proxy', 'sfw version'),
			]);
			return;
		/*case 'setState':
			if(!chrome.extension.inIncognitoContext)
				working = request.working;
			sendResponse({});
			break;
		case 'getState':
			sendResponse({ working: working });
			break;
		case 'clear':
			banHttp.length = 0;
			
			sendResponse({});
			break;
		case 'domainAction': // 0: redetect, 1: enforce, 2: ignore, 3: remove
			if(!chrome.extension.inIncognitoContext) {
				if(request.action==0) {

				}
			}
			sendResponse({});
			break;*/
	}
});
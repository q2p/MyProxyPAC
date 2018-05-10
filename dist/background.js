class Background {
    static isStrict(domain) {
        return this.banHttp.indexOf(domain) != -1;
    }
    static banRequest(requestId) {
        this.bannedRequests.add(requestId);
    }
    static unbanRequest(requestId) {
        this.bannedRequests.delete(requestId);
    }
    static isBannedRequest(requestId) {
        return this.bannedRequests.delete(requestId);
    }
    static init() {
        chrome.webRequest.onBeforeRedirect.addListener(function (details) {
            let url = new URL(details.url);
            let newUrl = new URL(details.redirectUrl, details.url);
            if (url.hostname == newUrl.hostname && this.isStrict(newUrl.hostname) && newUrl.protocol == 'http:' &&
                (url.protocol == 'http:' || url.protocol == 'https:') &&
                details.url.substr(url.protocol.length) == details.redirectUrl.substr(5)) {
                this.banRequest(details.requestId);
            }
        }, { urls: ['*://*/*'] }, ['responseHeaders']);
        chrome.webRequest.onBeforeRequest.addListener(function (details) {
            if (this.isBannedRequest(details.requestId))
                return { cancel: true };
            if (this.isStrict(new URL(details.url).hostname))
                return { redirectUrl: 'https' + details.url.substr(4) };
            return {};
        }, { urls: ['http://*/*'] }, ['blocking']);
        chrome.webRequest.onErrorOccurred.addListener(function (details) {
            this.unbanRequest(details.requestId);
        }, { urls: ['*://*/*'] });
        chrome.webRequest.onCompleted.addListener(function (details) {
            this.unbanRequest(details.requestId);
        }, { urls: ['*://*/*'] }, []);
        chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
            switch (request.a) {
                case 'setState':
                    if (!chrome.extension.inIncognitoContext)
                        this.working = request.working;
                    sendResponse({});
                    break;
                case 'getState':
                    sendResponse({ working: this.working });
                    break;
                case 'clear':
                    this.banHttp.length = 0;
                    sendResponse({});
                    break;
                case 'domainAction':
                    if (!chrome.extension.inIncognitoContext) {
                        if (request.action == 0) {
                        }
                    }
                    sendResponse({});
                    break;
            }
        });
    }
}
Background.banHttp = ['hentaihaven.org', 'spys.one'];
Background.bannedRequests = new Set();
Background.working = true;
Background.init();

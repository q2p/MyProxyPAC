declare var pako:any;

enum WindowEnum {
	Main=0,
	Switch=1,
	Profiles=2,
	Modes=3,
	Article=4
};

class State {
	private static readonly storageStateVarName = 's';
	private static working = true;

	private static readonly fullPlnR = '0'; // uncompressed plaintext binary
	private static readonly fullEncR = '1'; // uncompressed encrypted binary
	private static readonly fullEncB = '2'; // uncompressed encrypted base64
	private static readonly compPlnR = '3'; // compressed   plaintext binary
	private static readonly compPlnB = '4'; // compressed   plaintext base64
	private static readonly compEncR = '5'; // compressed   encrypted binary
	private static readonly compEncB = '6'; // compressed   encrypted base64

	private static tryToInit(state:string):boolean {
		if(state.length < 2)
			return false;

		let parsedState:StateObject;

		switch(state[0]) {
			case this.fullPlnR:
				state = state.substr(1);
				break;
			case this.compPlnB:
				let binState = Base64.decodeToBinary(state.substr(1));
				if(binState == null)
					return false;

				let inflate = new pako.Inflate({ to: 'string' });

				inflate.push(binState, true);
				
				if(inflate.err != 0)
					return false;

				state = inflate.result;
				break;
			default:
				return false;
		}

		let locale:string;
		let lastWindow:WindowEnum;
		let windowScroll:number;
		let articleId:string;
		let switchText:string;
		let profilesText:string;
		let modesText:string;
		let modesStates:any[];
		
		try {
			// Parsing
			parsedState = JSON.parse(state);
			
			// Locale
			locale = parsedState.locale;
			if(typeof locale !== 'string' || !Locales.isValidLocale(locale))
				locale = null;
			
			// Last View
			try {
				lastWindow = parsedState.lastView.window;
				windowScroll = parsedState.lastView.scroll;
				articleId;
				switch(lastWindow) {
					case WindowEnum.Switch:
					case WindowEnum.Profiles:
					case WindowEnum.Modes:
						articleId = null;
						break;
					case WindowEnum.Article:
						articleId = parsedState.lastView.articleId;
						if(articleId === undefined || articleId === null) {
							articleId = null;
							lastWindow = WindowEnum.Main;
							windowScroll = null;
						}
						break;
					default:
						lastWindow = WindowEnum.Main;
						windowScroll = null;
						articleId = null;
				}
				if(windowScroll !== null && (windowScroll == undefined || windowScroll <= 0))
					windowScroll = null;
			} catch {
				lastWindow = WindowEnum.Main;
				windowScroll = null;
				articleId = null;
			}

			// Texts
			switchText = parsedState.switchText;
			if(typeof switchText !== 'string')
				switchText = null;
			profilesText = parsedState.profilesText;
			if(typeof profilesText !== 'string')
				profilesText = null;
			modesText = parsedState.modesText;
			if(typeof modesText !== 'string')
				modesText = null;
			
			// Modes
			let modesStates:any[] = parsedState.modesStates;
			if(modesStates === undefined || modesStates === null || !Array.isArray(modesStates))
				modesStates = [];
		} catch {
			return false;
		}

		this.stateLoaded(locale, lastWindow, windowScroll, articleId, switchText, profilesText, modesText, modesStates);
		return true;
	}

	static stateLoaded(locale:string, lastWindow:WindowEnum, windowScroll:number, articleId:string, switchText:string, profilesText:string, modesText:string, modesStates:any[]):void {
	}
}

interface StateObject {
	locale:string;
	lastView:ViewObject;
	switchText:string;
	profilesText:string;
	modesText:string;
	modesStates:ModeStateObject[];
}

interface ViewObject {
	window:number;
	scroll:number;
	articleId:string;
}

interface ModeStateObject {
	id:string;
	stateId:string;
}
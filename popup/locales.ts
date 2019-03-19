class Locales {
	private static readonly languaguesPromptViewDiv = document.getElementById('languagues_prompt_view');
	private static readonly languaguesPromptDiv = document.getElementById('languagues_prompt');
	private static readonly languaguesTitleDiv = document.getElementById('languagues_title');
	private static readonly languaguesReturnBtn = document.getElementById('languagues_return_btn');

	private static locales:LanguagueItem[] = [];

	private static currentLang:string = null;

	private static localeDictionary:LanguagueValues;
	static getLocaleDictionary():LanguagueValues {
		return Locales.localeDictionary;
	}

	static isValidLocale(name:string):boolean {
		for(let locale of Locales.locales)
			if(locale.id === name)
				return true;
				
		return false;
	}

	static hasLanguague():boolean {
		return Locales.currentLang == null;
	}

	static pushLanguague(name:string):void {
		Locales.currentLang = name;

		fetch('lang/'+name+'.json').then((value:Response):Promise<LanguagueValues> => {
			return value.json();
		}).then((languagueValues:LanguagueValues) => {
			Locales.localeDictionary = languagueValues;

			Locales.languaguesTitleDiv.innerText = languagueValues.mainBtnChangeLanguagueNative === '' ? 'Change languague' : languagueValues.mainBtnChangeLanguagueNative + ' (Change languague)';

			MainView.rename(languagueValues);

			ChromeSyncView.rename(
				languagueValues.chromeSyncTitle,
				languagueValues.chromeSyncEnableEncryption,
				languagueValues.chromeSyncEncryptionKeyPlaceholder,
				languagueValues.chromeSyncEnableAutoUpload,

				languagueValues.chromeSyncPullChanges,
				languagueValues.chromeSyncPushChanges,
				languagueValues.chromeSyncWipeCloud
			);

			MainView.show(); // TODO: ожидать полной инициализации
		});
	}

	static promptLanguague():void {
		if(Locales.hasLanguague()) {
			// TODO: надо проматывать до выбранного языка
			
		}

		for(let locale of Locales.locales) {
			let languagueContainer = document.createElement('div');
			let languagueFlag = document.createElement('img');
			let languagueNames = document.createElement('div');

			languagueContainer.classList.add('languague_container', 'line_hover_glow');
			languagueFlag.classList.add('languague_flag');
			languagueNames.classList.add('languague_names');

			let languagueNativeName = document.createElement('div');
			languagueNativeName.classList.add('languague_name');
			languagueNativeName.innerText = locale.nativeName;
			languagueNames.appendChild(languagueNativeName);

			if(locale.nativeName !== locale.englishName) {
				let languagueEnglishName = document.createElement('div');
				languagueEnglishName.classList.add('languague_name');
				languagueEnglishName.innerText = locale.englishName;
				languagueNames.appendChild(languagueEnglishName);
			}

			languagueFlag.src = 'lang/'+locale.id+'.svg';
			languagueContainer.addEventListener('click', () => {
				Locales.closeView();
				Locales.languaguesPromptViewDiv.classList.remove('tidy');

				chrome.storage.local.set({l: locale.id}, () => {
					if(chrome.runtime.lastError != undefined)
						chrome.runtime.reload();

					Locales.pushLanguague(locale.id);
				});
			}, false);

			languagueContainer.appendChild(languagueFlag);
			languagueContainer.appendChild(languagueNames);
			Locales.languaguesPromptDiv.appendChild(languagueContainer);
		}

		Locales.languaguesPromptViewDiv.style.display = 'block';
	}

	static init():void {
		Locales.languaguesReturnBtn.addEventListener('click', () => {
			Locales.closeView();
			MainView.show();
		}, false);

		fetch('lang/langList.json').then((value:Response):Promise<LanguagueItem[]> => {
			return value.json();
		}).then((languaguesList:LanguagueItem[]) => {
			Locales.locales = languaguesList;

			chrome.storage.local.get('l', (container:any) => {
				if(chrome.runtime.lastError != undefined || typeof container !== 'object' || typeof container.l !== 'string' || !Locales.isValidLocale(container.l)) {
					Locales.languaguesPromptViewDiv.classList.add('tidy');
					Locales.promptLanguague();
				} else {
					Locales.pushLanguague(container.l);
				}
			});
		});
	}

	private static closeView():void {
		while(Locales.languaguesPromptDiv.childElementCount != 0)
			Locales.languaguesPromptDiv.removeChild(Locales.languaguesPromptDiv.firstChild);

		Locales.languaguesPromptViewDiv.style.display = 'none';
	}
}

Locales.init();

interface LanguagueValues {
	readonly title:string;
	
	readonly mainBtnModes:string;
	readonly mainBtnProfiles:string;
	readonly mainBtnSwitch:string;
	readonly mainBtnImport:string;
	readonly mainBtnExport:string;
	readonly mainBtnExportPlaintext:string;
	readonly mainBtnChromeSync:string;
	readonly mainBtnChangeLanguagueNative:string;
	readonly mainBtnGuide:string;
	readonly mainBtnFeedback:string;

	readonly switchTitle:string;
	
	readonly chromeSyncTitle:string;
	readonly chromeSyncEnableEncryption:string;
	readonly chromeSyncEncryptionKeyPlaceholder:string;
	readonly chromeSyncEnableAutoUpload:string;

	readonly chromeSyncPullChanges:string;
	readonly chromeSyncPushChanges:string;
	readonly chromeSyncWipeCloud:string;
}

interface LanguagueItem {
	readonly id:string;
	readonly nativeName:string;
	readonly englishName:string;
}
abstract class MainButton {
	private readonly hintIcon:string;
	private readonly onClick:()=>void;

	constructor(hintIcon:string, onClick:()=>void) {
		this.hintIcon = hintIcon;
		this.onClick = onClick;
	}

	public generate(container:HTMLElement):void {
		let btn = document.createElement('div');
		btn.classList.add('line_container', 'line_hover_glow');
		let hintIcon = document.createElement('div');
		hintIcon.className = 'hint_icon';
		hintIcon.innerText = this.hintIcon;
		let postHint = document.createElement('div');
		postHint.classList.add('next_to_left', 'padded_top_line_button', 'padded_left_line_button');
		btn.appendChild(hintIcon);
		btn.appendChild(postHint);

		this.decorate(postHint);
		
		container.appendChild(btn);
		btn.addEventListener('click', this.onClick, false);
	}

	protected abstract decorate(button:HTMLElement):void;
	
	abstract rename(buttonNames:LanguagueValues):void;
}

class MainButtonRegular extends MainButton {
	protected readonly titleId:string;
	private titleDiv:HTMLSpanElement;

	constructor(titleId:string, hintIcon:string, onClick:()=>void) {
		super(hintIcon, onClick);
		this.titleId = titleId;
	}

	decorate(button:HTMLElement):void {
		this.titleDiv = button;
	}

	rename(languagueValues:any):void {
		this.titleDiv.innerText = languagueValues[this.titleId];
	}
}

class MainButtonLanguague extends MainButton {
	nativeTitleDiv:HTMLSpanElement;
	englishTitleDiv:HTMLSpanElement;

	constructor(onClick:()=>void) {
		super('F', onClick);
	}

	public decorate(button:HTMLElement):void {
		this.nativeTitleDiv = document.createElement('span');
		this.englishTitleDiv = document.createElement('span');
		this.englishTitleDiv.classList.add('hint_color');
		this.englishTitleDiv.innerText = ' (Change languague)';
		button.appendChild(this.nativeTitleDiv);
		button.appendChild(this.englishTitleDiv);
	}

	public rename(languagueValues:LanguagueValues) {
		if(languagueValues.mainBtnChangeLanguagueNative === '') {
			this.nativeTitleDiv.innerText = 'Change languague';
			this.englishTitleDiv.style.display = 'none';
		} else {
			this.nativeTitleDiv.innerText = languagueValues.mainBtnChangeLanguagueNative;
			this.englishTitleDiv.style.display = 'inline';
		}
	}
}

class MainView {
	private static readonly mainViewDiv = document.getElementById('main_window');
	
	private static readonly titleDiv = document.getElementById('main_title');

	private static readonly changeLanguagueButton:MainButtonLanguague = new MainButtonLanguague(()=>{
		MainView.hide();
		Locales.promptLanguague();
	});

	private static readonly buttons:MainButton[] = [
		new MainButtonRegular('mainBtnModes', 'M', ()=>{

		}),
		new MainButtonRegular('mainBtnSwitch', 'S', ()=>{

		}),
		new MainButtonRegular('mainBtnProfiles', 'P', ()=>{

		}),
		new MainButtonRegular('mainBtnImport', 'I', ()=>{

		}),
		new MainButtonRegular('mainBtnExport', 'E', ()=>{

		}),
		new MainButtonRegular('mainBtnExportPlaintext', 'X', ()=>{

		}),
		new MainButtonRegular('mainBtnChromeSync', 'C', ()=>{
			MainView.hide();
			ChromeSyncView.show();
		}),
		MainView.changeLanguagueButton,
		new MainButtonRegular('mainBtnGuide', 'G', ()=>{

		}),
		new MainButtonRegular('mainBtnFeedback', 'F', ()=>{

		}),
	];

	static readonly buttonTitleEntries:Map<string, HTMLSpanElement> = new Map<string, HTMLSpanElement>();

	static show():void {
		MainView.mainViewDiv.style.display = 'block';
	}

	private static hide():void {
		MainView.mainViewDiv.style.display = 'none';
	}

	static init() {
		for(let button of MainView.buttons)
			button.generate(MainView.mainViewDiv);
	}

	static rename(languagueValues:LanguagueValues):void {
		this.titleDiv.innerText = languagueValues.title;

		for(let button of MainView.buttons)
			button.rename(languagueValues);
	}
}
MainView.init();
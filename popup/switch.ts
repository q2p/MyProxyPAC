abstract class SwitchElement {
	tabs:number;
	icon:string;
	note:string;
	readonly element:HTMLElement = document.createElement('div');

	constructor(tabs:number, icon:string, note:string) {
		this.tabs = tabs;
		this.icon = icon;
		this.note = note;
	}
}

class SwitchNote extends SwitchElement {
	constructor(tabs:number, icon:string, note:string) {
		super(tabs, icon, note);

		this.element.classList.add('line_container', 'hover_glow', 'show_on_hover_hint_container');
		
		let dragButton = document.createElement('div');
		dragButton.classList.add('stick_to_left');

		let dragButtonDot = document.createElement('div');
		dragButtonDot.classList.add('drag_button_dot', 'show_on_hover_element');
		
		dragButton.appendChild(dragButtonDot);

		let noteElement = document.createElement('div');
		noteElement.classList.add('next_to_left', 'editable_note_container', 'padded_top_line_button', 'hint_color');

		noteElement.innerText = note;

		this.element.appendChild(dragButton);
		this.element.appendChild(noteElement);
	}
}

class SwitchRule extends SwitchElement {
	address:string;
	profile:string;
	
	constructor(tabs:number, icon:string, address:string, note:string, profile:string) {
		super(tabs, icon, note);
		this.address = address;
		
		this.element.classList.add('line_container', 'hover_glow', 'show_on_hover_hint_container');
		
		let dragButton = document.createElement('div');
		dragButton.classList.add('stick_to_left');

		let dragButtonDot = document.createElement('div');
		dragButtonDot.classList.add('drag_button_dot', 'show_on_hover_element');

		dragButton.appendChild(dragButtonDot);
		this.element.appendChild(dragButton);

		let fieldsContainer = document.createElement('div');
		fieldsContainer.classList.add('next_to_left', 'editable_note_container', 'padded_top_line_button');

		let webAddressView = document.createElement('span');
		webAddressView.classList.add('font_mono');
		webAddressView.innerText = address;
		fieldsContainer.appendChild(webAddressView);

		let redirectSymbol = document.createElement('span');
		redirectSymbol.classList.add('font_mono', 'hint_color');
		redirectSymbol.innerText = ' > ';
		fieldsContainer.appendChild(redirectSymbol);

		let profileView = document.createElement('span');
		profileView.classList.add('font_mono');
		profileView.innerText = profile;
		fieldsContainer.appendChild(profileView);

		let noteView = document.createElement('span');
		noteView.classList.add('hint_color');
		noteView.innerText = ' # ' + note;
		fieldsContainer.appendChild(noteView);

		this.element.appendChild(fieldsContainer);
	}
}

class Switch {
	private static readonly switchWindow = document.getElementById('switch_window');
	private static rulesContainer:HTMLElement = null;

	private static readonly switchRules:SwitchElement[] = [
	];

	private static readonly draggingSpace = 96;
	private static readonly minScrollSpeedPerSecond = 32;
	private static readonly maxScrollSpeedPerSecond = 1024;
	private static readonly minLogScrollSpeedPerSecond = Math.log(Switch.minScrollSpeedPerSecond);
	private static readonly maxLogScrollSpeedPerSecond = Math.log(Switch.maxScrollSpeedPerSecond);
	private static readonly scale = (Switch.maxLogScrollSpeedPerSecond - Switch.minLogScrollSpeedPerSecond) / Switch.draggingSpace;
	private static preCalculatedScrollSpeed = 0;
	private static rulesViewportCursorY:number = null;
	
	private static rulesViewportScrollBuildUp = 0;
	private static lastTimestamp:number = null;

	static generateTopBar(topBar:HTMLElement):void {
		let topBarReturn = document.createElement('img');
		let topBarTitle = document.createElement('div');
		topBar.classList.add('reg_title');
		topBarReturn.classList.add('title_square', 'icon_btn', 'stick_to_left');
		topBarReturn.src = 'return.svg';
		topBarReturn.addEventListener('click', () => {
			Switch.hide();
			MainView.show();
		}, false);
		topBarTitle.innerText = Locales.getLocaleDictionary().switchTitle;
		topBar.appendChild(topBarReturn)
		topBar.appendChild(topBarTitle);
	}

	static show():void {
		let topBar = document.createElement('div');
		Switch.generateTopBar(topBar);
		Switch.switchWindow.appendChild(topBar);

		Switch.rulesContainer = document.createElement('div');
		Switch.rulesContainer.classList.add('scrollable_container');
		Switch.switchWindow.appendChild(Switch.rulesContainer);

		Switch.switchWindow.style.display = 'block';

		//Switch.rulesContainer.addEventListener('mousemove', Switch.mouseMoveHandler, false);
		//Switch.rulesContainer.addEventListener('mouseenter', Switch.mouseMoveHandler, false);
		Switch.rulesContainer.addEventListener('mouseleave', Switch.mouseLeaveHandler, false);

		chrome.runtime.sendMessage({ type: TransportMessageType.SwitchGetRules }, Switch.receivedRules);

		/*
			<textarea id="editable_content" spellcheck="false" autocomplete="off" placeholder=""></textarea>
			<div class="button"> Accept№№№ </div>
			<div class="button"> Cancel№№№ </div> alexozerov72@mail.ru


			
		if(Switch.rulesViewportCursorY !== null) {
			requestAnimationFrame(Switch.onNextFrame);
			let delta = timestamp - Switch.lastTimestamp; // get the delta time since last frame
			Switch.lastTimestamp = timestamp;
			document.body.innerText = '' + delta;

		}
		*/
	}

	static onNextFrame(timestamp:number):void {
		if(Switch.rulesViewportCursorY !== null) { // TODO: rvcy не нужна как глобальная переменная
			requestAnimationFrame(Switch.onNextFrame);

			let delta = Math.max(0.0001, (timestamp - Switch.lastTimestamp) / 1000);
			Switch.lastTimestamp = timestamp;

			Switch.rulesViewportScrollBuildUp += delta * Switch.preCalculatedScrollSpeed;
			let dec = 0;
			if(Switch.rulesViewportScrollBuildUp < 1) {
				dec = Math.ceil(Switch.rulesViewportScrollBuildUp);
			} else if(Switch.rulesViewportScrollBuildUp > 1) {
				dec = Math.floor(Switch.rulesViewportScrollBuildUp);
			}
			Switch.rulesViewportScrollBuildUp -= dec;
			Switch.rulesContainer.scrollTop += dec;
		}
	}

	static mouseMoveHandler(event:MouseEvent):void {
		Switch.rulesViewportCursorY = event.clientY - Switch.rulesContainer.getBoundingClientRect().top;
		
		let dirTop = Switch.draggingSpace - Switch.rulesViewportCursorY;
		let dirBottom = Switch.rulesViewportCursorY - (Switch.rulesContainer.getBoundingClientRect().height - Switch.draggingSpace) + 1;

		if(dirTop > 0) {
			Switch.preCalculatedScrollSpeed = -Math.exp(Switch.minLogScrollSpeedPerSecond + dirTop * Switch.scale);
			if(Switch.lastTimestamp === null) {
				Switch.lastTimestamp = Date.now();
				requestAnimationFrame(Switch.onNextFrame);
			}
		} else if(dirBottom > 0) {
			Switch.preCalculatedScrollSpeed = Math.exp(Switch.minLogScrollSpeedPerSecond + dirBottom * Switch.scale);
			if(Switch.lastTimestamp === null) {
				Switch.lastTimestamp = Date.now();
				requestAnimationFrame(Switch.onNextFrame);
			}
		} else {
			Switch.rulesViewportCursorY = null;
			Switch.lastTimestamp = null;
		}
	}

	static mouseLeaveHandler(event:MouseEvent):void {
		Switch.rulesViewportCursorY = null;
		Switch.lastTimestamp = null;
	}

	static receivedRules(rules:TransportSwitchRule[]):void {
		for(let rule of rules) {
			let item;
			if(rule.address === undefined) // Note
				item = new SwitchNote(rule.tabs, rule.icon, rule.note);
			else // Rule
				item = new SwitchRule(rule.tabs, rule.icon, rule.address, rule.note, rule.profile);

			Switch.switchRules.push(item);

			Switch.rulesContainer.appendChild(item.element);
		}
	}

	static hide():void {
		Switch.switchWindow.style.display = 'none';
		while(Switch.switchWindow.hasChildNodes())
			Switch.switchWindow.removeChild(Switch.switchWindow.lastChild);

		Switch.rulesContainer = null;
	}
}
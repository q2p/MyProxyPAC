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

		this.element.classList.add('line_container');
		
		let dragButton = document.createElement('div');
		dragButton.classList.add('stick_to_left');

		let dragButtonDot = document.createElement('div');
		dragButtonDot.classList.add('drag_button_dot');
		
		dragButton.appendChild(dragButtonDot);

		let noteElement = document.createElement('div');
		noteElement.classList.add('next_to_left', 'editable_note_container', 'padded_top_line_button');

		noteElement.innerText = note;

		this.element.appendChild(dragButton);
		this.element.appendChild(noteElement);
	}
}

class SwitchRule extends SwitchElement {
	address:string;
	
	constructor(tabs:number, icon:string, address:string, note:string) {
		super(tabs, icon, note);
		this.address = address;
		
		this.element.classList.add('line_container');
		
		let dragButton = document.createElement('div');
		dragButton.classList.add('stick_to_left');

		let dragButtonDot = document.createElement('div');
		dragButtonDot.classList.add('drag_button_dot');

		dragButton.appendChild(dragButtonDot);

		let noteElement = document.createElement('div');
		noteElement.classList.add('next_to_left', 'editable_note_container', 'padded_top_line_button');

		noteElement.innerText = address+' // '+note;

		this.element.appendChild(dragButton);
		this.element.appendChild(noteElement);
	}
}

class Switch {
	private static readonly switchWindow = document.getElementById('switch_window');
	private static rulesContainer:HTMLElement = null;

	private static readonly switchRules:SwitchElement[] = [
	];

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

		chrome.runtime.sendMessage({ type: TransportMessageType.SwitchGetRules }, Switch.receivedRules);

	}

	static receivedRules(rules:TransportSwitchRule[]) {
		for(let rule of rules) {
			let item;
			if(rule.address === undefined) // Note
				item = new SwitchNote(rule.tabs, rule.icon, rule.note);
			else // Rule
				item = new SwitchRule(rule.tabs, rule.icon, rule.address, rule.note);

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
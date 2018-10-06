class ChromeSyncView {
	private static readonly chromeSyncViewDiv = document.getElementById('chrome_sync_window');
	
	private static readonly titleDiv = document.getElementById('chrome_sync_title');
	private static readonly returnButton = document.getElementById('chrome_sync_return_btn');

	private static readonly btnEnableEncryption = document.getElementById('chrome_sync_encrypt_checkbox_wrapper');
	private static readonly labelEnableEncryption = document.getElementById('chrome_sync_encrypt_label');
	private static readonly checkBoxEnableEncryption = document.getElementById('chrome_sync_enable_encryption_checkbox');
	private static readonly inputEncryptionPassword:HTMLInputElement = <HTMLInputElement>document.getElementById('chrome_sync_encryption_password');

	private static encryptionEnabled:boolean;

	private static encryptionPassword:UpdatableValue<string> = new UpdatableValue();
	static pullEncryptionPasswordChanges():string {
		return ChromeSyncView.encryptionPassword.pullChanges();
	}

	private static readonly btnAutoUpload = document.getElementById('chrome_sync_auto_upload_checkbox_wrapper');
	private static readonly labelAutoUpload = document.getElementById('chrome_sync_auto_upload_label');
	private static readonly checkBoxAutoUpload = document.getElementById('chrome_sync_auto_upload_checkbox');

	private static autoUploadEnabled:boolean;

	private static readonly btnPush = document.getElementById('chrome_sync_push_btn');
	private static readonly btnPull = document.getElementById('chrome_sync_pull_btn');
	private static readonly btnWipe = document.getElementById('chrome_sync_wipe_btn');

	static show():void {
		ChromeSyncView.chromeSyncViewDiv.style.display = 'block';
	}

	private static hide():void {
		ChromeSyncView.chromeSyncViewDiv.style.display = 'none';
		PeriodicStateSaver.saveState();
	}

	static updateEncryptionEnabledCheckbox():void {
		if(ChromeSyncView.encryptionEnabled) {
			ChromeSyncView.checkBoxEnableEncryption.classList.add('checkbox_enabled');
			ChromeSyncView.inputEncryptionPassword.disabled = false;
			ChromeSyncView.inputEncryptionPassword.readOnly = false;
		} else {
			ChromeSyncView.checkBoxEnableEncryption.classList.remove('checkbox_enabled');
			ChromeSyncView.inputEncryptionPassword.disabled = true;
			ChromeSyncView.inputEncryptionPassword.readOnly = true;
		}
	}

	static updateAutoUploadCheckbox():void {
		if(ChromeSyncView.autoUploadEnabled)
			ChromeSyncView.checkBoxAutoUpload.classList.add('checkbox_enabled');
		else
			ChromeSyncView.checkBoxAutoUpload.classList.remove('checkbox_enabled');
	}

	static initState(encryptionEnabled:boolean, encryptionPassword:string, autoUploadEnabled:boolean):void {
		ChromeSyncView.encryptionPassword.init(encryptionPassword);
		ChromeSyncView.inputEncryptionPassword.value = encryptionPassword;

		ChromeSyncView.encryptionEnabled = encryptionEnabled;
		ChromeSyncView.updateEncryptionEnabledCheckbox();
		
		ChromeSyncView.autoUploadEnabled = autoUploadEnabled;
		ChromeSyncView.updateAutoUploadCheckbox();
	}

	static init():void {
		ChromeSyncView.returnButton.addEventListener('click', () => {
			ChromeSyncView.hide();
			MainView.show();
		}, false);

		ChromeSyncView.btnEnableEncryption.addEventListener('click', ChromeSyncView.flipEncryptionState, false);

		ChromeSyncView.btnAutoUpload.addEventListener('click', ChromeSyncView.flipAutoUploadState, false);

		ChromeSyncView.inputEncryptionPassword.addEventListener('keydown',  ChromeSyncView.passwordChanged, false);
		ChromeSyncView.inputEncryptionPassword.addEventListener('keyup',    ChromeSyncView.passwordChanged, false);
		ChromeSyncView.inputEncryptionPassword.addEventListener('keypress', ChromeSyncView.passwordChanged, false);
		ChromeSyncView.inputEncryptionPassword.addEventListener('input',    ChromeSyncView.passwordChanged, false);
		ChromeSyncView.inputEncryptionPassword.addEventListener('change',   ChromeSyncView.passwordChanged, false);
	}

	static passwordChanged():void {
		ChromeSyncView.encryptionPassword.value = ChromeSyncView.inputEncryptionPassword.value;
		chrome.runtime.sendMessage(<TransportStateUpdateMessage> { type: TransportMessageType.StateUpdate, chromeSyncEncryptionPassword: ChromeSyncView.encryptionPassword.value },)
	}

	static flipEncryptionState():void {
		ChromeSyncView.encryptionEnabled = !ChromeSyncView.encryptionEnabled;
		ChromeSyncView.updateEncryptionEnabledCheckbox();
		chrome.runtime.sendMessage({
			type: ChromeSyncView.encryptionEnabled ? TransportMessageType.ChromeSyncEnableEncryption : TransportMessageType.ChromeSyncDisableEncryption
		});
	}

	static flipAutoUploadState():void {
		ChromeSyncView.autoUploadEnabled = !ChromeSyncView.autoUploadEnabled;
		ChromeSyncView.updateAutoUploadCheckbox();
		chrome.runtime.sendMessage({
			type: ChromeSyncView.autoUploadEnabled ? TransportMessageType.ChromeSyncEnableAutoUpload : TransportMessageType.ChromeSyncDisableAutoUpload
		});
	}

	static rename(
		titleText:string,
		enableEncrptionText:string,
		encryptionPasswordPlaceholderText:string,
		autoUploadChangesText:string,

		pullChangesFromCloudText:string,
		pushChangesToCloudText:string,
		wipeCloudStorageText:string,
	):void {
		ChromeSyncView.titleDiv.innerText = titleText;
		ChromeSyncView.labelEnableEncryption.innerText = enableEncrptionText;
		ChromeSyncView.inputEncryptionPassword.placeholder = encryptionPasswordPlaceholderText;
		ChromeSyncView.labelAutoUpload.innerText = autoUploadChangesText;

		ChromeSyncView.btnPull.innerText = pullChangesFromCloudText;
		ChromeSyncView.btnPush.innerText = pushChangesToCloudText;
		ChromeSyncView.btnWipe.innerText = wipeCloudStorageText;
	}
}
ChromeSyncView.init();
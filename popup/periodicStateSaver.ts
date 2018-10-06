class PeriodicStateSaver {
	static start() {
		window.addEventListener('beforeunload', PeriodicStateSaver.saveState);
		setInterval(PeriodicStateSaver.saveState, 2000);
	}

	static saveState():void {
		let message:TransportStateUpdateMessage = {
			type: TransportMessageType.StateUpdate,

			chromeSyncEncryptionPassword: ChromeSyncView.pullEncryptionPasswordChanges(),
		};

		if(
			message.chromeSyncEncryptionPassword !== undefined
		) {
			chrome.runtime.sendMessage(message);
		}
	}
}
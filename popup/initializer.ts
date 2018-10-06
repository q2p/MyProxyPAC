chrome.runtime.sendMessage({ type: TransportMessageType.PopupInit }, (response:TransportPopupInitAnswer) => {
	ChromeSyncView.initState(
		response.chromeSyncEncryptionEnabled,
		response.chromeSyncEncryptionPassword,
		response.chromeSyncAutoUploadEnabled
	);
	PeriodicStateSaver.start();
});
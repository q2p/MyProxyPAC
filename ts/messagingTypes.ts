enum TransportMessageType {
	ChromeSyncEnableEncryption = 0,
	ChromeSyncDisableEncryption = 1,
	ChromeSyncEnableAutoUpload = 2,
	ChromeSyncDisableAutoUpload = 3,
	PopupInit = 4,
	StateUpdate = 5,
};

enum PreviousPage {
	mainView = 0,
	languagueSelection = 1,
	chromeSyncView = 2
}

interface TransportMessageBase {
	readonly type:TransportMessageType;
}

interface TransportPopupInitAnswer {
	chromeSyncEncryptionEnabled:boolean;
	chromeSyncEncryptionPassword:string;
	chromeSyncAutoUploadEnabled:boolean;
	previousPage:PreviousPage;
}

interface TransportStateUpdateMessage extends TransportMessageBase {
	readonly type:TransportMessageType.StateUpdate;

	chromeSyncEncryptionPassword:string;
}
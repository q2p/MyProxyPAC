declare var chrome: {
	readonly runtime: {
		readonly lastError:any;
		readonly reload:()=>void;
		readonly onMessage: {
			readonly addListener:( callback:(...args: any[])=>any )=>void;
		}
		readonly sendMessage:(message:TransportMessageBase, responseCallback?:(response:any)=>any)=>void
	}
	readonly extension: {
		readonly inIncognitoContext:boolean;
	}
	readonly storage: {
		readonly local: {
			readonly get:(key:string, callback:(result:any)=>void)=>void;
			readonly set:(items:object, callback:()=>void)=>void;
		}
	}
	readonly webRequest: {
		readonly onBeforeRedirect: {
			readonly addListener:( callback:(...args: any[])=>any, filter:{ urls:string[] }, opt_extraInfoSpec:Array<'blocking' | 'asyncBlocking' | 'responseHeaders'> )=>void;
		}
		readonly onBeforeRequest: {
			readonly addListener:( callback:(...args: any[])=>any, filter:{ urls:string[] }, opt_extraInfoSpec:Array<'blocking' | 'asyncBlocking' | 'responseHeaders'> )=>void;
		}
		readonly onErrorOccurred: {
			readonly addListener:( callback:(...args: any[])=>any, filter:{ urls:string[] } )=>void;
		}
		readonly onCompleted: {
			readonly addListener:( callback:(...args: any[])=>any, filter:{ urls:string[] }, opt_extraInfoSpec:Array<'blocking' | 'asyncBlocking' | 'responseHeaders'> )=>void;
		}
	}
};
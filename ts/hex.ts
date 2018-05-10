class HEX {
	private static readonly hexLowCase:string = '0123456789abcdef';

	// TODO: провести тесты
	static encode(plainText:Uint8Array):string {
		let b:number;

		let out:string = '';
		
		for(let i = 0; i !== plainText.length; i++) {
			b = plainText[i];

			out += HEX.hexLowCase[(0xFF & b) >>> 4];
			out += HEX.hexLowCase[b & 0xF];
		}

		return out;
	}
}
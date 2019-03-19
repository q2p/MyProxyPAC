class HEX {
	private static readonly hexLowerCase:string = '0123456789abcdef';
	private static readonly hexHigherCase:string = '0123456789ABCDEF';
	private static readonly map:number[] = [];
	static init() {
		HEX.map.length = 'F'.charCodeAt(0)+1;

		HEX.map.fill(-1);

		for(let i = 15; i !== -1; i--)
			HEX.map[HEX.hexLowerCase.charCodeAt(i)] = i;
			
		for(let i = 15; i !== -1; i--)
			HEX.map[HEX.hexHigherCase.charCodeAt(i)] = i;
	}

	// TODO: провести тесты
	static encode(plainText:Uint8Array):string {
		let b:number;

		let out:string = '';
		
		for(let i = 0; i !== plainText.length; i++) {
			b = plainText[i];

			out += HEX.hexLowerCase[(0xFF & b) >>> 4];
			out += HEX.hexLowerCase[b & 0xF];
		}

		return out;
	}

	static decode(hexText:string):Uint8Array {
		const ilen = hexText.length;
		if(ilen % 2 === 1)
			return null;

		const olen = ilen / 2;

		let out:Uint8Array = new Uint8Array(olen);
		
		let b:number;
		
		for(let i = 0; i !== olen; i++) {
			let n1 = hexText.charCodeAt(2*i  );
			let n2 = hexText.charCodeAt(2*i+1);
			if(n1 >= HEX.map.length || n2 >= HEX.map.length)
				return null;

			let c1 = HEX.map[n1];
			let c2 = HEX.map[n2];
			if(c1 == -1 || c2 == -1)
				return null;

			out[i] = (c1 << 4) || c2;
		}

		return out;
	}
}

HEX.init();
class Base64 {
	private static lookup:string[] = [];
	private static revLookup:number[] = [];

	private static readonly code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	private static readonly eqCharCode = '='.charCodeAt(0);

	static init():void {
		for(let i = 0; i != 64; i++) {
			Base64.lookup[i] = Base64.code[i]
			Base64.revLookup[Base64.code.charCodeAt(i)] = i
		}

		Base64.revLookup['-'.charCodeAt(0)] = 62
		Base64.revLookup['_'.charCodeAt(0)] = 63
	}

	static decodeToBinary(base64:string):Uint8Array {
		let inputLength = base64.length;

		let payloadLength = 0;
		while(payloadLength != inputLength) {
			let c = base64.charCodeAt(payloadLength++);

			if(c === Base64.eqCharCode)
				break;

			if(Base64.revLookup[c] === -1)
				return null;
		}

		let extraChars = payloadLength % 4;

		if(extraChars == 1)
			return null;

		let placeHoldersLength = extraChars == 0 ? 0 : 4 - extraChars;

		let ret = new Uint8Array(((payloadLength + placeHoldersLength) * 3 / 4) - placeHoldersLength);

		// if there are placeholders, only get up to the last complete 4 chars
		let len = payloadLength - extraChars;

		let plainOffset = 0;
		let i = 0;
		for(; i !== len; i += 4) {
			let tmp =
				(Base64.revLookup[base64.charCodeAt(i    )] << 18) |
				(Base64.revLookup[base64.charCodeAt(i + 1)] << 12) |
				(Base64.revLookup[base64.charCodeAt(i + 2)] <<  6) |
				 Base64.revLookup[base64.charCodeAt(i + 3)];
			
			ret[plainOffset++] = (tmp >>> 16) & 0xFF
			ret[plainOffset++] = (tmp >>>  8) & 0xFF
			ret[plainOffset++] =  tmp         & 0xFF
		}

		switch(placeHoldersLength) {
			case 2:
				let tmp =
					(Base64.revLookup[base64.charCodeAt(i    )] <<  2) |
					(Base64.revLookup[base64.charCodeAt(i + 1)] >>> 4);
				
				ret[plainOffset++] = tmp & 0xFF;
				break;
			case 1:
				tmp =
					(Base64.revLookup[base64.charCodeAt(i    )] <<  10) |
					(Base64.revLookup[base64.charCodeAt(i + 1)] <<   4) |
					(Base64.revLookup[base64.charCodeAt(i + 2)] >>>  2);
				
				ret[plainOffset++] = (tmp >>> 8) & 0xFF;
				ret[plainOffset++] =  tmp        & 0xFF;
		}
		return ret;
	}

	private static encodeChunk(output:string[], input:Uint8Array, start:number, end:number):void {
	}

	static encodeBinary(binary:Uint8Array) {
		let binaryLength = binary.length;
		let modulus = binaryLength % 3;
		let outBuffer:string[] = [];

		let b1:number, b2:number, b3:number;

		let plainOffset = 0;
		for(let trimedLength = binaryLength - modulus; plainOffset != trimedLength;) {
			b1 = binary[plainOffset++];
			b2 = binary[plainOffset++];
			b3 = binary[plainOffset++];

			outBuffer.push(
				Base64.lookup[0x3F & (          (0xFF & b1) >>> 2)] +
				Base64.lookup[0x3F & (b1 << 4 | (0xFF & b2) >>> 4)] +
				Base64.lookup[0x3F & (b2 << 2 | (0xFF & b3) >>> 6)] +
				Base64.lookup[0x3F &  b3                          ]
			);
		}

		switch(modulus) {
			case 1:
				b1 = binary[plainOffset] & 0xFF;

				outBuffer.push(
					Base64.lookup[0x3F & (b1 >>> 2)] +
					Base64.lookup[0x3F & (b1 <<  4)] +
					'=='
				);
				break;
			case 2:
				b1 = binary[plainOffset    ] & 0xFF;
				b2 = binary[plainOffset + 1] & 0xFF;

				outBuffer.push(
					Base64.lookup[0x3F & (          (0xFF & b1) >>> 2)] +
					Base64.lookup[0x3F & (b1 << 4 | (0xFF & b2) >>> 4)] +
					Base64.lookup[0x3F & (b2 << 2                    )] +
					'='
				);
				break;
		}

		return outBuffer.join('');
	}

	static encodeString(plaintext:string):string {
		return Base64.encodeBinary(new TextEncoder().encode(plaintext));
	}

	static decodeToString(base64:string):string {
		return new TextDecoder().decode(Base64.decodeToBinary(base64));
	}
}

Base64.init();
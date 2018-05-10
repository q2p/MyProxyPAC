class JSChaCha20 {
	private static readonly rounds = 20;
	private static readonly sigma = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
	private param:number[];
	private keyStream = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	];
	private byteCounter = 0;

	constructor(key:Uint8Array, nonce:Uint8Array, counter:number) {
		if(key.length !== 32)
			throw new Error('Key should be 32 byte array!');

		if(nonce.length !== 12)
			throw new Error('Nonce should be 12 byte array!');

		// param construction
		this.param = [
			JSChaCha20.sigma[0],
			JSChaCha20.sigma[1],
			JSChaCha20.sigma[2],
			JSChaCha20.sigma[3],
			// key
			this.getInt32(key, 0),
			this.getInt32(key, 4),
			this.getInt32(key, 8),
			this.getInt32(key, 12),
			this.getInt32(key, 16),
			this.getInt32(key, 20),
			this.getInt32(key, 24),
			this.getInt32(key, 28),
			// counter
			counter,
			// nonce
			this.getInt32(nonce, 0),
			this.getInt32(nonce, 4),
			this.getInt32(nonce, 8)
		]
	}

	private chacha():void {
		let mix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let i = 0;
		let b = 0;

		// copy param array to mix
		for(i = 0; i < 16; i++)
			mix[i] = this.param[i]

		// mix rounds
		for(i = 0; i < JSChaCha20.rounds; i += 2) {
			this.quarterround(mix, 0, 4, 8, 12)
			this.quarterround(mix, 1, 5, 9, 13)
			this.quarterround(mix, 2, 6, 10, 14)
			this.quarterround(mix, 3, 7, 11, 15)

			this.quarterround(mix, 0, 5, 10, 15)
			this.quarterround(mix, 1, 6, 11, 12)
			this.quarterround(mix, 2, 7, 8, 13)
			this.quarterround(mix, 3, 4, 9, 14)
		}

		for(i = 0; i < 16; i++) {
			// add
			mix[i] += this.param[i]

			// store keystream
			this.keyStream[b++] = mix[i] & 0xFF
			this.keyStream[b++] = (mix[i] >>> 8) & 0xFF
			this.keyStream[b++] = (mix[i] >>> 16) & 0xFF
			this.keyStream[b++] = (mix[i] >>> 24) & 0xFF
		}
	}

	/**
	 * The basic operation of the ChaCha algorithm is the quarter round. It operates on four 32-bit unsigned integers, denoted a, b, c, and d.
	 *
	 * @param {Array} output
	 * @private
	 */
	private quarterround(output:number[], a:number, b:number, c:number, d:number):void {
		output[d] = this.rotl(output[d] ^ (output[a] += output[b]), 16);
		output[b] = this.rotl(output[b] ^ (output[c] += output[d]), 12);
		output[d] = this.rotl(output[d] ^ (output[a] += output[b]),  8);
		output[b] = this.rotl(output[b] ^ (output[c] += output[d]),  7);

		// JavaScript hack to make UINT32
		output[a] >>>= 0
		output[b] >>>= 0
		output[c] >>>= 0
		output[d] >>>= 0
	}

	/** Little-endian to uint 32 bytes */
	private getInt32(data:Uint8Array|[number], index:number):number {
		return data[index++] ^ (data[index++] << 8) ^ (data[index++] << 16) ^ (data[index] << 24);
	}

	/** Cyclic left rotation */
	private rotl(data:number, shift:number):number {
		return ((data << shift) | (data >>> (32 - shift)));
	}

	update(data:Uint8Array, output:Uint8Array):void {
		if(data.length === 0 || data.length !== output.length)
			throw new Error('Assertion error');

		// core function, build block and xor with input data
		for(let i = 0; i !== data.length; i++) {
			if(this.byteCounter === 0 || this.byteCounter === 64) {
				// generate new block
				this.chacha();

				// counter increment
				this.param[12]++;

				// reset internal counter
				this.byteCounter = 0;
			}

			output[i] = data[i] ^ this.keyStream[this.byteCounter++];
		}
	}
}
declare class TextEncoder 
{
    constructor(label?: string, options?: TextEncoding.TextEncoderOptions);
    encoding: string;
    encode(input?: string, options?: TextEncoding.TextEncodeOptions): Uint8Array;
}

declare class TextDecoder
{
    constructor(utfLabel?: string, options?: TextEncoding.TextDecoderOptions)
    encoding: string;
    fatal: boolean;
    ignoreBOM: boolean;
    decode(input?: ArrayBufferView, options?: TextEncoding.TextDecodeOptions): string;
}

declare namespace TextEncoding 
{        
    interface TextDecoderOptions {
        fatal?: boolean;
        ignoreBOM?: boolean;
    }

    interface TextDecodeOptions {
        stream?: boolean;
    }

    interface TextEncoderOptions {
        NONSTANDARD_allowLegacyEncoding?: boolean;
    }

    interface TextEncodeOptions {
        stream?: boolean;
    }
    
    interface TextEncodingStatic {
        TextDecoder: typeof TextDecoder;
        TextEncoder: typeof TextEncoder;
    }
}

declare var TextEncoding: TextEncoding.TextEncodingStatic;

export = TextEncoding;
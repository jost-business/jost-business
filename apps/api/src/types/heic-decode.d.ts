// heic-decode ships without types. It decodes the first image of a HEIC file
// to RGBA pixels, with the file's rotation already applied.
declare module 'heic-decode' {
  interface DecodedImage {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }
  function decode(options: { buffer: Buffer | ArrayBuffer | Uint8Array }): Promise<DecodedImage>;
  export = decode;
}

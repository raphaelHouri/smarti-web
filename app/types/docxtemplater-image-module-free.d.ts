declare module 'docxtemplater-image-module-free' {
    interface ImageModuleOptions {
        centered?: boolean;
        getImage: (tagValue: Buffer) => Buffer | Uint8Array | ArrayBuffer;
        getSize: (img: Buffer) => [number, number];
    }
    export default class ImageModule {
        constructor(options: ImageModuleOptions);
    }
}



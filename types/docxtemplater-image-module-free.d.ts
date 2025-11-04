declare module 'docxtemplater-image-module-free' {
    interface ImageModuleOptions {
        centered?: boolean;
        getImage: (tagValue: Buffer | string) => Buffer | Uint8Array | ArrayBuffer;
        getSize: (img: Buffer | string) => [number, number];
    }
    export default class ImageModule {
        constructor(options: ImageModuleOptions);
    }
}



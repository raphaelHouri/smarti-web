/**
 * Type definitions for React Native WebView communication
 */
declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage: (message: string) => void;
        };
    }
}

export { };


declare module "next-pwa" {
    import { NextConfig } from "next";

    interface PWAOptions {
        dest?: string;
        register?: boolean;
        skipWaiting?: boolean;
        disable?: boolean;
        runtimeCaching?: Array<{
            urlPattern: RegExp | string;
            handler: string;
            options?: {
                cacheName?: string;
                expiration?: {
                    maxEntries?: number;
                };
            };
        }>;
    }

    interface PWAConfig extends NextConfig {
        pwa?: PWAOptions;
    }

    function withPWA(config: PWAConfig): NextConfig;

    export default withPWA;
}


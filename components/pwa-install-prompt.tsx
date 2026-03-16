"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Download, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { shouldShowPWAPrompt } from "@/lib/restricted-users";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const { userId } = useAuth();

    // If user is in a special store flow (?store=android or ?store=ios),
    // don't show the PWA install prompt at all and mark it as dismissed.
    if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const storeParam = url.searchParams.get("store");
        const isStoreFlow = storeParam === "android" || storeParam === "ios";

        if (isStoreFlow) {
            try {
                localStorage.setItem("pwa-install-dismissed", Date.now().toString());
            } catch {
                // Ignore storage errors
            }
            return null;
        }
    }

    useEffect(() => {
        // Check if user is restricted - don't set up event listeners for restricted users
        if (!shouldShowPWAPrompt(userId)) {
            return;
        }

        // Check if app is already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        // Check if running as PWA
        if ((window.navigator as any).standalone === true) {
            setIsInstalled(true);
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallPrompt(true);
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        // Check if service worker is registered (PWA requirement)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration && deferredPrompt) {
                    // Service worker is registered and prompt is available, show after a delay
                    setTimeout(() => {
                        setShowInstallPrompt(true);
                    }, 3000);
                }
            });
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, [deferredPrompt, userId]);

    const handleInstallClick = async () => {
        if (typeof window !== "undefined") {
            const userAgent = window.navigator.userAgent || "";
            const isAndroid = /Android/i.test(userAgent);
            const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

            if (isAndroid) {
                window.location.href =
                    "https://play.google.com/store/apps/details?id=com.mehunanim.mehunanima&hl=he";
                return;
            }

            if (isIOS) {
                window.location.href =
                    "https://apps.apple.com/il/app/%D7%A1%D7%9E%D7%90%D7%A8%D7%98%D7%99-%D7%94%D7%9B%D7%A0%D7%94-%D7%9C%D7%9E%D7%91%D7%97%D7%9F-%D7%94%D7%9E%D7%97%D7%95%D7%A0%D7%A0%D7%99%D7%9D/id6462846082";
                return;
            }
        }

        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        } else {
            console.log("User dismissed the install prompt");
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Store dismissal in localStorage to not show again for a while
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    };

    // Check if user is restricted - don't show PWA prompt for restricted users
    // This check happens AFTER all hooks are called to follow Rules of Hooks
    if (!shouldShowPWAPrompt(userId)) {
        return null;
    }

    // Don't show if already installed or if user dismissed recently
    if (isInstalled || !showInstallPrompt || !deferredPrompt) {
        return null;
    }

    // Check if user dismissed recently (within 7 days)
    const dismissedTime = localStorage.getItem("pwa-install-dismissed");
    if (dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
            return null;
        }
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">התקן את האפליקציה</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        התקינו את סמארטי למכשיר שלכם לגישה מהירה יותר
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleInstallClick}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        התקן
                    </Button>
                    <Button
                        onClick={handleDismiss}
                        variant="ghost"
                        size="sm"
                        className="p-2"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}


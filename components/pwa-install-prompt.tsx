"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
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
    }, [deferredPrompt]);

    const handleInstallClick = async () => {
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


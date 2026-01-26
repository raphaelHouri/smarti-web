"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { shouldShowPWAPrompt } from "@/lib/restricted-users";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const { userId } = useAuth();
    const searchParams = useSearchParams();
    const storeParam = searchParams.get("store");

    useEffect(() => {
        // Check if user is restricted - don't set up event listeners for restricted users
        if (!shouldShowPWAPrompt(userId)) {
            return;
        }

        // Hide PWA install button when accessed from mobile app
        if (storeParam === "ios" || storeParam === "android") {
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
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        // Check if service worker is registered (PWA requirement)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration && deferredPrompt) {
                    // Service worker is registered and prompt is available
                    // Button will be shown
                }
            });
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, [deferredPrompt, userId, storeParam]);

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
    };

    // Move early returns AFTER all hooks to follow Rules of Hooks
    if (storeParam === "ios" || storeParam === "android") {
        return null;
    }

    if (!shouldShowPWAPrompt(userId)) {
        return null;
    }

    // Don't show if already installed or if no deferred prompt
    if (isInstalled || !deferredPrompt) {
        return null;
    }

    return (
        <Button
            onClick={handleInstallClick}
            variant="primaryOutline"
            size="sm"
            className="flex items-center gap-2 text-sm"
        >
            <Download className="w-4 h-4" />
            הורדת האפליקציה
        </Button>
    );
}


"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Component to handle sending userId to React Native WebView app
 * This component listens for requests from the app and sends the userId
 */
export function WebViewUserIdHandler() {
    const { user } = useUser();

    useEffect(() => {
        // Check if running in React Native WebView
        if (typeof window === "undefined" || !window.ReactNativeWebView) {
            return;
        }

        // Flag to prevent duplicate sends
        let userIdSent = false;

        // Function to send userId to app
        const sendUserIdToApp = () => {
            if (userIdSent || !user?.id || !window.ReactNativeWebView) {
                return;
            }

            try {
                window.ReactNativeWebView.postMessage(
                    JSON.stringify({
                        type: "userId",
                        userId: user.id,
                    })
                );
                userIdSent = true;
            } catch (error) {
                console.error("Error sending userId to app:", error);
            }
        };

        // Listen for messages from the app
        const handleMessage = (event: MessageEvent) => {
            try {
                // Handle messages from React Native WebView
                // React Native WebView sends messages via window.postMessage
                if (event.data && typeof event.data === "string") {
                    const data = JSON.parse(event.data);

                    if (data.type === "requestUserId") {
                        // App is requesting userId
                        sendUserIdToApp();
                    }

                    if (data.type === "userIdReceived") {
                        // App confirmed receipt, stop sending
                        userIdSent = true;
                    }
                }
            } catch (error) {
                // Ignore parsing errors or messages from other sources
            }
        };

        // Listen for window messages (from React Native WebView)
        window.addEventListener("message", handleMessage);

        // Send userId immediately if available
        if (user?.id) {
            // Small delay to ensure WebView is ready
            const timeout = setTimeout(() => {
                sendUserIdToApp();
            }, 500);

            return () => {
                clearTimeout(timeout);
                window.removeEventListener("message", handleMessage);
            };
        }

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [user?.id]);

    // This component doesn't render anything
    return null;
}


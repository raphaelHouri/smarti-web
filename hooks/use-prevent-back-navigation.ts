import { useEffect, useRef } from "react";

// Type definition for CloseWatcher API (experimental, available in modern browsers)
interface CloseWatcher extends EventTarget {
    requestClose(): void;
    destroy(): void;
    addEventListener(
        type: "close" | "cancel",
        listener: (event: Event) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: "close" | "cancel",
        listener: (event: Event) => void,
        options?: boolean | EventListenerOptions
    ): void;
}

interface CloseWatcherConstructor {
    new(): CloseWatcher;
}

declare const CloseWatcher: CloseWatcherConstructor | undefined;

interface UsePreventBackNavigationOptions {
    /**
     * Whether to prevent back navigation
     */
    enabled: boolean;
    /**
     * Callback when back navigation is attempted
     */
    onBackAttempt: () => void;
    /**
     * Whether to use the CloseWatcher API (modern browsers)
     * @default true
     */
    useCloseWatcher?: boolean;
}

/**
 * Hook to prevent back navigation and show a modal/confirmation
 * Works on all devices including iOS Safari and Android browsers
 * 
 * @example
 * ```tsx
 * const { openExitModal } = useExitModal();
 * 
 * usePreventBackNavigation({
 *   enabled: mode === "quiz",
 *   onBackAttempt: openExitModal
 * });
 * ```
 */
export function usePreventBackNavigation({
    enabled,
    onBackAttempt,
    useCloseWatcher = true,
}: UsePreventBackNavigationOptions) {
    const historyStatePushed = useRef(false);
    const closeWatcherRef = useRef<CloseWatcher | null>(null);

    useEffect(() => {
        if (!enabled) {
            // Reset the flag when disabled
            historyStatePushed.current = false;

            // Clean up CloseWatcher if it exists
            if (closeWatcherRef.current) {
                closeWatcherRef.current.destroy();
                closeWatcherRef.current = null;
            }
            return;
        }

        // Try to use CloseWatcher API (modern browsers - Chrome 102+, Safari 16.4+)
        if (useCloseWatcher && typeof CloseWatcher !== "undefined") {
            try {
                const closeWatcher = new CloseWatcher();
                closeWatcherRef.current = closeWatcher;

                const handleClose = () => {
                    onBackAttempt();
                };

                closeWatcher.addEventListener("close", handleClose);
                closeWatcher.addEventListener("cancel", handleClose);

                return () => {
                    closeWatcher.removeEventListener("close", handleClose);
                    closeWatcher.removeEventListener("cancel", handleClose);
                    closeWatcher.destroy();
                    closeWatcherRef.current = null;
                };
            } catch (error) {
                // CloseWatcher not supported or failed, fall back to manual implementation
                console.debug("CloseWatcher not available, using fallback");
            }
        }

        // Fallback: Manual implementation for older browsers
        // Add a history entry so we can detect back navigation (only once)
        if (!historyStatePushed.current) {
            window.history.pushState({ preventBack: true }, "");
            historyStatePushed.current = true;
        }

        // Handle browser back button
        const handlePopState = () => {
            // Immediately push the state back to prevent navigation
            window.history.pushState({ preventBack: true }, "");
            // Trigger callback
            onBackAttempt();
        };

        // Handle touch events for swipe back detection (mobile - all devices)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isSwipeInProgress = false;

        // Use percentage-based edge detection for better cross-device compatibility
        const EDGE_THRESHOLD_PERCENT = 0.1; // 10% of screen width from right edge
        const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
        const SWIPE_ANGLE_THRESHOLD = 30; // Maximum angle deviation from horizontal
        const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity (px/ms) for fast swipe

        const getEdgeThreshold = () => {
            // Use percentage-based threshold, minimum 30px for very small screens
            return Math.max(window.innerWidth * EDGE_THRESHOLD_PERCENT, 30);
        };

        const handleTouchStart = (e: TouchEvent) => {
            // Only track single touch
            if (e.touches.length !== 1) return;

            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isSwipeInProgress = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStartX || !touchStartY) return;
            if (e.touches.length !== 1) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - touchStartX;
            const edgeThreshold = getEdgeThreshold();
            const isFromRightEdge = touchStartX > window.innerWidth - edgeThreshold;

            // Check if it's a swipe from right edge moving left (RTL back gesture)
            if (isFromRightEdge && deltaX < -20) {
                isSwipeInProgress = true;
                // Prevent default to stop native swipe-back on iOS Safari
                e.preventDefault();
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartX || !touchStartY) {
                // Reset if no valid start
                touchStartX = 0;
                touchStartY = 0;
                return;
            }

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const timeElapsed = Date.now() - touchStartTime;
            const velocity = distance / timeElapsed;
            const angle = Math.abs(Math.atan2(deltaY, deltaX) * (180 / Math.PI));
            const edgeThreshold = getEdgeThreshold();

            // Check if it's a right swipe (RTL: swipe from right to left to go back)
            const isRightSwipe = deltaX < -SWIPE_THRESHOLD;
            const isHorizontalSwipe =
                angle < SWIPE_ANGLE_THRESHOLD || angle > 180 - SWIPE_ANGLE_THRESHOLD;
            const isFromRightEdge = touchStartX > window.innerWidth - edgeThreshold;
            const isFastSwipe = velocity > SWIPE_VELOCITY_THRESHOLD;

            // Trigger on swipe from right edge OR if a swipe was in progress
            if (
                (isRightSwipe &&
                    isHorizontalSwipe &&
                    isFromRightEdge &&
                    distance > SWIPE_THRESHOLD) ||
                (isSwipeInProgress && (isFastSwipe || distance > SWIPE_THRESHOLD))
            ) {
                e.preventDefault();
                onBackAttempt();
            }

            // Reset touch coordinates
            touchStartX = 0;
            touchStartY = 0;
            touchStartTime = 0;
            isSwipeInProgress = false;
        };

        const handleTouchCancel = () => {
            // Reset on touch cancel (e.g., when user scrolls instead of swipes)
            touchStartX = 0;
            touchStartY = 0;
            touchStartTime = 0;
            isSwipeInProgress = false;
        };

        // Add event listeners
        window.addEventListener("popstate", handlePopState);
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handleTouchEnd, { passive: false });
        window.addEventListener("touchcancel", handleTouchCancel, { passive: true });

        // Cleanup
        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
            window.removeEventListener("touchcancel", handleTouchCancel);
        };
    }, [enabled, onBackAttempt, useCloseWatcher]);
}


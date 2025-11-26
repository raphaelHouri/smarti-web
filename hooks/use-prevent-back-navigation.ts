import { useEffect, useRef } from "react";

interface UsePreventBackNavigationOptions {
    /**
     * Whether to prevent back navigation
     */
    enabled: boolean;
    /**
     * Callback when back navigation is attempted
     */
    onBackAttempt: () => void;
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
}: UsePreventBackNavigationOptions) {
    const onBackAttemptRef = useRef(onBackAttempt);

    // Keep the callback ref updated
    useEffect(() => {
        onBackAttemptRef.current = onBackAttempt;
    }, [onBackAttempt]);

    useEffect(() => {
        if (!enabled) {
            // When not enabled (not in quiz mode), do nothing
            return;
        }

        // ---- History & browser back button ----
        //
        // Strategy:
        // 1. Push a dummy history entry when quiz mode starts.
        // 2. Any time the user presses the system/back button (popstate),
        //    immediately push a new dummy entry and show the exit modal.
        //
        // This way:
        // - The user visually stays on the quiz.
        // - The modal is opened on EVERY back attempt during quiz mode.

        const pushGuardState = () => {
            try {
                window.history.pushState({ quizGuard: true }, "");
            } catch {
                // In very old/locked environments pushState can fail – ignore silently.
            }
        };

        // Initial guard state when quiz mode becomes active
        pushGuardState();

        // Handle browser back button
        const handlePopState = () => {
            // Immediately re‑add guard entry so the user stays on the quiz page
            pushGuardState();
            // Show exit modal on EVERY back attempt in quiz mode
            onBackAttemptRef.current();
        };

        // ---- Touch / swipe back (mobile, especially iOS) ----
        //
        // We approximate system "swipe from edge to go back" and open the modal instead.
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
                // Make sure we have a guard history entry so real back won't leave
                pushGuardState();
                // Open the exit modal on swipe‑back gesture
                onBackAttemptRef.current();
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
    }, [enabled]);
}


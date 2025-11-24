/**
 * Type definitions for CloseWatcher API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher
 */
interface CloseWatcher extends EventTarget {
    /**
     * Request that the user agent close the watcher.
     */
    requestClose(): void;

    /**
     * Destroy the watcher, removing it from the list of active watchers.
     */
    destroy(): void;

    /**
     * Fired when the user agent wants to close the watcher.
     */
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

declare var CloseWatcher: CloseWatcherConstructor | undefined;


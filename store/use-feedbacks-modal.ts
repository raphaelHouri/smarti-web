import { create } from 'zustand';

type FeedbackModalState = {
    isOpen: boolean;
    screenName: string;
    identifier: string;
    open: (screenName: string, identifier: string) => void;
    close: () => void;
};

interface FeedbackModalActions {
    open: (screenName: string, identifier: string) => void;
    close: () => void;
}

export const useFeedbacksModal = create<FeedbackModalState & FeedbackModalActions>((set) => ({
    isOpen: false,
    screenName: "",
    identifier: "",
    open: (screenName: string, identifier: string) => set({ isOpen: true, screenName, identifier }),
    close: () => set({ isOpen: false, screenName: "", identifier: "" }),
}));
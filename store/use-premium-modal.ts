import { create } from "zustand";

type PremiumModalState = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const usePremiumModal = create<PremiumModalState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}));
// creating the state for usability in multiple components


import { create } from "zustand";

type BookPurchaseModalState = {
    isOpen: boolean;
    planId?: string;
    open: (opts?: { planId?: string }) => void;
    close: () => void;
};

export const useBookPurchaseModal = create<BookPurchaseModalState>((set) => ({
    isOpen: false,
    planId: undefined,
    open: (opts) => set({ isOpen: true, planId: opts?.planId }),
    close: () => set({ isOpen: false, planId: undefined }),
}));
import { create } from "zustand";

type BookPurchaseModalState = {
    isOpen: boolean;
    planId?: string;
    userInfo?: {
        name: string | null;
        email: string | null;
    };
    open: (opts?: { planId?: string; userInfo?: { name: string | null; email: string | null } }) => void;
    close: () => void;
};

export const useBookPurchaseModal = create<BookPurchaseModalState>((set) => ({
    isOpen: false,
    planId: undefined,
    userInfo: undefined,
    open: (opts) => set({ isOpen: true, planId: opts?.planId, userInfo: opts?.userInfo }),
    close: () => set({ isOpen: false, planId: undefined, userInfo: undefined }),
}));
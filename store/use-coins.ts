import { create } from "zustand";

type CoinsModalState = {
    isOpen: boolean;
    open: () => void;
    close: () => void
}

export const useCoinsModal = create<CoinsModalState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}))


import { create } from "zustand";

type RegisterModalState = {
    isOpen: boolean
    open: () => void;
    close: () => void;
}

export const useRegisterModal = create<RegisterModalState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}))
// creating the state for usability in multiple components
import { create } from "zustand";

type FinishLessonModalState = {
    isOpen: boolean
    isApproved: boolean
    approve: () => void;
    open: () => void;
    close: () => void;
}

export const useFinishLessonModal = create<FinishLessonModalState>((set) => ({
    isOpen: false,
    isApproved: false,
    approve: () => set({ isApproved: true }),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}))
// creating the state for usability in multiple components
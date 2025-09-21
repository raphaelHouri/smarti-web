import { create } from "zustand";

type FinishLessonModalState = {
    isOpen: boolean
    isApproved: boolean
    approve: () => void;
    clearApprove: () => void;
    open: () => void;
    close: () => void;
}

export const useFinishLessonModal = create<FinishLessonModalState>((set) => ({
    isOpen: false,
    isApproved: false,
    approve: () => set({ isApproved: true }),
    clearApprove: () => set({ isApproved: false }),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}))
// creating the state for usability in multiple components
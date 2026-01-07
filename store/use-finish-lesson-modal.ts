import { create } from "zustand";

type FinishLessonModalState = {
    isOpen: boolean
    isApproved: boolean
    hasUnansweredQuestions: boolean;
    approve: () => void;
    clearApprove: () => void;
    open: (hasUnansweredQuestions?: boolean) => void;
    close: () => void;
}

export const useFinishLessonModal = create<FinishLessonModalState>((set) => ({
    isOpen: false,
    isApproved: false,
    hasUnansweredQuestions: false,
    approve: () => set({ isApproved: true, isOpen: false }), // Close modal when approving
    clearApprove: () => set({ isApproved: false }),
    open: (hasUnansweredQuestions = false) => set({ isOpen: true, hasUnansweredQuestions, isApproved: false }), // Reset isApproved when opening
    close: () => set({ isOpen: false, hasUnansweredQuestions: false })
}))
// creating the state for usability in multiple components
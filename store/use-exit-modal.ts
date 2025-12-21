import {create} from "zustand";

type ExitModalState = {
    isOpen:boolean
    hasUnansweredQuestions: boolean;
    open: (hasUnansweredQuestions?: boolean) => void;
    close:() => void;
}

export const useExitModal = create<ExitModalState>((set)=>({
    isOpen:false,
    hasUnansweredQuestions: false,
    open: (hasUnansweredQuestions = false) => set({isOpen:true, hasUnansweredQuestions}),
    close:() => set({isOpen:false, hasUnansweredQuestions: false})
}))
// creating the state for usability in multiple components
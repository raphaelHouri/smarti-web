import { create } from "zustand";

// creating the state for usability in multiple components
interface CountdownState {
    timeLeft: number;
    isRunning: boolean;
    setTimeLeft: (time: number | ((prev: number) => number)) => void;
    setIsRunning: (running: boolean) => void;
    resetTimer: (initialTime: number) => void;
}

export const useCountdownStore = create<CountdownState>((set) => ({
    timeLeft: 0,
    isRunning: true,
    setTimeLeft: (time) => {
        set((state) => ({
            timeLeft: typeof time === "function" ? time(state.timeLeft) : time
        }));
    },
    setIsRunning: (running) => set({ isRunning: running }),
    resetTimer: (initialTime) => set({ timeLeft: initialTime, isRunning: true }),
}));

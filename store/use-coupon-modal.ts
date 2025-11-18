import { create } from "zustand";

type CouponModalState = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

export const useCouponModal = create<CouponModalState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));


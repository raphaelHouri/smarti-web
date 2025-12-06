"use client";

import { useTransition } from "react";
import { setGuestSystemStep, setUserSystemStep } from "@/actions/user-system-step";

type SystemStepSelectorProps = {
    currentStep: number | null;
    isAuthenticated: boolean;
};

export function SystemStepSelector({ currentStep, isAuthenticated }: SystemStepSelectorProps) {
    const [isPending, startTransition] = useTransition();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(event.target.value);
        if (!value) return;

        startTransition(() => {
            if (isAuthenticated) {
                void setUserSystemStep(value);
            } else {
                void setGuestSystemStep(value);
            }
        });
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <span>שלב מערכת</span>
            <select
                className="border rounded px-2 py-1 bg-white text-black"
                defaultValue={currentStep ?? ""}
                disabled={isPending}
                onChange={handleChange}
            >
                <option value="" disabled>
                    בחר
                </option>
                <option value={1}>שלב 1</option>
                <option value={2}>שלב 2</option>
                <option value={3}>שלב 3</option>
            </select>
        </div>
    );
}



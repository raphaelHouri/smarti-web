"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { setGuestSystemStep, setUserSystemStep } from "@/actions/user-system-step";

export function SystemStepHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const stepParam = searchParams.get("step");
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (stepParam && !hasProcessed.current) {
            const stepNumber = Number(stepParam);
            if ([1, 2, 3].includes(stepNumber)) {
                hasProcessed.current = true;
                const setStep = async () => {
                    try {
                        if (isSignedIn) {
                            await setUserSystemStep(stepNumber);
                        } else {
                            await setGuestSystemStep(stepNumber);
                        }
                        // Remove query param after setting the step, but keep the step in the URL for a moment
                        // so the tabs can read it
                        setTimeout(() => {
                            router.replace("/");
                        }, 100);
                    } catch (error) {
                        console.error("Failed to set system step:", error);
                        hasProcessed.current = false;
                    }
                };
                void setStep();
            }
        }
    }, [stepParam, isSignedIn, router]);

    return null;
}


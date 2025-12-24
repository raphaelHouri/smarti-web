"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { setGuestSystemStep, setUserSystemStep, initializeSystemStepCookie } from "@/actions/user-system-step";

export function SystemStepHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { isSignedIn } = useAuth();
    const stepParam = searchParams.get("step");
    const hasProcessed = useRef(false);
    const hasInitialized = useRef(false);

    // Initialize cookie on mount if it doesn't exist
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            void initializeSystemStepCookie();
        }
    }, []);

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
                        // Server action already calls revalidatePath(), refresh router
                        router.refresh();
                        // Remove query param after setting the step, but preserve current path
                        setTimeout(() => {
                            router.replace(pathname);
                        }, 100);
                    } catch (error) {
                        console.error("Failed to set system step:", error);
                        hasProcessed.current = false;
                    }
                };
                void setStep();
            }
        }
    }, [stepParam, isSignedIn, router, pathname]);

    return null;
}


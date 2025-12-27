"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

export function MarketingAuthButtons() {
    const [mounted, setMounted] = useState(false);
    const { step: systemStep } = useSystemStep();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering Clerk components until mounted
    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center gap-y-3 max-w-[330px] w-full">
                <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-y-3 max-w-[330px] w-full">
            <ClerkLoading>
                <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </ClerkLoading>
            <ClerkLoaded>
                <SignedOut>
                    <SignUpButton mode="modal" forceRedirectUrl="/learn">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="w-full"
                            onClick={(e) => {
                                // Track the event - event will bubble to SignUpButton
                                trackEvent("marketing_signup_cta_clicked", {
                                    systemStep,
                                    location: "marketing_hero",
                                    source: "homepage",
                                });
                                // Don't prevent default or stop propagation - let Clerk handle it
                            }}
                        >
                            בואו נלמד ביחד
                        </Button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="w-full group relative animate-bounce-few overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-100"
                        asChild
                    >
                        <Link href="/learn" className="flex items-center justify-center gap-2">
                            <span>התחל ללמוד</span>
                        </Link>
                    </Button>
                </SignedIn>
            </ClerkLoaded>
        </div>
    );
}

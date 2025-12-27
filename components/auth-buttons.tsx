"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Loader, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TapAnimation } from "./tap-animation";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";
import { useEffect, useState } from "react";

export function AuthButtons() {
    const [mounted, setMounted] = useState(false);
    const { step: systemStep } = useSystemStep();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering Clerk components until mounted
    if (!mounted) {
        return (
            <div className="mt-2">
                <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
        );
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <>
            <div className="mt-2">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
            </div>
            <ClerkLoaded>
                <SignedIn>
                    <div className="mt-1">
                        <UserButton />
                    </div>
                </SignedIn>
                <SignedOut>
                    <SignInButton
                        forceRedirectUrl="/"
                        signUpForceRedirectUrl="/"
                        mode="modal"
                    >
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                            onClick={() => {
                                trackEvent("sign_in_started", {
                                    systemStep,
                                    source: currentPath,
                                    location: "header",
                                    redirectUrl: "/learn",
                                });
                            }}
                        >
                            התחברות  <UserPlus className="w-4 h-4" />
                        </Button>
                    </SignInButton>
                </SignedOut>
            </ClerkLoaded>
        </>
    );
}


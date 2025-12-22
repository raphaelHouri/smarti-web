"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Loader, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TapAnimation } from "./tap-animation";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

export function AuthButtons() {
    const { step: systemStep } = useSystemStep();
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
                        forceRedirectUrl="/learn"
                        signUpForceRedirectUrl="/learn"
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


"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Loader, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TapAnimation } from "./tap-animation";

export function AuthButtons() {
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
                        <Button variant="ghost" className="flex items-center gap-2">
                            התחברות  <UserPlus className="w-4 h-4" />
                    </SignInButton>
                </SignedOut>
            </ClerkLoaded>
        </>
    );
}


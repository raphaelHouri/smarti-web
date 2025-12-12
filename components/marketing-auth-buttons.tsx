"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function MarketingAuthButtons() {
    const [mounted, setMounted] = useState(false);

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
                        <Button size="lg" variant="secondary" className="w-full">
                            בואו נלמד ביחד
                        </Button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    <Button variant="secondary" size="lg" className="w-full" asChild>
                        <Link href="/learn">
                            התחל ללמוד
                        </Link>
                    </Button>
                </SignedIn>
            </ClerkLoaded>
        </div>
    );
}

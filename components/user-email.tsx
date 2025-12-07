"use client";

import { useUser } from "@clerk/nextjs";

export const UserEmail = () => {
    const { user } = useUser();

    if (!user) {
        return null;
    }

    const email = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;

    if (!email) {
        return null;
    }

    return (
        <span className="text-sm text-muted-foreground truncate flex-1" dir="ltr">
            {email}
        </span>
    );
};


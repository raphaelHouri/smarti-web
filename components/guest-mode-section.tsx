"use client";

import { Button } from "./ui/button";
import { useRegisterModal } from "@/store/use-register-modal";
import { UserPlus } from "lucide-react";
import { TapAnimation } from "./tap-animation";

export const GuestModeSection = () => {
    const { open: openRegisterModal } = useRegisterModal();

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center px-2 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    הינך מצב אורח
                </span>
            </div>
            <Button
                variant="primary"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={openRegisterModal}
            >
                הרשמה / התחברות
                <UserPlus className="w-4 h-4" />
            </Button>
        </div>
    );
};


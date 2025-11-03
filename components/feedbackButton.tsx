"use client"
import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming this is the ShadCN button
import { useFeedbacksModal } from "@/store/use-feedbacks-modal";
import { MessageSquarePlusIcon } from "lucide-react";

interface FeedbackButtonProps {
    screenName?: string;
    identifier?: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ screenName, identifier }) => {
    const { open } = useFeedbacksModal();
    const pathname = usePathname();

    const handleClick = () => {
        const currentScreenName = screenName || pathname || "";
        const currentIdentifier = identifier || "";

        open(
            currentScreenName as string,
            currentIdentifier as string
        );
    };

    return (
        <Button onClick={handleClick} variant={"secondary"} size="sm" >
            <span className="hidden sm:inline">כתוב לנו&nbsp;</span>משוב
            <MessageSquarePlusIcon className="mr-2 h-4 w-4" />

        </Button>
    );
};



export default FeedbackButton;
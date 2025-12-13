"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
    url: string;
}

const CopyLinkButton = ({ url }: CopyLinkButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("הקישור הועתק ללוח");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("שגיאה בהעתקת הקישור");
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 mt-2"
        >
            {copied ? (
                <>
                    <Check className="w-3.5 h-3.5" />
                    הועתק!
                </>
            ) : (
                <>
                    <Copy className="w-3.5 h-3.5" />
                    העתק קישור
                </>
            )}
        </button>
    );
};

export default CopyLinkButton;


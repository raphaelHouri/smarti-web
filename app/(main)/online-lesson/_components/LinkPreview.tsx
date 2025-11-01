"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LinkPreviewProps {
    url: string;
    title: string;
    description?: string | null;
}

interface LinkMetadata {
    title: string;
    description: string;
    image?: string;
    domain: string;
}

export const LinkPreview = ({ url, title, description }: LinkPreviewProps) => {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Try to extract domain from URL
        try {
            const urlObj = new URL(url);
            setMetadata({
                title: title,
                description: description || "",
                domain: urlObj.hostname.replace("www.", ""),
            });
        } catch {
            setMetadata({
                title: title,
                description: description || "",
                domain: url,
            });
        }
    }, [url, title, description]);

    if (!metadata) return null;

    return (
        <Link href={url} target="_blank" rel="noopener noreferrer" className="block" dir="rtl">
            <Card className="group relative overflow-hidden border-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 hover:shadow-lg cursor-pointer h-full">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <LinkIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-2 flex-row-reverse">
                                <h4 className="font-semibold text-sm leading-tight text-neutral-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-right">
                                    {metadata.title}
                                </h4>
                                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                            </div>
                            {metadata.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 text-right">
                                    {metadata.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-row-reverse">
                                <span className="truncate">{metadata.domain}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};


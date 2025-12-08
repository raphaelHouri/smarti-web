"use client";

import { useTransition, useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { setGuestSystemStep, setUserSystemStep } from "@/actions/user-system-step";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

type SystemStepTabsProps = {
    isAuthenticated: boolean;
    initialStep?: number;
};

const stepTabs = [
    {
        title: "שלב א",
        value: 1 as const,
        description: "היכרות בסיסית עם מבנה המבחנים, תרגולים קלים וחווייתיים להתחלה רכה.",
    },
    {
        title: "שלב ב",
        value: 2 as const,
        description: "העמקה בפתרון שאלות, הרחבת אוצר המילים וחיזוק חשיבה לוגית.",
    },
    {
        title: "כיתה ג' - שלב ב",
        value: 3 as const,
        description: "הכנה מתקדמת לקראת מבחנים מאתגרים, סימולציות ותרגול ממוקד.",
    },
];

import { getSystemStepFromCookie } from "@/lib/utils";

export function SystemStepTabs({ isAuthenticated, initialStep }: SystemStepTabsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();
    const stepParam = searchParams.get("step");

    // Initialize from query param, then initialStep prop, then cookie, then default to 1
    const getInitialValue = () => {
        if (stepParam) {
            const stepNumber = Number(stepParam);
            if ([1, 2, 3].includes(stepNumber)) {
                return String(stepNumber);
            }
        }
        if (initialStep && [1, 2, 3].includes(initialStep)) {
            return String(initialStep);
        }
        return String(getSystemStepFromCookie());
    };

    const [currentValue, setCurrentValue] = useState<"1" | "2" | "3">(getInitialValue() as "1" | "2" | "3");

    // Update currentValue when query param changes
    useEffect(() => {
        if (stepParam) {
            const stepNumber = Number(stepParam);
            if ([1, 2, 3].includes(stepNumber)) {
                setCurrentValue(String(stepNumber) as "1" | "2" | "3");
            }
        }
    }, [stepParam]);

    const handleChange = (value: string) => {
        setCurrentValue(value as "1" | "2" | "3");
        const numeric = Number(value);
        if (![1, 2, 3].includes(numeric)) return;

        startTransition(async () => {
            if (isAuthenticated) {
                await setUserSystemStep(numeric);
            } else {
                await setGuestSystemStep(numeric);
            }
            // Server action already calls revalidatePath(), just refresh the router
            router.refresh();
        });
    };

    return (
        <Tabs
            value={currentValue}
            onValueChange={handleChange}
            className="w-full max-w-[480px]"
        >
            <TabsList className="w-full flex-row-reverse justify-between bg-emerald-50/60 dark:bg-emerald-950/40">
                {stepTabs.map((step) => (
                    <TabsTrigger
                        key={step.value}
                        value={String(step.value)}
                        className="flex-1 text-xs sm:text-sm"
                        disabled={isPending}
                    >
                        {step.title}
                    </TabsTrigger>
                ))}
            </TabsList>
            <Image
                src={`/smarti_step${currentValue}.png`}
                alt="Smarti Logo"
                width={300}
                height={290}
                className="mx-auto"
                priority
            />
            {stepTabs.map((step) => (
                <TabsContent key={step.value} value={String(step.value)} className="mt-3">
                    <h1 className="font-bold text-xl lg:text-3xl text-neutral-600 max-w-[600px] text-center dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-tr from-slate-500 to-neutral-300/90">
                        התכוננו למבחני המחוננים ומצטיינים ביחד עם{' '}
                        <span className="text-[#00C950] "> סמארטי -  {step.title}</span>
                    </h1>
                </TabsContent>
            ))}
        </Tabs>
    );
}

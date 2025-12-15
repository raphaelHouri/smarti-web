"use client";

import { Check, Crown, Star } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePremiumModal } from "@/store/use-premium-modal";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LessonButtonProps {
    id: string,
    index: number,
    locked?: boolean,
    current?: boolean,
    rightQuestions: number | undefined
    totalQuestions: number | undefined
    totalCount: number | null | undefined,
    isPremium: boolean,
    isPro?: boolean,
}


const LessonButton = ({
    id,
    index,
    locked,
    current,
    rightQuestions,
    totalQuestions,
    totalCount,
    isPremium,
    isPro = false,
}: LessonButtonProps) => {
    const { open } = usePremiumModal();
    const [showTooltip, setShowTooltip] = useState(false);
    const percentage = rightQuestions && totalQuestions ? (rightQuestions / totalQuestions) * 100 : 0;

    useEffect(() => {
        if (showTooltip) {
            const timer = setTimeout(() => {
                setShowTooltip(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showTooltip]);
    const cycleLength = 8;
    const cycleIndex = index % cycleLength;
    // jab index = 1 or 2 % 8  
    // after every 8 it should repeat
    let indentationLevel;
    if (cycleIndex <= 2) {
        indentationLevel = cycleIndex;
    }
    else if (cycleIndex <= 4) {
        indentationLevel = 4 - cycleIndex;
    }
    else if (cycleIndex <= 6) {
        indentationLevel = 4 - cycleIndex;
    }
    else {
        indentationLevel = cycleIndex - 8;
    }

    const rightPosition = indentationLevel * 60;

    const isFirst = index === 0;
    const isLast = index === totalCount;

    const isCompleted = !current && !locked;

    const Icon = isCompleted ? Check : isLast ? Crown : Star;
    const href = `/lesson/${id}?lesson=${index + 1}`;


    return (
        <Link href={href} aria-disabled={locked}
            onClick={(e) => {
                // Show message if lesson is locked
                if (locked) {
                    e.preventDefault();
                    setShowTooltip(true);
                    return;
                }
                // Only block premium content if user doesn't have pro access
                if (isPremium && !isPro) {
                    e.preventDefault();
                    open();
                }
            }}
        >
            <div className="relative flex flex-col items-center"
                style={{
                    right: `${rightPosition}px`,
                    marginTop: isFirst && !isCompleted ? 60 : 24,
                }}
            >
                {isPremium && !isPro && (
                    <div className="absolute -top-2 -right-2 z-20 flex items-center justify-center rounded-full bg-amber-100 border border-amber-300 p-1">
                        <Crown className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                )}
                {!isPremium && !isPro && (
                    <div className={cn("absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center rounded-full bg-green-100 border border-green-300 px-2 py-0.5 shadow-md hover:scale-110 transition-transform duration-200", !locked && rightQuestions !== undefined && totalQuestions !== undefined ? "-top-3" : "-bottom-8")}>
                        <span className="text-xs font-bold text-green-700">
                            חינם
                        </span>
                    </div>
                )}
                <AnimatePresence>
                    {showTooltip && locked && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.6 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 10,
                                },
                            }}
                            exit={{ opacity: 0, y: 20, scale: 0.6 }}
                            className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/30 dark:to-orange-900/30 border-2 border-amber-300 dark:border-amber-600 z-50 shadow-2xl px-5 py-3 whitespace-nowrap"
                        >
                            <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-amber-400 to-transparent h-0.5" />
                            <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent h-0.5" />
                            <div className="absolute right-10 w-[30%] z-30 -bottom-px bg-gradient-to-r from-transparent via-orange-400 to-transparent h-0.5" />
                            <div className="font-bold text-amber-800 dark:text-amber-200 relative z-30 text-sm text-center">
                                כדי לתרגל שלב זה יש לעבור את כל השלבים לפני
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {current ? (
                    <div className="h-[102px] w-[102px]">
                        <div className="absolute -top-6 left-2.5 px-3 py-2.5
                border-2 font-bold uppercase text-green-500 bg-white rounded-xl
                animate-bounce tracking-wide z-10">
                            התחלה
                            <div
                                className="absolute -bottom-2 left-1/2 w-0 h-0 border-x-8
                border-x-transparent border-t-8 transform -translate-x-1/2"
                            />
                        </div>
                        <CircularProgressbarWithChildren
                            value={!percentage || Number.isNaN(percentage) ? 0 : percentage}
                            styles={{
                                path: {
                                    stroke: "#4ade80",
                                },
                                trail: {
                                    stroke: "e5e7eb"
                                },
                            }}
                        >
                            <Button size="rounded" variant={locked ? "locked" : "secondary"}
                                className="h-[70px] w-[70px] border-b-8 cursor-pointer"
                            >
                                <Icon
                                    className={cn("h-10 w-10",
                                        locked
                                            ? "fill-neutral-400 text-neutral-400"
                                            : "fill-primary-foreground text-primary-foreground",
                                        isCompleted && "fill-none stroke-[4]"
                                    )}
                                />
                            </Button>
                        </CircularProgressbarWithChildren>
                    </div>
                ) : (
                    <Button size="rounded" variant={locked ? "locked" : "secondary"}
                        className="h-[70px] w-[70px] border-b-8 cursor-pointer"
                    >
                        <Icon
                            className={cn("h-10 w-10",
                                locked
                                    ? "fill-neutral-400 text-neutral-400"
                                    : "fill-primary-foreground text-primary-foreground",
                                isCompleted && "fill-none stroke-[4]"
                            )}
                        />
                    </Button>
                )}
                {!locked && rightQuestions !== undefined && totalQuestions !== undefined && (
                    <div className="mt-2 px-2 py-0.5 rounded-full bg-green-100 border border-green-200">
                        <span className="text-sm font-semibold text-green-600">
                            {rightQuestions}/{totalQuestions}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}

export default LessonButton;
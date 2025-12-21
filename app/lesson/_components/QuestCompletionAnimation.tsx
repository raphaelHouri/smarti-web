"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { quests } from "@/constants";
import QuestIcon from "@/components/QuestIcon";

interface QuestCompletionAnimationProps {
    previousExperience: number;
    newExperience: number;
    className?: string;
    onClose?: () => void;
    autoClose?: boolean;
}

export default function QuestCompletionAnimation({
    previousExperience,
    newExperience,
    className,
    onClose,
    autoClose = true,
}: QuestCompletionAnimationProps) {
    const [completedQuest, setCompletedQuest] = useState<typeof quests[0] | null>(null);

    useEffect(() => {
        // Find which quest was completed (if any)
        const quest = quests.find(q => {
            // User crossed the threshold: was below, now at or above
            return previousExperience < q.value && newExperience >= q.value;
        });

        if (quest) {
            setCompletedQuest(quest);

            // Auto-close after 3 seconds only if autoClose is enabled
            if (autoClose) {
                const timer = setTimeout(() => {
                    if (onClose) {
                        onClose();
                    }
                }, 3000);

                return () => clearTimeout(timer);
            }
        }
    }, [previousExperience, newExperience, onClose, autoClose]);

    if (!completedQuest) {
        return null;
    }

    return (
        <div className={cn("w-full max-w-md mx-auto", className)}>
            <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 rounded-xl sm:rounded-2xl p-3 sm:p-6 border-2 border-amber-300 dark:border-amber-700 shadow-xl overflow-hidden">
                {/* Celebration particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2;
                        const distance = 80;
                        return (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                initial={{
                                    x: "50%",
                                    y: "50%",
                                    opacity: 0,
                                    scale: 0,
                                }}
                                animate={{
                                    x: `calc(50% + ${Math.cos(angle) * distance}px)`,
                                    y: `calc(50% + ${Math.sin(angle) * distance}px)`,
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                }}
                                transition={{
                                    duration: 1,
                                    delay: i * 0.05,
                                    ease: "easeOut",
                                }}
                            />
                        );
                    })}
                </div>

                {/* Header */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 mb-2 sm:mb-4 relative z-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                        }}
                        className="relative"
                    >
                        <QuestIcon
                            animationPath={completedQuest.animation}
                            width={120}
                            height={120}
                            className="sm:w-[150px] sm:h-[150px]"
                            loop={true}
                        />
                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 size-8 sm:size-10 rounded-full bg-amber-500 dark:bg-amber-400 ring-2 ring-amber-200 dark:ring-amber-600 grid place-items-center shadow-lg">
                            <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-white" />
                        </div>
                    </motion.div>
                    <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        עלית שלב! 🎉
                    </h3>
                </div>

                {/* Quest Info */}
                <div className="relative z-10 mb-3 sm:mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center space-y-2 sm:space-y-3"
                    >
                        <p className="text-base sm:text-xl font-semibold text-amber-800 dark:text-amber-200">
                            {completedQuest.title}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            <p className="text-sm sm:text-base text-amber-700 dark:text-amber-300">
                                השלמת את המשימה בהצלחה!
                            </p>
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                        </div>
                    </motion.div>
                </div>

                <Separator className="mb-2 sm:mb-4" />

                {/* Experience Display */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 relative z-10">
                    <div className="flex flex-col items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">נקודות קודמות</span>
                        <span className="text-lg sm:text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                            {previousExperience}
                        </span>
                    </div>

                    <motion.div
                        className="flex items-center gap-1 sm:gap-2"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                        }}
                    >
                        <div className="text-center">
                            <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                                +{newExperience - previousExperience}
                            </p>
                            <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                                נקודות
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex flex-col items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">נקודות חדשות</span>
                        <span className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {newExperience}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";

interface RankingAnimationProps {
    previousRank: number | null;
    newRank: number | null;
    totalUsers: number;
    className?: string;
    onClose?: () => void;
    autoClose?: boolean;
}

export default function RankingAnimation({
    previousRank,
    newRank,
    totalUsers,
    className,
    onClose,
    autoClose = true,
}: RankingAnimationProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasImproved, setHasImproved] = useState(false);
    const { userId } = useAuth();

    // Only show animation if ranking improved
    useEffect(() => {
        if (previousRank !== null && newRank !== null && newRank < previousRank) {
            setHasImproved(true);
            setIsAnimating(true);

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
    }, [previousRank, newRank, onClose, autoClose]);

    if (!hasImproved || previousRank === null || newRank === null) {
        return null;
    }

    const rankChange = previousRank - newRank;

    // Calculate which ranks to show (show 3-4 users around the user's position)
    const getVisibleRanks = (centerRank: number) => {
        const visibleCount = 5; // Show 5 positions total
        const half = Math.floor(visibleCount / 2);
        let startRank = Math.max(1, centerRank - half);
        let endRank = Math.min(totalUsers, startRank + visibleCount - 1);

        // Adjust if we're near the top
        if (endRank - startRank < visibleCount - 1) {
            startRank = Math.max(1, endRank - visibleCount + 1);
        }

        return Array.from({ length: endRank - startRank + 1 }, (_, i) => startRank + i);
    };

    const previousRanks = getVisibleRanks(previousRank);
    const newRanks = getVisibleRanks(newRank);
    const allRanks = Array.from(new Set([...previousRanks, ...newRanks])).sort((a, b) => a - b);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("w-full max-w-md mx-auto", className)}
        >
            <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 rounded-xl sm:rounded-2xl p-3 sm:p-6 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    >
                        <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500 fill-yellow-500" />
                    </motion.div>
                    <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        עלית בדירוג! 🎉
                    </h3>
                </div>

                {/* Leaderboard Animation */}
                <div className="relative mb-3 sm:mb-6 min-h-[180px] sm:min-h-[300px]">
                    <div className="space-y-1 sm:space-y-2 relative">
                        <AnimatePresence mode="popLayout">
                            {allRanks.map((rank) => {
                                const isUserRank = rank === newRank;
                                const wasUserRank = rank === previousRank && rank !== newRank;
                                const isInRange = rank >= Math.min(newRank, previousRank) && rank <= Math.max(newRank, previousRank);

                                // Calculate initial position (before animation)
                                const getInitialY = () => {
                                    if (rank === previousRank) return 0;
                                    if (rank < previousRank && rank >= newRank) {
                                        // Ranks that will move down
                                        const index = allRanks.indexOf(rank);
                                        return 0;
                                    }
                                    return 0;
                                };

                                return (
                                    <motion.div
                                        key={rank}
                                        layout
                                        initial={{
                                            opacity: 0.6,
                                            scale: 0.95,
                                        }}
                                        animate={{
                                            opacity: isUserRank ? 1 : isInRange ? 0.8 : 0.5,
                                            scale: isUserRank ? 1.02 : 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                        }}
                                        transition={{
                                            layout: {
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 40,
                                            },
                                            opacity: {
                                                duration: 0.3,
                                            },
                                            scale: {
                                                duration: 0.3,
                                            },
                                        }}
                                        className={cn(
                                            "items-center justify-center px-2 sm:px-4 flex w-full p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-all relative z-10",
                                            isUserRank
                                                ? "bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-300 shadow-lg"
                                                : wasUserRank
                                                    ? "bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                                    : "bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                        )}
                                    >
                                        <motion.p
                                            className={cn(
                                                "font-bold mr-2 sm:mr-4 min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base",
                                                isUserRank
                                                    ? "text-emerald-700 dark:text-emerald-300 sm:text-lg"
                                                    : wasUserRank
                                                        ? "text-red-600 dark:text-red-400"
                                                        : "text-slate-700 dark:text-slate-200"
                                            )}
                                            initial={false}
                                            animate={{
                                                scale: isUserRank ? 1.1 : 1,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                type: "spring",
                                                stiffness: 300,
                                            }}
                                        >
                                            {rank}
                                        </motion.p>

                                        {isUserRank || wasUserRank ? (
                                            <>
                                                <motion.div
                                                    initial={false}
                                                    animate={{
                                                        scale: isUserRank ? 1.05 : 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        type: "spring",
                                                        stiffness: 300,
                                                    }}
                                                >
                                                    <Avatar
                                                        className={cn(
                                                            "border h-7 w-7 sm:h-10 sm:w-10 mr-2 sm:mr-4",
                                                            isUserRank
                                                                ? "border-emerald-400 dark:border-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-500"
                                                                : "border-red-300 dark:border-red-600"
                                                        )}
                                                    >
                                                        <AvatarImage
                                                            className="object-cover"
                                                            src="/smarti_avatar.png"
                                                            alt="You"
                                                        />
                                                    </Avatar>
                                                </motion.div>
                                                <p
                                                    className={cn(
                                                        "font-bold flex-1 text-sm sm:text-base",
                                                        isUserRank
                                                            ? "text-emerald-800 dark:text-emerald-100 sm:text-lg"
                                                            : "text-red-700 dark:text-red-300"
                                                    )}
                                                >
                                                    אתה
                                                    {isUserRank && (
                                                        <motion.span
                                                            className="ml-1 sm:ml-2 text-xs sm:text-sm"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            (עלית!)
                                                        </motion.span>
                                                    )}
                                                </p>
                                                <motion.div
                                                    className={cn(
                                                        "flex items-center gap-0.5 sm:gap-1",
                                                        isUserRank
                                                            ? "text-emerald-700 dark:text-emerald-300 font-semibold text-xs sm:text-sm"
                                                            : "text-red-600 dark:text-red-400 text-xs"
                                                    )}
                                                    initial={false}
                                                    animate={{
                                                        scale: isUserRank ? 1.05 : 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                >
                                                    <img
                                                        src="/stars.svg"
                                                        alt="נקודות"
                                                        width={16}
                                                        height={16}
                                                        className="inline-block sm:w-5 sm:h-5"
                                                    />
                                                    <span className="text-xs">---</span>
                                                </motion.div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-7 w-7 sm:h-10 sm:w-10 mr-2 sm:mr-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                                                <p className="font-bold flex-1 text-neutral-600 dark:text-slate-400 text-xs sm:text-sm">
                                                    משתמש אחר
                                                </p>
                                                <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground text-xs">
                                                    <img
                                                        src="/stars.svg"
                                                        alt="נקודות"
                                                        width={14}
                                                        height={14}
                                                        className="inline-block opacity-50 sm:w-4 sm:h-4"
                                                    />
                                                    <span className="text-xs">---</span>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Rank Display */}
                <Separator className="mb-2 sm:mb-4" />
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">מיקום קודם</span>
                        <motion.span
                            className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400"
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            #{previousRank}
                        </motion.span>
                    </div>

                    <motion.div
                        className="flex items-center gap-1 sm:gap-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.3,
                            type: "spring",
                            stiffness: 300,
                        }}
                    >
                        <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
                        <span className="text-sm sm:text-lg font-semibold text-green-600 dark:text-green-400">
                            +{rankChange} מקומות
                        </span>
                    </motion.div>

                    <div className="flex flex-col items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">מיקום חדש</span>
                        <motion.span
                            className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.3,
                                type: "spring",
                                stiffness: 300,
                            }}
                        >
                            #{newRank}
                        </motion.span>
                    </div>
                </div>

                {/* Celebration particles */}
                {isAnimating && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                        {Array.from({ length: 12 }).map((_, i) => (
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
                                    x: `${50 + (Math.random() - 0.5) * 150}%`,
                                    y: `${50 + (Math.random() - 0.5) * 150}%`,
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 1.2,
                                    delay: i * 0.05,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

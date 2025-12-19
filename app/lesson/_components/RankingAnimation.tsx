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
}

export default function RankingAnimation({
    previousRank,
    newRank,
    totalUsers,
    className,
    onClose,
}: RankingAnimationProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasImproved, setHasImproved] = useState(false);
    const { userId } = useAuth();

    // Only show animation if ranking improved
    useEffect(() => {
        console.log("RankingAnimation - previousRank:", previousRank, "newRank:", newRank);
        if (previousRank !== null && newRank !== null && newRank < previousRank) {
            console.log("Ranking improved! Showing animation");
            setHasImproved(true);
            setIsAnimating(true);

            // Auto-close after 3 seconds
            const timer = setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 3000); // 3 seconds as requested

            return () => clearTimeout(timer);
        } else if (previousRank !== null && newRank !== null) {
            console.log("Ranking did not improve or stayed the same");
        }
    }, [previousRank, newRank, onClose]);

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={cn("w-full max-w-md mx-auto", className)}
        >
            <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.5,
                        }}
                    >
                        <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        עלית בדירוג! 🎉
                    </h3>
                </div>

                {/* Leaderboard Animation */}
                <div className="relative mb-6 min-h-[300px]">
                    <div className="space-y-2 relative">
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
                                            opacity: wasUserRank ? 1 : 0.4,
                                            y: getInitialY(),
                                            scale: wasUserRank ? 1.05 : 1,
                                        }}
                                        animate={{
                                            opacity: isUserRank ? 1 : isInRange ? 0.7 : 0.4,
                                            y: 0,
                                            scale: isUserRank ? 1.05 : 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                        }}
                                        transition={{
                                            layout: {
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 35,
                                                delay: wasUserRank ? 0.8 : 0,
                                            },
                                            opacity: {
                                                duration: 0.4,
                                                delay: wasUserRank ? 0.8 : 0.2,
                                            },
                                            scale: {
                                                duration: 0.3,
                                                delay: isUserRank ? 1.2 : 0,
                                            },
                                        }}
                                        className={cn(
                                            "items-center justify-center px-4 flex w-full p-3 rounded-xl transition-all relative z-10",
                                            isUserRank
                                                ? "bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-300 shadow-lg"
                                                : wasUserRank
                                                    ? "bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                                    : "bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                        )}
                                    >
                                        <motion.p
                                            className={cn(
                                                "font-bold mr-4 min-w-[2rem] text-center",
                                                isUserRank
                                                    ? "text-emerald-700 dark:text-emerald-300 text-lg"
                                                    : wasUserRank
                                                        ? "text-red-600 dark:text-red-400"
                                                        : "text-slate-700 dark:text-slate-200"
                                            )}
                                            initial={false}
                                            animate={{
                                                scale: isUserRank ? [1, 1.3, 1] : 1,
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                delay: isUserRank ? 1.2 : 0,
                                            }}
                                        >
                                            {rank}
                                        </motion.p>

                                        {isUserRank || wasUserRank ? (
                                            <>
                                                <motion.div
                                                    initial={false}
                                                    animate={{
                                                        scale: isUserRank ? [1, 1.1, 1] : 1,
                                                        rotate: isUserRank ? [0, 5, -5, 0] : 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.6,
                                                        delay: isUserRank ? 1.2 : 0,
                                                    }}
                                                >
                                                    <Avatar
                                                        className={cn(
                                                            "border h-10 w-10 mr-4",
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
                                                        "font-bold flex-1",
                                                        isUserRank
                                                            ? "text-emerald-800 dark:text-emerald-100 text-lg"
                                                            : "text-red-700 dark:text-red-300"
                                                    )}
                                                >
                                                    אתה
                                                    {isUserRank && (
                                                        <motion.span
                                                            className="ml-2 text-sm"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 1.4 }}
                                                        >
                                                            (עלית!)
                                                        </motion.span>
                                                    )}
                                                </p>
                                                <motion.div
                                                    className={cn(
                                                        "flex items-center gap-1",
                                                        isUserRank
                                                            ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                                                            : "text-red-600 dark:text-red-400"
                                                    )}
                                                    initial={false}
                                                    animate={{
                                                        scale: isUserRank ? [1, 1.1, 1] : 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.5,
                                                        delay: isUserRank ? 1.5 : 0,
                                                    }}
                                                >
                                                    <img
                                                        src="/stars.svg"
                                                        alt="נקודות"
                                                        width={20}
                                                        height={20}
                                                        className="inline-block"
                                                    />
                                                    <span>---</span>
                                                </motion.div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-10 w-10 mr-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                                                <p className="font-bold flex-1 text-neutral-600 dark:text-slate-400 text-sm">
                                                    משתמש אחר
                                                </p>
                                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                    <img
                                                        src="/stars.svg"
                                                        alt="נקודות"
                                                        width={16}
                                                        height={16}
                                                        className="inline-block opacity-50"
                                                    />
                                                    <span>---</span>
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
                <Separator className="mb-4" />
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-muted-foreground mb-1">מיקום קודם</span>
                        <motion.span
                            className="text-2xl font-bold text-red-600 dark:text-red-400"
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                        >
                            #{previousRank}
                        </motion.span>
                    </div>

                    <motion.div
                        className="flex items-center gap-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 1.5,
                        }}
                    >
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            +{rankChange} מקומות
                        </span>
                    </motion.div>

                    <div className="flex flex-col items-center">
                        <span className="text-sm text-muted-foreground mb-1">מיקום חדש</span>
                        <motion.span
                            className="text-2xl font-bold text-green-600 dark:text-green-400"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 1.2,
                            }}
                        >
                            #{newRank}
                        </motion.span>
                    </div>
                </div>

                {/* Celebration particles */}
                {isAnimating && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                initial={{
                                    x: "50%",
                                    y: "50%",
                                    opacity: 1,
                                    scale: 0,
                                }}
                                animate={{
                                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                                    opacity: [1, 1, 0],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: 1 + i * 0.1,
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

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingAnimationProps {
    previousRank: number | null;
    newRank: number | null;
    totalUsers: number;
    className?: string;
}

export default function RankingAnimation({
    previousRank,
    newRank,
    totalUsers,
    className,
}: RankingAnimationProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasImproved, setHasImproved] = useState(false);

    // Only show animation if ranking improved
    useEffect(() => {
        if (previousRank !== null && newRank !== null && newRank < previousRank) {
            setHasImproved(true);
            setIsAnimating(true);
        }
    }, [previousRank, newRank]);

    // Calculate position on chess board (8x8 grid representing ranking positions)
    const getChessPosition = (rank: number) => {
        if (rank <= 0 || totalUsers === 0) return { row: 7, col: 7 };
        
        // Map rank to chess board position (1-64 for top 64 ranks)
        // For ranks beyond 64, map them proportionally to the board
        const maxDisplayRank = Math.min(64, totalUsers);
        let normalizedRank = rank;
        
        if (rank > maxDisplayRank && totalUsers > maxDisplayRank) {
            // Map ranks beyond 64 proportionally to the last row
            const ratio = (rank - maxDisplayRank) / (totalUsers - maxDisplayRank);
            normalizedRank = maxDisplayRank + Math.floor(ratio * (64 - maxDisplayRank));
        }
        
        normalizedRank = Math.min(normalizedRank, 64);
        
        // Convert rank to 0-indexed position
        const position = Math.max(0, normalizedRank - 1);
        const row = Math.floor(position / 8);
        const col = position % 8;
        
        return { row, col };
    };

    const previousPos = previousRank ? getChessPosition(previousRank) : null;
    const newPos = newRank ? getChessPosition(newRank) : null;

    if (!hasImproved || previousRank === null || newRank === null) {
        return null;
    }

    const rankChange = previousRank - newRank;

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
                        עלית בדירוג!
                    </h3>
                </div>

                {/* Chess Board Visualization */}
                <div className="relative mb-6 w-full">
                    <div className="relative grid grid-cols-8 gap-1 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 p-2 rounded-lg border-2 border-amber-300 dark:border-amber-700" style={{ aspectRatio: "1" }}>
                        {Array.from({ length: 64 }).map((_, index) => {
                            const row = Math.floor(index / 8);
                            const col = index % 8;
                            const isLight = (row + col) % 2 === 0;
                            const isPreviousPos = previousPos && row === previousPos.row && col === previousPos.col;
                            const isNewPos = newPos && row === newPos.row && col === newPos.col;

                            return (
                                <motion.div
                                    key={index}
                                    className={cn(
                                        "aspect-square rounded-sm flex items-center justify-center text-xs font-bold transition-all",
                                        isLight
                                            ? "bg-amber-50 dark:bg-amber-900/30"
                                            : "bg-amber-200 dark:bg-amber-800/40",
                                        isPreviousPos && "ring-2 ring-red-400 dark:ring-red-500",
                                        isNewPos && "ring-2 ring-green-400 dark:ring-green-500"
                                    )}
                                    initial={false}
                                    animate={{
                                        scale: isNewPos ? [1, 1.2, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: isNewPos ? 1.2 : 0,
                                        repeat: isNewPos ? 1 : 0,
                                    }}
                                >
                                    {isPreviousPos && (
                                        <motion.div
                                            className="w-full h-full bg-red-400/30 dark:bg-red-500/30 rounded-sm"
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 0 }}
                                            transition={{ duration: 0.8, delay: 0.8 }}
                                        />
                                    )}
                                    {isNewPos && (
                                        <motion.div
                                            className="w-full h-full bg-green-400/50 dark:bg-green-500/50 rounded-sm flex items-center justify-center"
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 1,
                                                type: "spring",
                                                stiffness: 200,
                                            }}
                                        >
                                            <Trophy className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Animated user piece moving */}
                    {previousPos && newPos && (
                        <motion.div
                            className="absolute pointer-events-none z-10"
                            style={{
                                width: "calc(12.5% - 0.125rem)",
                                height: "calc(12.5% - 0.125rem)",
                                top: "0.5rem",
                                left: "0.5rem",
                            }}
                            initial={{
                                x: `${previousPos.col * (100 / 8)}%`,
                                y: `${previousPos.row * (100 / 8)}%`,
                            }}
                            animate={{
                                x: `${newPos.col * (100 / 8)}%`,
                                y: `${newPos.row * (100 / 8)}%`,
                            }}
                            transition={{
                                duration: 1.5,
                                delay: 0.8,
                                ease: [0.34, 1.56, 0.64, 1], // Custom easing for smooth, bouncy movement
                            }}
                        >
                            <motion.div
                                className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-gray-800"
                                initial={{ scale: 0.8 }}
                                animate={{
                                    scale: [0.8, 1.2, 1],
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: 0.8,
                                    ease: "easeOut",
                                }}
                            >
                                <TrendingUp className="w-4 h-4 text-white" />
                            </motion.div>
                        </motion.div>
                    )}
                </div>

                {/* Rank Display */}
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


"use client";

import { Check, Crown, Star } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LessonButtonProps {
    id: string,
    index: number,
    locked?: boolean,
    current?: boolean,
    rightQuestions: number | undefined
    totalQuestions: number | undefined
    totalCount: number | null | undefined,
}


const LessonButton = ({
    id,
    index,
    locked,
    current,
    rightQuestions,
    totalQuestions,
    totalCount
}: LessonButtonProps) => {
    const percentage = rightQuestions && totalQuestions ? (rightQuestions / totalQuestions) * 100 : 0;
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
    const href = isCompleted ? `/lesson/${id}` : `/lesson/${id}`;


    return (
        <Link href={href} aria-disabled={locked}
            style={{
                pointerEvents: locked ? "none" : "auto"
            }}
        >
            <div className="relative flex flex-col items-center"
                style={{
                    right: `${rightPosition}px`,
                    marginTop: isFirst && !isCompleted ? 60 : 24,
                }}
            >
                {current ? (
                    <div className="h-[102px] w-[102px]">
                        <div className="absolute -top-6 left-2.5 px-3 py-2.5
                border-2 font-bold uppercase text-green-500 bg-white rounded-xl
                animate-bounce tracking-wide z-10">
                            Start
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
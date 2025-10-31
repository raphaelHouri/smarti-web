
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

interface CardLessonProps {
    mode: "quiz" | "review" | "practiceMode";
    type: "REGULAR" | "SHAPES" | "COMPREHENSION" | "MATH";
    id: string;
    cardId: string;
    audioSrc?: string;
    numberIndex: string;
    text: string;
    selected?: boolean;
    onClick: () => void;
    disabled?: boolean;
    status?: "correct" | "wrong" | "none";
}

const CardLesson = ({
    mode,
    type,
    id,
    cardId,
    audioSrc,
    numberIndex,
    text,
    selected,
    onClick,
    disabled,
    status
}: CardLessonProps) => {
    const [audio, _, controls] = useAudio({ src: audioSrc || "" });

    const handleClick = useCallback(() => {
        if (disabled) return;
        controls.play();
        onClick();
    }, [disabled, onClick, controls]);

    useKey(numberIndex, handleClick, {}, [handleClick]);

    const isCorrectAnswer = (mode === "review" || mode === "practiceMode") && selected && cardId === "a";
    const isWrongAnswer = (mode === "review" || mode === "practiceMode") && selected && cardId !== "a";
    const isComprehensionType = type === "COMPREHENSION";
    const isShapesType = type === "SHAPES";

    return (
        <div
            onClick={handleClick}
            className={cn(
                "h-full border-2 border-b-4 rounded-xl hover:bg-black/5 p-4 lg:p-6 cursor-pointer active:border-b-2",
                selected && "dark:bg-sky-300 dark:text-black border-sky-300 bg-sky-100 hover:bg-sky-100",
                isCorrectAnswer && "dark:border-green-500 border-green-300 bg-green-100 dark:bg-green-200 hover:bg-green-100",
                isWrongAnswer && "dark:bg-rose-200 dark:hover:bg-rose-200 border-rose-300 bg-rose-100 hover:bg-rose-100",
                disabled && "pointer-events-none opacity-50",
                isComprehensionType && "lg:p-3 w-full",
                isShapesType && "flex flex-col items-center justify-center p-2 lg:p-4"
            )}
        >
            {audio}

            {isShapesType && text.startsWith("http") ? (
                <div className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full">
                    <Image
                        src={text}
                        fill
                        alt={text}
                        className="object-contain"
                    />
                </div>
            ) : (
                <div className={cn(
                    "flex items-center justify-between",
                    isComprehensionType && "flex flex-row-reverse"
                )}>
                    {isComprehensionType && <div />}

                    <p className={cn(
                        "text-neutral-600 dark:text-neutral-300 text-sm lg:text-base",
                        selected && "dark:text-black text-sky-500",
                        selected && status === "correct" && "text-green-500",
                        selected && status === "wrong" && "text-rose-500"
                    )}>
                        {text}
                    </p>

                    <div className={cn(
                        "lg:w-[30px] flex lg:h-[30px] w-[20px] h-[20px] items-center justify-center rounded-lg border-2 lg:text-[15px] text-xs font-semibold text-black dark:text-neutral-300",
                        selected && "dark:border-sky-400 dark:text-black border-sky-300 text-sky-500",
                        selected && status === "correct" && "dark:border-green-500 border-green-500 text-green-500",
                        selected && status === "wrong" && "dark:border-rose-500 border-rose-500 text-rose-500"
                    )}>
                        {numberIndex}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardLesson;
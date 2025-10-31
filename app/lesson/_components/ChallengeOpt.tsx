
import { cn, fnv1a, seededShuffle } from "@/lib/utils";
import CardLesson from "./CardLesson";
import { Options } from "./Quiz";
import { formatEnum, questions } from "@/db/schemaSmarti";
import { useMemo } from "react";

interface ChallengeProps {
    mode: "quiz" | "review" | "practiceMode";
    options: Options;
    questionDetails: typeof questions.$inferSelect;
    onSelect: (option: "a" | "b" | "c" | "d") => void;
    disabled?: boolean;
    status: "correct" | "wrong" | "none";
    selectedOption?: "a" | "b" | "c" | "d" | null;
}

const Challenge = ({
    mode,
    options,
    questionDetails,
    onSelect,
    disabled,
    status,
    selectedOption
}: ChallengeProps) => {

    const shuffledOptions = useMemo(() => {
        // The seed is derived from the question id + the options’ content
        // so it is stable for the same question, but different across questions.
        const seed = fnv1a(
            String(questionDetails.id) + "::" + JSON.stringify(options)
        );
        return seededShuffle(Object.entries(options), seed); // [ [key, value], ... ]
    }, [questionDetails.id, options]);

    return (
        <div>

        <div className=
            {cn("grid gap-2",
                questionDetails.format === "COMPREHENSION" && "grid-cols-1",
                questionDetails.format in ["REGULAR", "MATH"] && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
                questionDetails.format === "SHAPES" && "grid-cols-2 lg:grid-cols-4"
            )}
        >
            {shuffledOptions.map(([key, value], index) => (
                <CardLesson
                    mode={mode}
                    type={questionDetails.format}
                    key={key}
                    cardId={key}
                    id={questionDetails.id + key}
                    // imageSrc={'/girl.svg'}
                    audioSrc={'/es_girl.mp3'}
                    numberIndex={`${index + 1}`}
                    text={value}
                    selected={selectedOption ? selectedOption === key : false}
                    onClick={() => onSelect(key as "a" | "b" | "c" | "d")}
                    disabled={disabled}
                    status={status}
                />
            ))}

        </div>
        {((mode === "review" || (mode === "practiceMode" && selectedOption))) && questionDetails.explanation && (
                <div className="col-span-full mt-8 px-8 py-8 flex gap-5 items-start rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/80 dark:to-emerald-950/60 shadow-md">
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-800 border border-emerald-200 dark:border-emerald-700 mr-2 mt-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="lucide lucide-lightbulb w-10 h-10 text-emerald-400 dark:text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M9 18h6m-3 0v3M14 14a5 5 0 1 0-4 0" />
                            <path d="M12 2a7 7 0 0 0-7 7c0 2.808 1.875 5.167 4.496 6.23A2.997 2.997 0 0 0 12 21a2.997 2.997 0 0 0 2.504-5.77C17.125 14.167 19 11.808 19 9a7 7 0 0 0-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-100 text-lg">
                                הסבר שאלה
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="lucide lucide-info w-5 h-5 text-emerald-400 dark:text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        </div>
                        <p className="text-emerald-900 dark:text-emerald-100 text-base leading-relaxed">
                            {questionDetails.explanation}
                        </p>
                    </div>
                </div>
            )}
                </div>
    )
}
export default Challenge;
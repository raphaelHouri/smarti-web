import { challenges, challengesOptions } from "@/db/schema"
import { cn, fnv1a, seededShuffle } from "@/lib/utils";
import CardLesson from "./CardLesson";
import { Options } from "./Quiz";
import { formatEnum, questions } from "@/db/schemaSmarti";
import { useMemo } from "react";

interface ChallengeProps {
    mode: "quiz" | "review";
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
        <div className=
            {cn("grid gap-2",
                questionDetails.format === "ASSIST" && "grid-cols-1",
                questionDetails.format === "SELECT" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
            )}
        >
            {shuffledOptions.map(([key, value], index) => (
                <CardLesson
                    mode={mode}
                    type={questionDetails.format}
                    key={key}
                    cardId={key}
                    id={questionDetails.id + key}
                    imageSrc={'/girl.svg'}
                    audioSrc={'/es_girl.mp3'}
                    shortcut={`${index + 1}`}
                    text={value}
                    selected={selectedOption ? selectedOption === key : false}
                    onClick={() => onSelect(key as "a" | "b" | "c" | "d")}
                    disabled={disabled}
                    status={status}
                />
            ))}
        </div>
    )
}
export default Challenge;
import { challenges, challengesOptions } from "@/db/schema"
import { cn } from "@/lib/utils";
import CardLesson from "./CardLesson";
import { Options } from "./Quiz";
import { formatEnum, questions } from "@/db/schemaSmarti";

interface ChallengeProps {
    options: Options;
    questionDetails: typeof questions.$inferSelect;
    onSelect: (option: "a" | "b" | "c" | "d") => void;
    disabled?: boolean;
    status: "correct" | "wrong" | "none";
    selectedOption?: "a" | "b" | "c" | "d";
}

const Challenge = ({
    options,
    questionDetails,
    onSelect,
    disabled,
    status,
    selectedOption
}: ChallengeProps) => {
    return (
        <div className=
            {cn("grid gap-2",
                questionDetails.format === "ASSIST" && "grid-cols-1",
                questionDetails.format === "SELECT" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
            )}
        >
            {Object.entries(options).map(([key, value], index) => (
                <CardLesson
                    type={questionDetails.format}
                    key={key}
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
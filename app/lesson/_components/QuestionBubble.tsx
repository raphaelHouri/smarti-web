import Image from "next/image";
import { renderTextWithLTRFormulas } from "@/lib/utils";

interface QuestionBubbleProps {
    format: "REGULAR" | "SHAPES" | "COMPREHENSION" | "MATH";
    question: string
}

// Minimal MathJax placeholder to avoid runtime errors.
// If rendering LaTeX is needed, swap this for a real math renderer.
const MathJax = ({ question }: { question: string }) => {
    return <span>{question}</span>;
}


const QuestionBubble = ({
    format,
    question
}: QuestionBubbleProps) => {
    return (
        <div className="flex items-center gap-x-4 mb-6">
            <Image
                src="/mascot.svg"
                alt="Mascot"
                height={60}
                width={60}
                className="hidden lg:block"
            />
            <Image
                src="/mascot.svg"
                alt="Mascot"
                height={40}
                width={40}
                className="block lg:hidden"
            />
            <div className="relative py-2 border-2 px-4 rounded-xl text-md   lg:text-lg font-medium">
                {format === "MATH" ? renderTextWithLTRFormulas(question) : question}
                <div
                    className="absolute -right-3 top-1/2 w-0 h-0 hover:animate-pulse cursor-pointer
        border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-270"
                />
            </div>
        </div>
    );
}

export default QuestionBubble;
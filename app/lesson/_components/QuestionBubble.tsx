import Image from "next/image";

interface QuestionBubbleProps {
    format: "REGULAR" | "SHAPES" | "COMPREHENSION" | "MATH";
    question: string
}

// Minimal MathJax placeholder to avoid runtime errors.
// If rendering LaTeX is needed, swap this for a real math renderer.
const MathJax = ({ question }: { question: string }) => {
    return <span>{question}</span>;
}

function renderWithLTRFormulas(text: string) {
    const parts = text.split(/\$/);
    return parts.map((part, index) => {
        const key = `p-${index}`;
        if (index % 2 === 1) {
            return (
                <span key={key} dir="ltr" className="inline-block whitespace-nowrap font-mono">
                    {part}
                </span>
            );
        }
        return <span key={key}>{part}</span>;
    });
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
            <div className="relative py-2 border-2 px-4 rounded-xl text-sm lg:text-base">
                {format === "MATH" ? renderWithLTRFormulas(question) : question}
                <div
                    className="absolute -left-3 top-1/2 w-0 h-0 hover:animate-pulse cursor-pointer
        border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90"
                />
            </div>
        </div>
    );
}

export default QuestionBubble;
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    CircleX,
    ChevronLeft,
    ChevronRight,
    EyeIcon,
    RotateCcwIcon,

} from "lucide-react";
import { useRouter } from "next/navigation";
import { useKey, useMedia } from "react-use";

interface FooterProps {
    mode: "quiz" | "review" | "summary" | "practiceMode";
    disabled?: boolean;
    status: "correct" | "wrong" | "none" | "completed";
    onCheck: () => void;        // primary action when status === "none" (e.g., Check)
    onNext?: () => void;        // go to next / finish when status !== "none"
    onPrev?: () => void;        // go to previous
    handleWatchAgain?: () => void;
    handlePracticeAgain?: () => void;
    activeIndex?: number;       // current question index (0-based)
    total?: number;             // total questions
}

const Footer = ({
    mode,
    disabled,
    status,
    onCheck,
    onNext,
    onPrev,
    handleWatchAgain,
    handlePracticeAgain,
    activeIndex,
    total,
}: FooterProps) => {
    const router = useRouter();
    const isMobile = useMedia("(max-width:1024px)");

    // Primary button decides action by status
    const handlePrimary = () => {
        if (status === "correct" || mode === "review") {
            onNext?.();
        } else if (status === "wrong") {
            // Keep "Retry" semantics as "re-check" (parent can clear state or re-validate)
            onCheck();
        } else {
            onCheck();
        }
    };

    // Keyboard: Enter = primary; ← = prev; → = primary (Next/Finish or Check)
    useKey("Enter", handlePrimary, {}, [status, onCheck, onNext]);
    useKey("ArrowLeft", () => mode !== "practiceMode" ? onPrev?.() : undefined, {}, [onPrev]);
    useKey("ArrowRight", handlePrimary, {}, [status, onCheck, onNext]);

    const showNav = typeof activeIndex === "number" && typeof total === "number";

    const primaryLabel =
        status === "none" && mode !== "review"
            ? "בדוק"
            : status === "wrong"
                ? "נסו שוב"
                : mode === "review"
                    ? activeIndex !== undefined && total !== undefined && activeIndex === total - 1 ? "חזרה לדף הסיכום" : "המשך"
                    : activeIndex !== undefined && total !== undefined && activeIndex === total - 1
                        ? "סיום"
                        : "הבא";

    return (
        <footer
            className={cn(
                "lg:h-[120px] h-[100px] border-t-2",
                mode === "summary" && "h-[240px]",
                status === "correct" && "border-transparent bg-green-100",
                status === "wrong" && "border-transparent bg-rose-100"
            )}
        >
            <div className="max-w-[1040px] h-full mx-auto flex items-center justify-between px-6 lg:px-10 gap-1.5 lg:gap-3 py-2 lg:py-0">
                {/* Left: Status message OR "Practice Again" when completed */}
                <div className="min-w-0">
                    {status === "correct" && (
                        <div className="text-green-600 text-base font-bold lg:text-2xl flex items-center">
                            <CheckCircle2 className="h-6 w-6 lg:h-10 lg:w-10 mr-3" />
                            כל הכבוד! 🤩
                        </div>
                    )}
                    {status === "wrong" && (
                        <div className="text-rose-600 text-base font-bold lg:text-2xl flex items-center">
                            <CircleX className="h-6 w-6 lg:h-10 lg:w-10 mr-3" />
                            אופס! תשובה שגויה. נסו שוב 😟
                        </div>
                    )}
                </div>
                {mode === "summary" ? (
                    <div className="w-full flex flex-col lg:flex-row items-center gap-4 lg:gap-6 sm:justify-evenly justify-between">
                        {/* <Button
                            variant="default"
                            size={isMobile ? "sm" : "lg"}
                            onClick={handlePracticeAgain}
                            className="w-full lg:w-auto"
                        >
                            <RotateCcwIcon className="h-4 w-4 lg:h-6 lg:w-10 ml-2" />
                            תרגול מחדש                        </Button> */}
                        <Button
                            variant="default"
                            size={isMobile ? "sm" : "lg"}
                            onClick={handleWatchAgain}
                            className="w-full lg:w-auto flex items-center justify-center"
                        >
                            <EyeIcon className="h-4 w-4 lg:h-6 lg:w-10 mr-2" />
                            צפייה בתשובות
                        </Button>
                        <Button
                            className="w-full lg:w-auto"
                            onClick={() => router.back()}
                            size={isMobile ? "sm" : "lg"}
                            variant="secondary"
                        >
                            חזרה לתרגולים
                        </Button>
                    </div>

                ) : null}



                {/* Center: Navigation (Prev / counter / Next) */}
                {showNav && (mode === "quiz" || mode == "review") && (
                    <div className="w-full flex items-center gap-2 sm:gap-3 md:grid md:grid-cols-3 md:items-center md:gap-0">
                        <Button
                            variant="ghost"
                            size={isMobile ? "sm" : "lg"}
                            onClick={onPrev}
                            disabled={!onPrev || (activeIndex as number) <= 0}
                            className="whitespace-nowrap"
                        >
                            <ChevronRight className="h-4 w-4 ml-2" />

                            הקודם
                        </Button>

                        <div className="px-2 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 select-none text-center mx-auto md:justify-self-center md:col-start-2">
                            שאלה{" "}
                            {total} /{" "}
                            <span className="font-semibold">
                                {(activeIndex as number) + 1}
                            </span>
                        </div>
                        {(typeof total === "number" && activeIndex == total - 1) ? (
                            <Button
                                disabled={disabled}
                                className="ml-auto"
                                onClick={handlePrimary}
                                size={isMobile ? "sm" : "lg"}
                                variant={status === "wrong" ? "danger" : "secondary"}
                            >
                                {primaryLabel}
                            </Button>
                        ) : <Button
                            variant="ghost"
                            size={isMobile ? "sm" : "lg"}
                            onClick={onNext}
                            disabled={!onNext}
                            className="whitespace-nowrap"
                        >
                            {activeIndex !== undefined && total !== undefined && activeIndex === total - 1
                                ? "לסיום"
                                : "הבא"}
                            <ChevronLeft className="h-4 w-4 mr-2" />
                        </Button>}

                    </div>
                )}
                {/* Center: Navigation (Prev / counter / Next) */}
                {showNav && (mode === "practiceMode") && (
                    <div className="w-full flex items-center gap-2 sm:gap-3 md:grid md:grid-cols-3 md:items-center md:gap-0">
                        <Button
                            variant="secondary"
                            size={isMobile ? "sm" : "lg"}
                            onClick={onPrev}
                        >
                            {isMobile ? "הסירו מרשימה" : "הסירו שאלה מרשימת התרגול החוזר"}
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                        </Button>

                        <div className="px-2 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 select-none text-center mx-auto md:justify-self-center md:col-start-2">
                            שאלה{" "}
                            {total} /{" "}
                            <span className="font-semibold">
                                {(activeIndex as number) + 1}
                            </span>
                        </div>
                        {(typeof total === "number" && activeIndex == total - 1) ? (
                            <Button
                                disabled={disabled}
                                className="ml-auto"
                                onClick={handlePrimary}
                                size={isMobile ? "sm" : "lg"}
                                variant={status === "wrong" ? "danger" : "secondary"}
                            >
                                {primaryLabel}
                            </Button>
                        ) : <Button
                            variant="ghost"
                            size={isMobile ? "sm" : "lg"}
                            onClick={onNext}
                            disabled={!onNext}
                            className="whitespace-nowrap"
                        >
                            {activeIndex !== undefined && total !== undefined && activeIndex === total - 1
                                ? "לסיום"
                                : "הבא"}
                            <ChevronLeft className="h-4 w-4 mr-2" />
                        </Button>}

                    </div>
                )}

                {/* Right: Primary CTA (Check / Retry / Next / Finish / Continue) */}

            </div>
        </footer>
    );
};

export default Footer;

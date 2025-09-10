import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    CircleX,
    ChevronLeft,
    ChevronRight,
    EyeIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useKey, useMedia } from "react-use";

interface FooterProps {
    disabled?: boolean;
    status: "correct" | "wrong" | "none" | "completed";
    onCheck: () => void;        // primary action when status === "none" (e.g., Check)
    onNext?: () => void;        // go to next / finish when status !== "none"
    onPrev?: () => void;        // go to previous
    handleWatchAgain?: () => void;
    activeIndex?: number;       // current question index (0-based)
    total?: number;             // total questions
    lessonId?: string;
}

const Footer = ({
    disabled,
    status,
    onCheck,
    onNext,
    onPrev,
    handleWatchAgain,
    activeIndex,
    total,
    lessonId,
}: FooterProps) => {
    const router = useRouter();
    const isMobile = useMedia("(max-width:1024px)");

    // Primary button decides action by status
    const handlePrimary = () => {
        if (status === "correct" || status === "completed") {
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
    useKey("ArrowLeft", () => onPrev?.(), {}, [onPrev]);
    useKey("ArrowRight", handlePrimary, {}, [status, onCheck, onNext]);

    const showNav = typeof activeIndex === "number" && typeof total === "number";

    const primaryLabel =
        status === "none"
            ? "Finish"
            : status === "wrong"
                ? "Retry"
                : status === "completed"
                    ? "Continue"
                    : activeIndex !== undefined && total !== undefined && activeIndex === total - 1
                        ? "Finish"
                        : "Next";

    return (
        <footer
            className={cn(
                "lg:h-[120px] h-[100px] border-t-2",
                status === "correct" && "border-transparent bg-green-100",
                status === "wrong" && "border-transparent bg-rose-100"
            )}
        >
            <div className="max-w-[1040px] h-full mx-auto flex items-center justify-between px-6 lg:px-10 gap-3">
                {/* Left: Status message OR "Practice Again" when completed */}
                <div className="min-w-0">
                    {status === "correct" && (
                        <div className="text-green-600 text-base font-bold lg:text-2xl flex items-center">
                            <CheckCircle2 className="h-6 w-6 lg:h-10 lg:w-10 mr-3" />
                            Nicely Done! 🤩
                        </div>
                    )}
                    {status === "wrong" && (
                        <div className="text-rose-600 text-base font-bold lg:text-2xl flex items-center">
                            <CircleX className="h-6 w-6 lg:h-10 lg:w-10 mr-3" />
                            Oops! Wrong answer. Please retry 😟
                        </div>
                    )}
                    {status === "completed" && (
                        // if you like to watch it again open modal that said are you sure your answers can delete 
                        <Button
                            variant="default"
                            size={isMobile ? "sm" : "lg"}
                            onClick={() => (window.location.href = `/lesson/${lessonId}`)}
                        >
                            Practice Again
                        </Button>

                    )}
                    {status === "completed" && (
                        <Button
                            variant="default"
                            size={isMobile ? "sm" : "lg"}
                            onClick={handleWatchAgain}
                        >
                            <EyeIcon className="h-6 w-6 lg:h-10 lg:w-10 mr-3" />
                            לצפייה בתרגול
                        </Button>

                    )}

                    {status === "completed" && (

                        <Button

                            className="ml-auto"
                            onClick={() => router.back()}
                            size={isMobile ? "sm" : "lg"}
                            variant="secondary"
                        >

                            {status === "completed" && "Continue"}
                        </Button>

                    )}
                </div>

                {/* Center: Navigation (Prev / counter / Next) */}
                {showNav && status !== "completed" && (
                    <div className="w-full flex items-center gap-2 sm:gap-3 md:grid md:grid-cols-3 md:items-center md:gap-0">
                        <Button
                            variant="ghost"
                            size={isMobile ? "sm" : "lg"}
                            onClick={onPrev}
                            disabled={!onPrev || (activeIndex as number) <= 0}
                            className="whitespace-nowrap"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>

                        <div className="px-2 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 select-none text-center mx-auto md:justify-self-center md:col-start-2">
                            Question{" "}
                            <span className="font-semibold">
                                {(activeIndex as number) + 1}
                            </span>{" "}
                            / {total}
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
                                ? "Finish"
                                : "Next"}
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>}

                    </div>
                )}

                {/* Right: Primary CTA (Check / Retry / Next / Finish / Continue) */}

            </div>
        </footer>
    );
};

export default Footer;

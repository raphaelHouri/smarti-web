"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { useFinishLessonModal } from "@/store/use-finish-lesson-modal";
import { useCountdownStore } from "@/store/use-countdown-timer";
import { toast } from "sonner";

const FinishLessonModal = () => {
    const [isClient, setIsClient] = useState<boolean>(false)
    const { isOpen, close, approve, hasUnansweredQuestions } = useFinishLessonModal();
    const { isRunning } = useCountdownStore();

    //Doing this to avoid hydration errors
    useEffect(() => {
        setIsClient(true);
    }, [])
    if (!isClient) {
        return null;
    }

    //  isOpen and close are states from zustand
    return (
        <Dialog open={isOpen} onOpenChange={!isRunning ? () => toast.info("Time's up! Press to continue!") : close} >
            <DialogContent className="max-w-md mx-auto" removeX={!isRunning}>
                <DialogHeader>
                    <div className="items-center justify-center flex w-full mb-5">
                        <Image
                            src="/mascot.svg"
                            alt="Mascot"
                            height={80}
                            width={80}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl">
                        {isRunning ? "סיום תרגול" : "זמן התרגול הסתיים"}
                    </DialogTitle>
                    {isRunning ? (
                        <DialogDescription className="text-center text-base">
                            האם אתם בטוחים שברצונכם לסיים את התרגול?
                        </DialogDescription>
                    ) : <DialogDescription className="text-center text-base">
                        המשך לסיכום התרגול כדי לראות את התוצאות שלך!
                    </DialogDescription>}
                    {isRunning && hasUnansweredQuestions && (
                        <div className="mt-4 space-y-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200 text-center font-semibold">
                                    💡 יש לכם עוד שאלות שלא סומנו
                                </p>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
                                <p className="text-sm text-amber-800 dark:text-amber-200 text-center font-medium">
                                    💡 טיפ חשוב: בסוף המבחן חשוב לסמן גם שאלות שאינכם יודעים או לא הספקתם. ישנו סיכוי שהמזל ישחק לטובתכם!
                                </p>
                            </div>
                        </div>
                    )}
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-y-3 w-full">
                        {isRunning ? (
                            <>
                                <Button
                                    variant="primary"
                                    size="default"
                                    className="w-full"
                                    onClick={close}
                                >
                                    המשך לתרגל
                                </Button>
                                <Button
                                    variant="dangerOutline"
                                    size="default"
                                    className="w-full"
                                    onClick={() => {
                                        close();
                                        approve();
                                    }}
                                >
                                    לסיום תרגול
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                size="default"
                                className="w-full"
                                onClick={() => {
                                    close();
                                    approve();
                                }}
                            >
                                המשך לסיכום
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default FinishLessonModal;
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
    const { isOpen, close, approve } = useFinishLessonModal();
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
                            src="mascot_sad.svg"
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
                            האם אתה בטוח שברצונך לסיים את התרגול?
                        </DialogDescription>
                    ) : <DialogDescription className="text-center text-base">
                        המשך לסיכום התרגול כדי לראות את התוצאות שלך!
                    </DialogDescription>}
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
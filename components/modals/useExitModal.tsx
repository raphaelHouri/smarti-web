"use client";
import { useExitModal } from "@/store/use-exit-modal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import Image from "next/image";
import { Button } from "../ui/button";

const ExitModal = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState<boolean>(false)
    const { isOpen, close, hasUnansweredQuestions } = useExitModal();

    //Doing this to avoid hydration errors
    useEffect(() => {
        setIsClient(true);
    }, [])
    if (!isClient) {
        return null;
    }

    //  isOpen and close are states from zustand
    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md mx-auto" dir="rtl">
                <DialogHeader>
                    <div className="items-center justify-center flex w-full mb-5">
                        <Image
                            src="/mascot_sad.svg"
                            alt="Mascot"
                            height={80}
                            width={80}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl">
                        סיים תרגול
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        אתם עומדים לעזוב את התרגול. האם אתם בטוחים?
                    </DialogDescription>
                    {hasUnansweredQuestions && (
                        <div className="mt-4 space-y-3">
                            <div className="p-3 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-200 text-center font-semibold">
                                    ⚠️ שימו לב: לא כל התשובות סומנו
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
                        <Button variant="primary" size="default" className="w-full"
                            onClick={close}>
                            המשיכו לתרגל
                        </Button>
                        <Button variant="dangerOutline" size="default" className="w-full"
                            onClick={() => {
                                close();
                                router.push("/learn")
                            }}>
                            סיום התרגול
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ExitModal;
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
    const { isOpen, close } = useExitModal();

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
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200 text-center font-medium">
                            ⚠️ שימו לב: תשובותיכם לא ישמרו
                        </p>
                    </div>
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
"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { useFinishLessonModal } from "@/store/use-finish-lesson-modal";

const FinishLessonModal = () => {
    const [isClient, setIsClient] = useState<boolean>(false)
    const { isOpen, close, approve } = useFinishLessonModal();

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
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <div className="items-center justify-center flex w-full mb-5">
                        <Image
                            src="mascot_sad.svg"
                            alt="Mascot"
                            height={80}
                            width={80}
                        />
                    </div>
                    <DialogTitle className="text-center
                font-bold text-2xl">
                        סיום תרגול
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        האם אתה בטוח שברצונך לסיים את התרגול?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-y-3 w-full">
                        <Button variant="primary" size="default" className="w-full"
                            onClick={close}>
                            המשך לתרגל
                        </Button>
                        <Button variant="dangerOutline" size="default" className="w-full"
                            onClick={() => {
                                close();
                                approve()
                            }}>
                            לסיום תרגול
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default FinishLessonModal;
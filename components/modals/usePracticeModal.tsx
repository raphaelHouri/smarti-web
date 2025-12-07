"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { usePracticeModal } from "@/store/use-practice-modal";
import { useRouter } from "next/navigation";

const PracticeModal = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState<boolean>(false)
    const { isOpen, close, open } = usePracticeModal();

    //Doing this to avoid hydration errors
    // mounting the component
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
                            src="/heart.svg"
                            alt="Heart"
                            height={80}
                            width={80}
                        />
                        <Image
                            src="/points.svg"
                            alt="Point"
                            height={80}
                            width={80}
                        />
                    </div>
                    <DialogTitle className="text-center
                font-bold text-2xl">
                        כל הכבוד על התרגול!
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        תמשיכו לצבור נקודות ולהתקדם. השתמשו בשיעור לשפר את הידע שלכם.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-y-3 w-full">
                        <Button variant="primary" size="default" className="w-full"
                            onClick={() => {
                                close()
                                router.push("/practice")
                            }}>
                             המשך
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default PracticeModal;
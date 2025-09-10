"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRegisterModal } from "@/store/use-register-modal";
import { useAuth, useClerk } from "@clerk/nextjs";

const RegisterModal = () => {
    const [isClient, setIsClient] = useState<boolean>(false)
    const { isOpen, close } = useRegisterModal();
    const { openSignUp } = useClerk();
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
                        הרשמה למערכת
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        האם תרצה להירשם מערכת כדי לקבל גישה לכל התכנים?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-y-3 w-full">
                        <Button variant="primary" size="default" className="w-full"
                            onClick={() => {
                                openSignUp()
                                close()
                            }}>
                            המשך להרשמה
                        </Button>
                        <Button variant="dangerOutline" size="default" className="w-full"
                            onClick={() => {
                                close();

                            }}>
                            המשך בלי הרשמה
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default RegisterModal;
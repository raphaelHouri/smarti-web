"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { usePremiumModal } from "@/store/use-premium-modal";
import { useRouter } from "next/navigation";

const PremiumModal = () => {
    const [isClient, setIsClient] = useState<boolean>(false);
    const { isOpen, close } = usePremiumModal();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, [])

    if (!isClient) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md mx-auto">
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
                        שיעור פרימיום
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        תוכן זה זמין למנויים. תרצה לעבור לחנות לרכישה?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-y-3 w-full">
                        <Button
                            variant="primary"
                            size="default"
                            className="w-full"
                            onClick={() => {
                                close();
                                router.push("/shop");
                            }}
                        >
                            מעבר לחנות
                        </Button>
                        <Button
                            variant="dangerOutline"
                            size="default"
                            className="w-full"
                            onClick={() => {
                                close();
                            }}
                        >
                            ביטול
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default PremiumModal;


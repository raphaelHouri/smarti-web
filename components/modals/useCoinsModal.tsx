"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { useCoinsModal } from "@/store/use-coins";

const CoinsModal = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState<boolean>(false)
    const { isOpen, close, open } = useCoinsModal();

    //Doing this to avoid hydration errors
    // mounting the component
    useEffect(() => {
        setIsClient(true);
    }, [])

    const onClick = () => {
        close();
        router.push("/store");
    }

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
                            src="/mascot_bad.svg"
                            alt="Mascot"
                            height={80}
                            width={80}
                        />
                    </div>
                    <DialogTitle className="text-center
                font-bold text-2xl">
                        You ran out of coins.
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Get Pro for unlimited coins, or purchase them in the store.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-y-3 w-full">
                        <Button variant="primary" size="default" className="w-full"
                            onClick={onClick}>
                            Get Unlimited Coins
                        </Button>
                        <Button variant="primaryOutline" size="default" className="w-full"
                            onClick={close}>
                            No Thanks
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CoinsModal;


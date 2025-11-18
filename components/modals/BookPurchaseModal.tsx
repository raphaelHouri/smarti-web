"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import { Button } from "../ui/button";
import { useBookPurchaseModal } from "@/store/use-book-purchase-modal";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { getUserCoupon } from "@/actions/user-coupon";

export default function BookPurchaseModal() {
    const { isOpen, close, planId } = useBookPurchaseModal();
    const { userId } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const [studentName, setStudentName] = useState("");
    const [email, setEmail] = useState("");
    const [savedCoupon, setSavedCoupon] = useState<{ code: string } | null>(null);
    const effectivePlanId = planId ?? "book";

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load saved coupon when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            getUserCoupon()
                .then(result => {
                    if (result.coupon) {
                        setSavedCoupon(result.coupon);
                    } else {
                        setSavedCoupon(null);
                    }
                })
                .catch(err => {
                    console.error("Failed to load coupon:", err);
                    setSavedCoupon(null);
                });
        }
    }, [isOpen, userId]);

    useEffect(() => {
        if (!isOpen) {
            setStudentName("");
            setEmail("");
        }
    }, [isOpen]);

    if (!isClient) return null;

    const handleSubmit = () => {
        if (!studentName.trim()) return;
        if (!email.trim()) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return;

        const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
        const couponParam = savedCoupon ? `&CouponCode=${encodeURIComponent(savedCoupon.code)}` : "";
        const url = `${base}/api/pay?StudentName=${encodeURIComponent(studentName)}&Email=${encodeURIComponent(email)}&PlanId=${encodeURIComponent(effectivePlanId)}&bookIncluded=True${couponParam}`;
        close();
        window.open(url, "_self");
    };

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md mx-auto">
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
                        פרטים להשלמת הרכישה
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        הזינו את הפרטים לשליחת החוברת במייל
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            שם התלמיד/ה (יופיע על החוברת)
                        </label>
                        <input
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            placeholder="הזינו את שם התלמיד/ה"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            אימייל לשליחת העתק של החוברת
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            placeholder="your@email.com"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button variant="primary" size="default" className="w-full" onClick={handleSubmit}>
                            המשך לתשלום
                        </Button>

                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}



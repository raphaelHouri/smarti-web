"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/_dialog";
import { Button } from "../ui/button";
import { useCouponModal } from "@/store/use-coupon-modal";
import { useAuth } from "@clerk/nextjs";
import { Loader2, CheckCircle2, XCircle, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserCoupon, validateAndSaveCoupon, removeUserCoupon, validateCouponCode } from "@/actions/user-coupon";

type Coupon = {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    validFrom: Date | string;
    validUntil: Date | string;
    isActive: boolean;
    maxUses: number;
    planId: string;
};

export default function CouponModal() {
    const { isOpen, close } = useCouponModal();
    const { userId } = useAuth();
    const [couponCode, setCouponCode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{ valid: boolean; coupon: Coupon | null; error?: string } | null>(null);
    const [savedCoupon, setSavedCoupon] = useState<Coupon | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load saved coupon when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            loadSavedCoupon();
        }
    }, [isOpen, userId]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCouponCode("");
            setValidationResult(null);
        }
    }, [isOpen]);

    const loadSavedCoupon = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const result = await getUserCoupon();
            if (result.coupon) {
                setSavedCoupon(result.coupon);
            } else {
                setSavedCoupon(null);
            }
        } catch (error) {
            console.error("Failed to load saved coupon:", error);
            setSavedCoupon(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsValidating(true);
        setValidationResult(null);

        try {
            const result = await validateCouponCode(couponCode.trim());
            setValidationResult(result);
        } catch (error) {
            setValidationResult({
                valid: false,
                coupon: null,
                error: "שגיאה באימות הקופון"
            });
        } finally {
            setIsValidating(false);
        }
    };

    const saveCoupon = async () => {
        if (!userId || !validationResult?.valid || !validationResult.coupon) return;

        setIsSaving(true);
        try {
            const result = await validateAndSaveCoupon(validationResult.coupon.code);

            if (result.success && result.coupon) {
                setSavedCoupon(result.coupon);
                setCouponCode("");
                setValidationResult(null);
            } else {
                setValidationResult({
                    valid: false,
                    coupon: validationResult.coupon,
                    error: result.error || "שגיאה בשמירת הקופון"
                });
            }
        } catch (error) {
            setValidationResult({
                valid: false,
                coupon: validationResult.coupon,
                error: "שגיאה בשמירת הקופון"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const removeCoupon = async () => {
        if (!userId) return;

        setIsSaving(true);
        try {
            await removeUserCoupon();
            setSavedCoupon(null);
        } catch (error) {
            console.error("Failed to remove coupon:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDiscount = (coupon: Coupon) => {
        if (coupon.type === "percentage") {
            return `${coupon.value}%`;
        } else {
            return `₪${coupon.value}`;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <div className="items-center justify-center flex w-full mb-5">
                        <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <Tag className="w-10 h-10 text-white" />
                            <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1" />
                        </div>
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl">
                        קופון הנחה
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        הזינו קוד קופון לקבלת הנחה על הרכישה
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-y-4">
                    {/* Saved Coupon Display */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                        </div>
                    ) : savedCoupon ? (
                        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-lg text-green-800 dark:text-green-200">
                                        קופון שמור
                                    </span>
                                </div>
                                <Button
                                    variant="dangerOutline"
                                    size="sm"
                                    onClick={removeCoupon}
                                    disabled={isSaving}
                                    className="text-xs"
                                >
                                    הסר
                                </Button>
                            </div>
                            <div className="space-y-2 bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">קוד קופון:</span>
                                    <span className="font-mono font-bold text-xl text-gray-900 dark:text-white tracking-wider">
                                        {savedCoupon.code}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">הנחה:</span>
                                    <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                                        {formatDiscount(savedCoupon)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Coupon Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            הזינו קוד קופון
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleValidateCoupon();
                                    }
                                }}
                                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-800 dark:text-white font-mono text-lg tracking-wider text-center"
                                placeholder="XXXX-XXXX"
                                disabled={isValidating || isSaving}
                            />
                            <Button
                                onClick={handleValidateCoupon}
                                disabled={!couponCode.trim() || isValidating || isSaving}
                                variant="secondary"
                                size="default"
                                className="px-6"
                            >
                                {isValidating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "בדוק"
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Validation Result */}
                    {validationResult && (
                        <div
                            className={cn(
                                "p-4 rounded-xl border-2",
                                validationResult.valid
                                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700"
                                    : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    validationResult.valid ? "bg-green-500" : "bg-red-500"
                                )}>
                                    {validationResult.valid ? (
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    {validationResult.valid && validationResult.coupon ? (
                                        <div className="space-y-3">
                                            <div className="font-bold text-lg text-green-800 dark:text-green-200">
                                                קופון תקף! 🎉
                                            </div>
                                            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">קוד:</span>
                                                    <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                                                        {validationResult.coupon.code}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">הנחה:</span>
                                                    <span className="font-bold text-xl text-green-600 dark:text-green-400">
                                                        {formatDiscount(validationResult.coupon)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="font-medium text-red-800 dark:text-red-200">
                                            {validationResult.error || "קופון לא תקף"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save/Replace Button */}
                    {validationResult?.valid && validationResult.coupon && (
                        (!savedCoupon || savedCoupon.id !== validationResult.coupon.id) && (
                            <Button
                                onClick={saveCoupon}
                                disabled={isSaving}
                                variant="primary"
                                size="default"
                                className="w-full"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {savedCoupon ? "מחליף..." : "שומר..."}
                                    </>
                                ) : (
                                    savedCoupon ? "החלף קופון" : "שמור קופון"
                                )}
                            </Button>
                        )
                    )}
                </div>

                <DialogFooter className="pt-4">
                    <div className="flex flex-col gap-y-3 w-full">
                        <Button
                            variant="primaryOutline"
                            size="default"
                            className="w-full"
                            onClick={close}
                        >
                            סגור
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


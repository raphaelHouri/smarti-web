"use client";

import { useEffect, useState } from "react";
import { useFeedbacksModal } from "@/store/use-feedbacks-modal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { submitFeedback } from "@/actions/user-feedbacks";
import { motion } from "framer-motion"; // 👈 animation library

// ✅ Validation schema
const feedbacksFormSchema = z.object({
    title: z
        .string()
        .min(3, { message: "הכותרת חייבת להכיל לפחות 3 תווים." })
        .max(100, { message: "הכותרת לא יכולה להיות ארוכה מ-100 תווים." }),
    description: z
        .string()
        .min(10, { message: "התיאור חייב להכיל לפחות 10 תווים." })
        .max(500, { message: "התיאור לא יכול להיות ארוך מ-500 תווים." }),
    rating: z.enum(["terrible", "bad", "ok", "good", "great"]),
    screenName: z.string(),
    identifier: z.string(),
});

type FeedbacksFormValues = z.infer<typeof feedbacksFormSchema>;

// עברית לאופציות דירוג
const ratingOptions = [
    { value: "terrible", label: "😩", text: "נורא" },
    { value: "bad", label: "🙁", text: "רע" },
    { value: "ok", label: "😐", text: "בסדר" },
    { value: "good", label: "🙂", text: "טוב" },
    { value: "great", label: "😃", text: "מעולה" },
];

const FeedbacksModal = () => {
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close, screenName, identifier } = useFeedbacksModal();

    const form = useForm<FeedbacksFormValues>({
        resolver: zodResolver(feedbacksFormSchema),
        defaultValues: {
            title: "",
            description: "",
            rating: undefined,
            screenName: "",
            identifier: "",
        },
        mode: "onChange",
    });

    useEffect(() => setIsClient(true), []);
    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: "",
                description: "",
                rating: undefined,
                screenName: "",
                identifier: "",
            });
            form.clearErrors();
        }
    }, [isOpen, form, screenName, identifier]);

    if (!isClient) return null;

    const onSubmit = async (values: FeedbacksFormValues) => {
        try {
            const result = await submitFeedback({
                ...values,
                screenName: screenName || "unknown",
                identifier: identifier || "unknown",
            });

            if (result.success) {
                toast.success(result.message);
                setTimeout(() => close(), 500);
            } else toast.error(result.message || "שליחת המשוב נכשלה.");
        } catch (error) {
            console.error("[FEEDBACK_MODAL_SUBMIT_ERROR]", error);
            toast.error("שליחת המשוב נכשלה. נסו שוב.");
        }
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent
                className="max-w-md mx-auto rounded-2xl bg-white backdrop-blur-md shadow-2xl border border-gray-200 transition-all duration-300"
            >
                <DialogHeader>
                    <div className="flex justify-center mb-5">
                        <Image src="/mascot.svg" alt="קמע" height={80} width={80} />
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl text-gray-800">
                        המשוב שלך חשוב לנו!
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        עזרו לנו להשתפר על ידי שיתוף המחשבות והחוויות שלכם מהמערכת.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-5 px-4">
                        {/* דירוג באנימציה */}
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem className="text-center">
                                    <FormLabel className="block mb-2 font-medium text-gray-700">
                                        איך היית מדרג/ת את החוויה שלך?
                                    </FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-5 gap-4 justify-items-center">
                                            {ratingOptions.map((option) => {
                                                const isSelected = field.value === option.value;
                                                return (
                                                    <motion.button
                                                        key={option.value}
                                                        type="button"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        animate={{
                                                            scale: isSelected ? 1.1 : 1,
                                                        }}
                                                        transition={{ duration: 0.2 }}
                                                        onClick={() => field.onChange(option.value)}
                                                        className={`flex flex-col items-center justify-center w-16 h-16 text-3xl p-2 rounded-full border-2 transition-all duration-200 ${isSelected
                                                            ? "border-indigo-500 bg-indigo-50"
                                                            : "border-indigo-200 hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {option.label}
                                                        <div
                                                            className={`text-xs mt-1 px-2 py-1 rounded-lg ${isSelected
                                                                ? "bg-indigo-500 text-white"
                                                                : "bg-gray-200 text-gray-600"
                                                                }`}
                                                        >
                                                            {option.text}
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* כותרת */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>כותרת</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="כותרת המשוב (למשל, 'דיווח על באג', 'הצעה לשיפור')"
                                            {...field}
                                            disabled={isSubmitting}
                                            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-400"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* תיאור */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>תיאור</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="ספרו לנו עוד על החוויה שלכם..."
                                            rows={5}
                                            {...field}
                                            disabled={isSubmitting}
                                            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-400"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* כפתורים */}
                        <DialogFooter className="pt-4">
                            <div className="flex flex-col gap-y-3 w-full">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="default"
                                    className="w-full rounded-xl text-white bg-indigo-500 hover:bg-indigo-600 transition"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            שולח...
                                        </>
                                    ) : (
                                        "שלחו משוב"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="default"
                                    className="w-full rounded-xl"
                                    onClick={close}
                                    disabled={isSubmitting}
                                >
                                    ביטול
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbacksModal;

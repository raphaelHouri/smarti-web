// app/settings/_components/ProfileSettingsForm.tsx
"use client"

import { useState, useEffect, useCallback } from "react"; // Added useEffect and useCallback
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { updateUser } from "@/actions/user-settings"; // Corrected action name if needed
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AvatarSelector } from "./AvatarSelector"; // Import the new component
import { Loader2, Check } from "lucide-react"; // For save button icons


// Debounce utility (can be placed in lib/utils.ts or here)
const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};


// Define the available avatars (must match DB enum)
const AVAILABLE_AVATARS = [
    { src: "/smarti_avatar.png", alt: "סמארטי" },
    { src: "/boy_avatar.png", alt: "ילד" },
    { src: "/girl_avatar.png", alt: "ילדה" },
    { src: "/dragon_avatar.png", alt: "דרגון" },
];

// Define schema for profile form
const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "השם חייב להכיל לפחות 2 תווים.",
    }).max(30, {
        message: "השם אינו יכול להיות ארוך מ-30 תווים.",
    }),
    lessonClock: z.boolean().default(true).optional(),
    quizClock: z.boolean().default(true).optional(),
    grade_class: z.string().optional().nullable(), // Allow null
    gender: z.string().optional().nullable(), // Allow null
    avatar: z.string().refine(val => AVAILABLE_AVATARS.some(a => a.src === val), {
        message: "Please select a valid avatar.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSettingsFormProps {
    initialName: string;
    initialLessonClock: boolean;
    initialQuizClock: boolean;
    initialGradeClass?: string | null;
    initialGender?: string | null;
    initialAvatar?: string | null;
}

export function ProfileSettingsForm({
    initialName,
    initialLessonClock,
    initialQuizClock,
    initialGradeClass,
    initialGender,
    initialAvatar,
}: ProfileSettingsFormProps) {
    // State for individual field saving status
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingLessonClock, setIsSavingLessonClock] = useState(false);
    const [isSavingQuizClock, setIsSavingQuizClock] = useState(false);
    const [isSavingGradeClass, setIsSavingGradeClass] = useState(false);
    const [isSavingGender, setIsSavingGender] = useState(false);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);


    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: initialName,
            lessonClock: initialLessonClock,
            quizClock: initialQuizClock,
            grade_class: initialGradeClass === null ? undefined : initialGradeClass, // Use undefined for Select if null
            gender: initialGender === null ? undefined : initialGender, // Use undefined for Select if null
            avatar: initialAvatar && AVAILABLE_AVATARS.some(a => a.src === initialAvatar) ? initialAvatar : AVAILABLE_AVATARS[0].src,
        },
        mode: "onChange",
    });

    // --- Helper function to handle individual field saves ---
    const saveField = useCallback(async (fieldName: keyof ProfileFormValues, value: any, setLoading: (loading: boolean) => void) => {
        setLoading(true);
        try {
            const updatePayload: Partial<ProfileFormValues> = {};
            // Convert empty string from Select to null for DB if applicable
            updatePayload[fieldName] = (typeof value === 'string' && value === '') ? null : value;

            await updateUser(updatePayload);
            toast.success(`עודכן בהצלחה`);
        } catch (error) {
            console.error(`Failed to update ${fieldName}:`, error);
            toast.error(`עדכון נכשל`);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Debounced save for name field ---
    const debouncedSaveName = useCallback(
        debounce((value: string) => {
            saveField("name", value, setIsSavingName);
        }, 800), // 800ms debounce
        [saveField]
    );

    // --- Watch for changes and trigger auto-saves ---
    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (name === "name" && type === "change") {
                debouncedSaveName(value.name!);
            } else if (name === "lessonClock" && type === "change") {
                saveField("lessonClock", value.lessonClock, setIsSavingLessonClock);
            } else if (name === "quizClock" && type === "change") {
                saveField("quizClock", value.quizClock, setIsSavingQuizClock);
            } else if (name === "grade_class" && type === "change") {
                saveField("grade_class", value.grade_class, setIsSavingGradeClass);
            } else if (name === "gender" && type === "change") {
                saveField("gender", value.gender, setIsSavingGender);
            } else if (name === "avatar" && type === "change") {
                saveField("avatar", value.avatar, setIsSavingAvatar);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, saveField, debouncedSaveName]);


    // --- Individual field submit handlers for input fields ---
    const handleNameSave = async () => {
        const isValid = await form.trigger("name");
        if (isValid) {
            saveField("name", form.getValues("name"), setIsSavingName);
        } else {
            toast.error("שם אינו תקין.");
        }
    };


    return (
        <Form {...form}>
            {/* No form onSubmit needed with auto-save */}
            <div className="space-y-6" dir="rtl">
                {/* מידע אישי */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span role="img" aria-label="user icon">👤</span> מידע אישי
                    </h2>
                    <FormDescription className="mb-4">
                        עדכן פרטי פרופיל ציבורי.
                    </FormDescription>
                    <Separator className="my-4" />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>שם</FormLabel>
                                <div className="flex items-center space-x-2">
                                    <FormControl>
                                        <Input placeholder="השם שלך" {...field} className="flex-1" />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        onClick={handleNameSave}
                                        disabled={isSavingName || !form.formState.dirtyFields.name || !form.formState.isValid}
                                        className="w-8 h-8"
                                    >
                                        {isSavingName ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <FormDescription>
                                    שם התצוגה הציבורי שלך.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="avatar"
                        render={({ field }) => (
                            <FormItem className="mt-6">
                                <FormLabel>בחר אוואטר</FormLabel>
                                <FormControl>
                                    <AvatarSelector
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        avatars={AVAILABLE_AVATARS}
                                    />
                                </FormControl>
                                <FormDescription>
                                    בחר תמונת ייצוג.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* העדפות למידה */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span role="img" aria-label="preferences icon">📚</span> העדפות למידה
                    </h2>
                    <FormDescription className="mb-4">
                        התאם את הגדרות חוויית הלמידה שלך.
                    </FormDescription>
                    <Separator className="my-4" />
                    <FormField
                        control={form.control}
                        name="lessonClock"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">שעון בתרגול</FormLabel>
                                    <FormDescription>
                                        הצג טיימר במהלך התרגולים.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isSavingLessonClock}
                                    />
                                </FormControl>
                                {isSavingLessonClock && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quizClock"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">שעון במבחן</FormLabel>
                                    <FormDescription>
                                        הצג טיימר במהלך המבחנים.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isSavingQuizClock}
                                    />
                                </FormControl>
                                {isSavingQuizClock && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                            </FormItem>
                        )}
                    />
                </div>

                {/* פרטים נוספים */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span role="img" aria-label="details icon">ℹ️</span> פרטים נוספים
                    </h2>
                    <FormDescription className="mb-4">
                        ספק מידע אופציונלי על עצמך.
                    </FormDescription>
                    <Separator className="my-4" />
                    <FormField
                        control={form.control}
                        name="grade_class"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>כיתה</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger disabled={isSavingGradeClass}>
                                            <SelectValue placeholder="בחר כיתה" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>

                                        <SelectItem value="1st Grade">א׳</SelectItem>
                                        <SelectItem value="2nd Grade">ב׳</SelectItem>
                                        <SelectItem value="3rd Grade">ג׳</SelectItem>
                                        <SelectItem value="4th Grade">ד׳</SelectItem>
                                        <SelectItem value="5th Grade">ה׳</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    זה עוזר לנו להתאים את חוויית הלמידה שלך.
                                </FormDescription>
                                <FormMessage />
                                {isSavingGradeClass && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="mt-4">
                                <FormLabel>מגדר</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger disabled={isSavingGender}>
                                            <SelectValue placeholder="בחר מגדר (אופציונלי)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Value must not be an empty string */}
                                        <SelectItem value="Male">זכר</SelectItem>
                                        <SelectItem value="Female">נקבה</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    מידע זה אופציונלי.
                                </FormDescription>
                                <FormMessage />
                                {isSavingGender && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Remove the main submit button */}
            </div>
        </Form>
    );
}
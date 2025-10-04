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


// Define the available avatars
const AVAILABLE_AVATARS = [
    { src: "/man.svg", alt: "Man avatar" }, // Make sure paths are correct, e.g., "/avatars/man.svg"
    { src: "/woman.svg", alt: "Woman avatar" },
    { src: "/zombie.svg", alt: "Zombie avatar" },
    { src: "/girl.svg", alt: "Girl avatar" },
];

// Define schema for profile form
const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }).max(30, {
        message: "Name must not be longer than 30 characters.",
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
            toast.success(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} updated!`); // Nicer toast message
        } catch (error) {
            console.error(`Failed to update ${fieldName}:`, error);
            toast.error(`Failed to update ${fieldName}.`);
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
            toast.error("Name field has errors.");
        }
    };


    return (
        <Form {...form}>
            {/* No form onSubmit needed with auto-save */}
            <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span role="img" aria-label="user icon">👤</span> Personal Information
                    </h2>
                    <FormDescription className="mb-4">
                        Update your public profile details.
                    </FormDescription>
                    <Separator className="my-4" />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <div className="flex items-center space-x-2">
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} className="flex-1" />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
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
                                    This is your public display name.
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
                                <FormLabel>Select Avatar</FormLabel>
                                <FormControl>
                                    <AvatarSelector
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        avatars={AVAILABLE_AVATARS}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Choose an avatar to represent you.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Learning Preferences */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span role="img" aria-label="preferences icon">📚</span> Learning Preferences
                    </h2>
                    <FormDescription className="mb-4">
                        Customize your learning experience settings.
                    </FormDescription>
                    <Separator className="my-4" />
                    <FormField
                        control={form.control}
                        name="lessonClock"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Lesson Clock</FormLabel>
                                    <FormDescription>
                                        Display a timer during lessons.
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
                                    <FormLabel className="text-base">Quiz Clock</FormLabel>
                                    <FormDescription>
                                        Display a timer during quizzes.
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

                {/* Additional Details */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span role="img" aria-label="details icon">ℹ️</span> Additional Details
                    </h2>
                    <FormDescription className="mb-4">
                        Provide optional information about yourself.
                    </FormDescription>
                    <Separator className="my-4" />
                    <FormField
                        control={form.control}
                        name="grade_class"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grade/Class</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger disabled={isSavingGradeClass}>
                                            <SelectValue placeholder="Select your grade or class" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Value must not be an empty string, so use a distinct identifier for "no selection" */}
                                        <SelectItem value="null_grade">Prefer not to say</SelectItem>
                                        <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                                        <SelectItem value="1st Grade">1st Grade</SelectItem>
                                        <SelectItem value="2nd Grade">2nd Grade</SelectItem>
                                        {/* Add more grades/classes as needed */}
                                        <SelectItem value="High School">High School</SelectItem>
                                        <SelectItem value="College">College</SelectItem>
                                        <SelectItem value="Adult Learner">Adult Learner</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    This helps us tailor your learning experience.
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
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger disabled={isSavingGender}>
                                            <SelectValue placeholder="Select your gender (optional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Value must not be an empty string */}
                                        <SelectItem value="null_gender">Prefer not to say</SelectItem>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    This information is optional.
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
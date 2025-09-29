// app/settings/_components/ProfileSettingsForm.tsx
"use client"

import { useState } from "react";
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
import { updateUser } from "@/actions/user-settings";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AvatarSelector } from "./AvatarSelector"; // Import the new component

// Define the available avatars
const AVAILABLE_AVATARS = [
    { src: "/man.svg", alt: "Man avatar" },
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
    })
    // .default(AVAILABLE_AVATARS[0].src), // Default to the first avatar
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
    const [isSaving, setIsSaving] = useState(false);
    console.log("Initial Avatar:", initialGender);
    console.log("Initial Avatar:", initialGradeClass);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: initialName,
            lessonClock: initialLessonClock,
            quizClock: initialQuizClock,
            grade_class: initialGradeClass || "", // Use undefined for initial empty value in Select
            gender: initialGender || "", // Use undefined for initial empty value in Select
            avatar: initialAvatar && AVAILABLE_AVATARS.some(a => a.src === initialAvatar) ? initialAvatar : AVAILABLE_AVATARS[0].src,
        },
        mode: "onChange",
    });

    async function onSubmit(data: ProfileFormValues) {
        setIsSaving(true);
        try {
            await updateUser({
                name: data.name,
                lessonClock: data.lessonClock,
                quizClock: data.quizClock,
                grade_class: data.grade_class === "" ? null : data.grade_class, // Convert empty string to null for DB
                gender: data.gender === "" ? null : data.gender, // Convert empty string to null for DB
                avatar: data.avatar,
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                </FormControl>
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
                                    />
                                </FormControl>
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
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Additional Details */}


                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
}
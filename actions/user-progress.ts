"use server";

import db from "@/db/drizzle";
import { getLessonsOfCategoryById } from "@/db/queries";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { users } from "@/db/schemaSmarti";



export const updateUserCategory = async (courseId: string) => {
    //authentication
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            redirect(`/learn/${courseId}`);

        }
        const lessons = await getLessonsOfCategoryById(courseId);
        if (!lessons || (Array.isArray(lessons) && lessons.length === 0)) {
            throw new Error("lessons not found");
        }


        if (user) {
            //all I have to do is await and update over here
            // Replace 'activeCourseId' with a valid property from the users schema, e.g., 'activeCategoryId'
            const data = await db.update(users).set({
                lessonCategoryId: courseId,
            })
            //break the cache and revalidate
            revalidatePath("/courses");
            revalidatePath("/learn");
            redirect("/learn")
        }


        //break the cache and revalidate
        revalidatePath("/courses");
        revalidatePath("/learn");
        redirect("/learn");
    }
    catch (error) {
        console.error("Something went wrong from server:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

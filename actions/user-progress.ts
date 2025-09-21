"use server";

import db from "@/db/drizzle";
import { getLessonsOfCategoryById, getUserProgress } from "@/db/queries";
import { challenges, userProgress } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { challengesProgress } from '../db/schema';
import { and, eq } from "drizzle-orm";
import { POINTS_TO_REFILL } from "@/constants";
import { users } from "@/db/schemaSmarti";



export const updateUserCategory = async (courseId: string) => {
    //authentication
    try {
        const { userId } = await auth();
        const user = await currentUser();

        const lessons = await getLessonsOfCategoryById(courseId);
        if (!lessons || (Array.isArray(lessons) && lessons.length === 0)) {
            throw new Error("lessons not found");
        }

        if (!userId || !user) {
            redirect(`/learn/${courseId}`);

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

export const reduceHearts = async (challengeId: string) => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("UnAuthorized");
    }
    const currentUserProgress = await getUserProgress();
    const userSubscription = await getUserSubscriptions();

    const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId)
    })
    if (!challenge) {
        throw new Error("Challenge not Found")
    }

    const lessonId = challenge.id

    if (!currentUserProgress) {
        throw new Error("User Progress Not Found")
    }

    const existingChallengeProgress = await db.query.challengesProgress.findFirst({
        where: and(
            eq(challengesProgress.userId, userId),
            eq(challengesProgress.challengeId, challengeId)
        )

    })

    const isPractise = !!existingChallengeProgress;
    if (isPractise) {
        return { error: "practise" }
    }

    if (userSubscription?.isActive) {
        return { error: "subscription" }
    }

    if (currentUserProgress.hearts === 0 && !userSubscription?.isActive) {
        return { error: "hearts" }
    }

    await db.update(userProgress).set({
        hearts: Math.max(currentUserProgress.hearts - 1, 0)
    }).where(eq(userProgress.userId, userId))
    revalidatePath("/shop");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath("/learn");
    revalidatePath(`/lesson/${lessonId}`);
}

export const refillHearts = async () => {
    const currentUserProgress = await getUserProgress();
    if (!currentUserProgress) {
        throw new Error("User Progress not found")
    }
    if (currentUserProgress.hearts === 5) {
        throw new Error("Hearts Already Exists")
    }
    if (currentUserProgress.points < POINTS_TO_REFILL) {
        throw new Error("Not Enough Points to upgrade.")
    }
    // api route
    await db.update(userProgress).set({
        hearts: 5,
        points: currentUserProgress.points - POINTS_TO_REFILL
    }).where(
        eq(userProgress.userId, currentUserProgress.userId)
    )
    //revalidating the paths
    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
}
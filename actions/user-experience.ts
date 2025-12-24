"use server";

import { getUserProgress } from "@/db/queries";

export async function getUserExperience() {
    try {
        const userProgress = await getUserProgress();
        return {
            experience: userProgress?.experience ?? 0,
        };
    } catch (error) {
        console.error("Error fetching user experience:", error);
        return {
            experience: 0,
        };
    }
}



import { auth } from "@clerk/nextjs/server";

const allowedIds = [
    "user_2egY1XnJuT5C9JUjr32CeUS38u2",
    "user_306j7eqpKh6upN8qiAHC02HsiPD"
]

export const IsAdmin = async () => {
    const { userId } = await auth();
    if (!userId) return false;
    return allowedIds.includes(userId);
}
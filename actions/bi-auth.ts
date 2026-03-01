"use server";

import { cookies } from "next/headers";
import {
    COOKIE_NAME,
    MAX_AGE_SECONDS,
    createBiCookieValue,
    getBiPassword,
} from "@/lib/bi-auth";

export type AuthenticateBiResult =
    | { success: true }
    | { success: false; error: string };

export async function authenticateBi(password: string): Promise<AuthenticateBiResult> {
    const expected = getBiPassword();
    if (password !== expected) {
        return { success: false, error: "Invalid password" };
    }
    const cookieStore = await cookies();
    const value = createBiCookieValue();
    cookieStore.set(COOKIE_NAME, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE_SECONDS,
        path: "/",
    });
    return { success: true };
}

"use server";
import { cache } from "react";
import db from "./drizzle";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { lessonCategory, lessonQuestionGroups, lessons, questions, userLessonResults, users, userSettings, userWrongQuestions, onlineLessons, coupons, paymentTransactions, bookPurchases, subscriptions, ProductType, PaymentStatus, userSystemStats } from './schemaSmarti';
import { and, asc, desc, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hasFullAccess } from "@/lib/admin";
import { getDefaultSystemStep } from "@/lib/utils";

export type LessonWithResults =
    typeof lessons.$inferSelect & {
        results: Array<typeof userLessonResults.$inferSelect>;
    };

type UserWithSettingsRelation = typeof users.$inferSelect & {
    settings: Array<typeof userSettings.$inferSelect & {
        lessonCategory?: typeof lessonCategory.$inferSelect | null;
    }>;
};

export type UserWithSettings = Omit<UserWithSettingsRelation, 'settings'> & {
    settings: (typeof userSettings.$inferSelect & {
        lessonCategory?: typeof lessonCategory.$inferSelect | null;
    }) | null;
};



export const getCategories = cache(async () => {
    const { userId } = await auth();
    // Get systemStep for both authenticated and guest users (from cookie)
    const userSystemStep = await getUserSystemStep(userId);
    const data = await db.query.lessonCategory.findMany({
        where: eq(lessonCategory.systemStep, userSystemStep),
        orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.order), asc(lessonCategory.categoryType)],
    });
    return data;
});

export const getLessonCategory = cache(async () => {
    const { userId } = await auth();
    // Get systemStep for both authenticated and guest users (from cookie)
    const userSystemStep = await getUserSystemStep(userId);
    const data = await db.query.lessons.findMany({
        where: eq(lessons.systemStep, userSystemStep),
        with: {
            category: true
        },
        orderBy: (lessons, { asc }) => [asc(lessons.lessonOrder)]
    });
    return data;
})

export const getLessonCategoryById = cache(async (categoryId: string) => {
    const data = await getLessonCategory()
    return data.filter(lesson => lesson.lessonCategoryId === categoryId) ?? null;
})




export const getOrCreateUserFromGuest = cache(async (lessonCategoryId?: string, returnUser: boolean = true): Promise<UserWithSettings | null> => {
    const { userId } = await auth();
    if (!userId) return null;

    const cookieValue = (await cookies()).get("systemStep")?.value;
    const cookieNumber = cookieValue ? Number(cookieValue) : NaN;
    const cookieSystemStep = [1, 2, 3].includes(cookieNumber) ? cookieNumber : 1;

    const existingUserResult = await db.query.users.findFirst({
        where: eq(users.id, userId), // Remove the systemStep filter here
        with: {
            settings: {
                where: (settings, { eq }) => eq(settings.systemStep, cookieSystemStep),
                limit: 1
            },
        }
    });
    const existingUser = existingUserResult ? {
        ...existingUserResult,
        settings: existingUserResult.settings[0],
    } : null;
    let newLessonCategoryId;
    if (lessonCategoryId) {
        // Validate that the lesson category exists and matches the current system step
        const category = await db.query.lessonCategory.findFirst({
            where: and(
                eq(lessonCategory.id, lessonCategoryId),
                eq(lessonCategory.systemStep, cookieSystemStep)
            ),
        });
        if (!category) {
            throw new Error("Invalid lesson category ID or category does not match current system step");
        }
        newLessonCategoryId = lessonCategoryId;

    } else {
        // Get the first category for the current system step
        const category = await db.query.lessonCategory.findFirst({
            where: eq(lessonCategory.systemStep, cookieSystemStep),
            orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.order), asc(lessonCategory.categoryType)],
        });
        newLessonCategoryId = category?.id || null;
    }
    if (!existingUser) {
        try {
            // Perform all inserts inside a transaction to ensure data integrity.
            // If any part fails, all changes are rolled back.
            const clerkInstance = await clerkClient();
            const user = await clerkInstance.users.getUser(userId);
            const userEmail = user.emailAddresses.find((e: { id: string; emailAddress: string }) => e.id === user.primaryEmailAddressId)?.emailAddress ?? "";


            // 1. Insert the new user.
            await db.insert(users).values({
                id: userId,
                name: user.firstName || "משתמש אורח", // Use the user's name from Clerk
                email: userEmail,
                systemStep: cookieSystemStep,
            });

            // 2. Insert the corresponding user settings.
            await db.insert(userSettings).values({
                id: crypto.randomUUID(),
                userId: userId,
                systemStep: cookieSystemStep,
                lessonCategoryId: newLessonCategoryId,
            });

            // 3. Initialize user system stats for the current step
            await getOrCreateUserSystemStats(userId, cookieSystemStep);

            if (returnUser) {
                const newUserResult = await db.query.users.findFirst({
                    where: eq(users.id, userId),
                    with: {
                        settings: {
                            where: (settings, { eq, and }) => and(
                                eq(settings.userId, userId),
                                eq(settings.systemStep, cookieSystemStep)
                            ),
                            limit: 1
                        },
                    }
                });
                const newUser = newUserResult ? {
                    ...newUserResult,
                    settings: newUserResult.settings[0],
                } : null;

                return newUser;
            }
        } catch (error) {
            return null;
        }
    } else {
        // If user already exists, check if settings exist for the current step
        const existingSettings = await db.query.userSettings.findFirst({
            where: and(
                eq(userSettings.userId, userId),
                eq(userSettings.systemStep, cookieSystemStep)
            ),
        });

        // If settings don't exist for this step, create a new one
        if (!existingSettings) {
            // Get the existing settings to copy values from (if any exist)
            const anyExistingSettings = await db.query.userSettings.findFirst({
                where: eq(userSettings.userId, userId),
                orderBy: (userSettings, { desc }) => [desc(userSettings.systemStep)],
            });

            // Create new settings for the current step, copying values from existing settings if available
            await db.insert(userSettings).values({
                id: crypto.randomUUID(),
                userId: userId,
                systemStep: cookieSystemStep,
                lessonCategoryId: newLessonCategoryId,
                lessonClock: anyExistingSettings?.lessonClock ?? true,
                quizClock: anyExistingSettings?.quizClock ?? true,
                immediateResult: anyExistingSettings?.immediateResult ?? false,
                grade_class: anyExistingSettings?.grade_class ?? null,
                gender: anyExistingSettings?.gender ?? null,
                avatar: anyExistingSettings?.avatar ?? "/smarti_avatar.png",
            });
        }

        // If user already exists and cookie has a valid systemStep, sync it across all necessary fields
        if ([1, 2, 3].includes(cookieSystemStep) && existingUser.systemStep !== cookieSystemStep) {
            // Update users table
            await db.update(users)
                .set({ systemStep: cookieSystemStep })
                .where(eq(users.id, userId));

            // Update the existingUser object to reflect the change
            existingUser.systemStep = cookieSystemStep;
        }

        // Ensure stats are initialized for the current step
        await getOrCreateUserSystemStats(userId, cookieSystemStep);

        // Fetch the updated user with settings for the current step
        if (returnUser) {
            // Re-fetch user with settings filtered by systemStep
            const updatedUserResult = await db.query.users.findFirst({
                where: eq(users.id, userId),
                with: {
                    settings: {
                        where: (settings, { eq, and }) => and(
                            eq(settings.userId, userId),
                            eq(settings.systemStep, cookieSystemStep)
                        ),
                        limit: 1
                    },
                }
            });
            const updatedUser = updatedUserResult ? {
                ...updatedUserResult,
                settings: updatedUserResult.settings[0],
            } : null;

            return updatedUser || existingUser;
        }
    }

    return existingUser;
});

export const getUserSystemStep = cache(async (userId?: string | null): Promise<number> => {
    if (userId) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { systemStep: true },
        });
        if (user?.systemStep && [1, 2, 3].includes(user.systemStep)) {
            return user.systemStep;
        }
    }

    const cookieValue = (await cookies()).get("systemStep")?.value;
    const cookieNumber = cookieValue ? Number(cookieValue) : NaN;
    if ([1, 2, 3].includes(cookieNumber)) {
        return cookieNumber as 1 | 2 | 3;
    }

    return getDefaultSystemStep();
});

export const getOrCreateUserSystemStats = cache(async (userId: string, systemStep: number) => {

    if (![1, 2, 3].includes(systemStep)) {
        return null;
    }

    const existingStats = await db.query.userSystemStats.findFirst({
        where: and(
            eq(userSystemStats.userId, userId),
            eq(userSystemStats.systemStep, systemStep)
        ),
    });

    if (existingStats) {
        return existingStats;
    }

    // Initialize stats for this step with default values
    const newStats = await db.insert(userSystemStats).values({
        id: crypto.randomUUID(),
        userId,
        systemStep,
        experience: 0,
        geniusScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    return newStats[0] ?? null;
});

export const addResultsToUser = cache(async (lessonId: string, userId: string, answers: any[], questionList: string[], startAt: Date | null) => {

    const existingResult = await db.query.userLessonResults.findFirst({
        where: and(eq(userLessonResults.userId, userId), eq(userLessonResults.lessonId, lessonId)),
    });
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    const userSystemStep = await getUserSystemStep(userId);

    if (existingResult) {
        await db.update(userLessonResults)
            .set({
                startedAt: startAt,
                completedAt: new Date(),
                answers,
                rightQuestions: answers.filter(answer => answer == "a").length,
                totalQuestions: answers.length,
                systemStep: userSystemStep,
                createdAt: new Date(),
            })
            .where(eq(userLessonResults.id, existingResult.id));
    } else {
        await db.insert(userLessonResults).values({
            id: crypto.randomUUID(),
            userId: userId,
            answers,
            lessonId: lessonId,
            startedAt: startAt,
            completedAt: new Date(),
            rightQuestions: answers.filter(answer => answer == "a").length,
            totalQuestions: answers.length,
            systemStep: userSystemStep,
            createdAt: new Date(),
        });
    }

    const experienceDelta = answers.reduce(
        (acc, answer) => acc + (answer === "a" || answer != null ? 10 : 0),
        0
    );
    const geniusScoreDelta = answers.reduce(
        (acc, answer, index) =>
            acc + (answer === "a" ? (index <= 1 ? 5 : 5 + Math.round(acc / 3)) : 0),
        0
    );

    const existingStats = await db.query.userSystemStats.findFirst({
        where: and(
            eq(userSystemStats.userId, userId),
            eq(userSystemStats.systemStep, userSystemStep)
        ),
    });

    if (existingStats) {
        await db
            .update(userSystemStats)
            .set({
                experience: existingStats.experience + experienceDelta,
                geniusScore: existingStats.geniusScore + geniusScoreDelta,
                updatedAt: new Date(),
            })
            .where(eq(userSystemStats.id, existingStats.id));
    } else {
        await db.insert(userSystemStats).values({
            id: crypto.randomUUID(),
            userId,
            systemStep: userSystemStep,
            experience: experienceDelta,
            geniusScore: geniusScoreDelta,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Map each questionId to its real lessonCategoryId based on lessonQuestionGroups for this lesson & step
    const lessonQuestionGroupsForLesson = await db.query.lessonQuestionGroups.findMany({
        where: (lg, { and, eq }) => and(
            eq(lg.lessonId, lessonId),
            eq(lg.systemStep, userSystemStep)
        ),
        columns: {
            categoryId: true,
            questionList: true,
        },
    });

    const questionToCategory = new Map<string, string>();
    for (const group of lessonQuestionGroupsForLesson) {
        if (!group.categoryId || !group.questionList) continue;
        for (const qId of group.questionList) {
            if (!qId || questionToCategory.has(qId)) continue;
            questionToCategory.set(qId, qId ? group.categoryId : group.categoryId);
        }
    }

    answers.forEach(async (answer, index) => {
        if (answer !== "a") {
            const questionId = questionList[index];
            const existingWrongQuestion = await db.query.userWrongQuestions.findFirst({
                where: and(
                    eq(userWrongQuestions.userId, userId),
                    eq(userWrongQuestions.questionId, questionId)
                ),
            });

            if (!existingWrongQuestion) {
                await db.insert(userWrongQuestions).values({
                    id: crypto.randomUUID(),
                    questionId,
                    userId,
                    systemStep: userSystemStep,
                    lessonCategoryId: questionToCategory.get(questionId) ?? null,
                    isNull: answer ? false : true,
                });
            }
        }
    });
    revalidatePath("/learn/[slug]")


});

// export const getOrCreateUserFromGuest = cache(async () => {
//     const { userId } = await auth();
//     if (!userId) return null;
//     const data = await db.query.users.findFirst({
//         where: eq(users.id, userId),

//     })
//     if (!data) {
//         // create user if not exists with the userId
//         const clerkInstance = await clerkClient()
//         const user = await clerkInstance.users.getOrCreateUserFromGuest(userId)
//         const userEmail = user.emailAddresses.find((e: { id: string; emailAddress: string }) => e.id === user.primaryEmailAddressId)?.emailAddress ?? "";
//         const data = await db.insert(users).values({
//             id: userId,
//             name: "Guest User",
//             email: userEmail,
//         })
//         console.log(data)
//         return data;

//     }
//     return data;
// })

// getFirstCategory
export const getFirstCategory = cache(async () => {
    try {
        const { userId } = await auth();
        // Get systemStep for both authenticated and guest users (from cookie)
        const userSystemStep = await getUserSystemStep(userId);

        // Validate systemStep is a valid number
        if (![1, 2, 3].includes(userSystemStep)) {
            console.error(`[getFirstCategory] Invalid systemStep: ${userSystemStep}, userId: ${userId}`);
            // Try to get any category as fallback
            const fallbackData = await db.query.lessonCategory.findFirst({
                orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.order), asc(lessonCategory.categoryType)],
            });
            return fallbackData ?? null;
        }

        // Try to get category for current system step
        // Note: Using the same pattern as getCategories which works
        let data = await db.query.lessonCategory.findFirst({
            where: eq(lessonCategory.systemStep, userSystemStep),
            orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.categoryType)],
        });

        // If no category found for current system step, try to get any category as fallback
        if (!data) {
            data = await db.query.lessonCategory.findFirst({
                orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.categoryType)],
            });
        }

        return data ?? null;
    } catch (error) {
        console.error("[getFirstCategory] Database error:", error);
        // Return null on error to prevent app crash
        return null;
    }
});


// Public: fetch plans for shop page
export type ShopPlanRecord = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    days: number;
    displayData: any | null;
    productsIds?: string[];
};

export type PackageType = "system" | "book";
export type ShopPlansByType = Record<PackageType, ShopPlanRecord[]>;

export const getPlansForShop = cache(async (): Promise<ShopPlansByType> => {
    const { userId } = await auth();
    const userSystemStep = await getUserSystemStep(userId);
    const data = await db.query.plans.findMany({
        where: (plans, { eq, and }) => and(
            eq(plans.isActive, true),
            eq(plans.systemStep, userSystemStep)
        ),
        orderBy: (plans, { asc }) => [
            asc(plans.order),
            asc(plans.name)
        ]
    });
    const grouped: ShopPlansByType = { system: [], book: [] };
    data.forEach((p) => {
        const rec: ShopPlanRecord = {
            id: p.id,
            name: p.name,
            description: p.description ?? null,
            price: p.price,
            days: p.days,
            displayData: (p as any).displayData ?? null,
            productsIds: (p as any).productsIds ?? [],
        };
        const key = (p.packageType as PackageType) ?? "system";
        grouped[key].push(rec);
    });
    return grouped;
});

export const getProductById = cache(async (productId: string) => {
    const product = await db.query.products.findFirst({
        where: (t, { eq }) => eq(t.id, productId),
    });
    return product ?? null;
});

export const getPlan = cache(async (planId: string) => {
    return db.query.plans.findFirst({
        where: (plan, { eq }) => eq(plan.id, planId),
    });
});

type CouponLookup = { id: string } | { code: string };
type CouponRecord = typeof coupons.$inferSelect;

export const getCoupon = cache(async (lookup: CouponLookup): Promise<CouponRecord | null> => {
    const coupon = await db.query.coupons.findFirst({
        where: (coupon, { eq }) =>
            "id" in lookup ? eq(coupon.id, lookup.id) : eq(coupon.code, lookup.code),
    });
    return coupon ?? null;
});

export const validateCoupon = async (code: string, systemStep?: number): Promise<{ valid: boolean; coupon: CouponRecord | null; error?: string }> => {
    const coupon = await getCoupon({ code });

    if (!coupon) {
        return { valid: false, coupon: null, error: "קופון לא נמצא" };
    }

    // Validate systemStep if provided
    if (systemStep !== undefined && coupon.systemStep !== systemStep) {
        return { valid: false, coupon, error: "קופון לא תקף לשלב זה" };
    }

    const now = new Date();

    // Check if coupon is active
    if (!coupon.isActive) {
        return { valid: false, coupon, error: "קופון לא פעיל" };
    }

    // Check if coupon is within valid date range
    if (now < coupon.validFrom) {
        return { valid: false, coupon, error: "קופון עדיין לא תקף" };
    }

    if (now > coupon.validUntil) {
        return { valid: false, coupon, error: "קופון פג תוקף" };
    }

    // Check uses against maxUses (using the uses column instead of counting subscriptions)
    const currentUses = coupon.uses ?? 0;
    if (currentUses >= coupon.maxUses) {
        // Auto-disable coupon if it reached max uses
        if (coupon.isActive) {
            await db.update(coupons)
                .set({ isActive: false })
                .where(eq(coupons.id, coupon.id));
        }
        return { valid: false, coupon, error: "קופון הגיע למספר השימושים המקסימלי" };
    }

    return { valid: true, coupon };
};

export const getUserSavedCoupon = async (userId: string, systemStep: number): Promise<CouponRecord | null> => {
    const settings = await db.query.userSettings.findFirst({
        where: and(
            eq(userSettings.userId, userId),
            eq(userSettings.systemStep, systemStep)
        ),
    });

    if (!settings || !settings.savedCouponId) {
        return null;
    }

    const coupon = await getCoupon({ id: settings.savedCouponId });
    if (!coupon) {
        return null;
    }

    // Validate the saved coupon is still valid
    const validation = await validateCoupon(coupon.code, systemStep);
    if (!validation.valid) {
        // Clear invalid coupon
        await db.update(userSettings)
            .set({ savedCouponId: null })
            .where(and(
                eq(userSettings.userId, userId),
                eq(userSettings.systemStep, systemStep)
            ));
        return null;
    }

    return coupon;
};

export const saveUserCoupon = async (userId: string, couponId: string, systemStep: number): Promise<{ success: boolean; error?: string }> => {
    const coupon = await getCoupon({ id: couponId });
    if (!coupon) {
        return { success: false, error: "קופון לא נמצא" };
    }

    const validation = await validateCoupon(coupon.code, systemStep);
    if (!validation.valid) {
        return { success: false, error: validation.error ?? "קופון לא תקף" };
    }

    // Get or create user settings for this system step
    const existingSettings = await db.query.userSettings.findFirst({
        where: and(
            eq(userSettings.userId, userId),
            eq(userSettings.systemStep, systemStep)
        ),
    });

    if (existingSettings) {
        await db.update(userSettings)
            .set({ savedCouponId: couponId })
            .where(and(
                eq(userSettings.userId, userId),
                eq(userSettings.systemStep, systemStep)
            ));
    } else {
        // Create new settings if they don't exist
        // Get any existing settings to copy defaults from
        const anyExistingSettings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
            orderBy: (userSettings, { desc }) => [desc(userSettings.systemStep)],
        });

        await db.insert(userSettings).values({
            id: crypto.randomUUID(),
            userId: userId,
            systemStep: systemStep,
            savedCouponId: couponId,
            lessonClock: anyExistingSettings?.lessonClock ?? true,
            quizClock: anyExistingSettings?.quizClock ?? true,
            immediateResult: anyExistingSettings?.immediateResult ?? false,
            grade_class: anyExistingSettings?.grade_class ?? null,
            gender: anyExistingSettings?.gender ?? null,
            avatar: anyExistingSettings?.avatar ?? "/smarti_avatar.png",
        });
    }

    return { success: true };
};

export const clearUserCoupon = async (userId: string, systemStep: number): Promise<void> => {
    await db.update(userSettings)
        .set({ savedCouponId: null })
        .where(and(
            eq(userSettings.userId, userId),
            eq(userSettings.systemStep, systemStep)
        ));
};

export const findBookPurchase = cache(async (productId: string, userId: string) => {
    const now = new Date();
    return db.query.bookPurchases.findFirst({
        where: (bp, { eq, gt, and }) =>
            and(
                eq(bp.productId, productId),
                eq(bp.userId, userId),
                gt(bp.validUntil, now)
            ),
    });
});

export async function createBookPurchase(
    purchase: typeof bookPurchases.$inferInsert
): Promise<typeof bookPurchases.$inferSelect> {
    const [inserted] = await db.insert(bookPurchases).values(purchase).returning();
    return inserted;
}

export const getTransactionDataById = cache(async (transactionId: string) => {
    return db.query.paymentTransactions.findFirst({
        where: (transaction, { eq }) => eq(transaction.id, transactionId),
        with: {
            plan: true,
            coupon: true,
        },
    });
});

// === Payments: subscriptions and transaction status helpers ===
export type NewSubscription = {
    userId: string;
    productId: string;
    couponId: string | null;
    paymentTransactionId: string;
    systemUntil: Date;
    systemStep: number;
};

/**
 * Insert subscriptions for a given transaction idempotently.
 * If any subscriptions already exist for the paymentTransactionId, no inserts are performed.
 */
export async function createSubscriptionsIfMissingForTransaction(
    subscriptionItems: NewSubscription[],
    paymentTransactionId: string
): Promise<void> {
    if (!Array.isArray(subscriptionItems) || subscriptionItems.length === 0) return;

    const existing = await db.query.subscriptions.findMany({
        where: (s, { eq }) => eq(s.paymentTransactionId, paymentTransactionId),
    });
    if (existing && existing.length > 0) return;

    // Get unique coupon IDs that are being used
    const usedCouponIds = new Set(
        subscriptionItems
            .map(s => s.couponId)
            .filter((id): id is string => id !== null && id !== undefined)
    );

    // Increment uses count for each coupon used
    for (const couponId of usedCouponIds) {
        const coupon = await getCoupon({ id: couponId });
        if (coupon) {
            const currentUses = coupon.uses ?? 0;
            // Only increment if not already at max
            if (currentUses < coupon.maxUses) {
                const newUses = currentUses + 1;
                await db.update(coupons)
                    .set({
                        uses: newUses,
                        // Auto-disable if reached max uses
                        isActive: newUses < coupon.maxUses,
                    })
                    .where(eq(coupons.id, couponId));
            } else {
                // Already at max, ensure it's disabled
                if (coupon.isActive) {
                    await db.update(coupons)
                        .set({ isActive: false })
                        .where(eq(coupons.id, couponId));
                }
            }
        }
    }

    await db.insert(subscriptions).values(
        subscriptionItems.map((s) => ({
            id: crypto.randomUUID(),
            userId: s.userId,
            productId: s.productId,
            couponId: s.couponId ?? null,
            paymentTransactionId: s.paymentTransactionId,
            systemUntil: s.systemUntil,
            systemStep: s.systemStep,
            createdAt: new Date(),
        }))
    );
}

/**
 * Mark the payment transaction as fulfilled and update the optional vatId.
 */


export async function updatePaymentTransaction(transactionId: string, vatId?: string, status?: PaymentStatus): Promise<void> {
    await db
        .update(paymentTransactions)
        .set({
            status: status,
            ...(vatId ? { vatId } : {}),
            updatedAt: new Date(),
        })
        .where(eq(paymentTransactions.id, transactionId));
}


export const getLessonsOfCategoryById = cache(async (categoryId: string) => {
    const { userId } = await auth();
    // Get systemStep for both authenticated and guest users (from cookie)
    const userSystemStep = await getUserSystemStep(userId);
    const data = await db.query.lessonCategory.findMany({
        where: and(
            eq(lessonCategory.id, String(categoryId)),
            eq(lessonCategory.systemStep, userSystemStep)
        ),
        with: {
            lessons: {
                where: eq(lessons.systemStep, userSystemStep),
                orderBy: (lessons, { asc }) => [asc(lessons.lessonOrder)],
            }
        },
    })
    return data;
})

export const getOnlineLessonsWithCategory = cache(async (categoryId?: string) => {
    const { userId } = await auth();
    const userSystemStep = await getUserSystemStep(userId);
    const data = categoryId
        ? await db.query.onlineLessons.findMany({
            where: (t, { eq, and }) => and(
                eq(t.categoryId, categoryId),
                eq(t.systemStep, userSystemStep)
            ),
            orderBy: (t, { asc }) => [asc(t.order), asc(t.title)],
            with: {
                category: true,
            },
        })
        : await db.query.onlineLessons.findMany({
            where: (t, { eq }) => eq(t.systemStep, userSystemStep),
            orderBy: (t, { asc }) => [asc(t.order), asc(t.title)],
            with: {
                category: true,
            },
        });

    return data.map(item => ({
        ...item,
        categoryType: item.category?.categoryType ?? '',
        categoryImageSrc: item.category?.imageSrc ?? '',
        categoryId: item.categoryId,
    }));
});

export const getCategoriesForOnlineLessons = cache(async () => {
    const { userId } = await auth();
    const userSystemStep = await getUserSystemStep(userId);
    const onlineLessonsData = await db.query.onlineLessons.findMany({
        where: eq(onlineLessons.systemStep, userSystemStep),
        with: {
            category: true,
        }
    });
    const categories = await db.query.lessonCategory.findMany({
        where: eq(lessonCategory.systemStep, userSystemStep),
        orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.order), asc(lessonCategory.categoryType)],
    });

    const categoryIds = new Set(onlineLessonsData.map(ol => ol.categoryId));
    return categories.filter(cat => categoryIds.has(cat.id)).map(cat => ({
        id: cat.id,
        categoryType: cat.categoryType,
        imageSrc: cat.imageSrc,
    }));
});

export const getLessonCategoryWithLessonsById = cache(async (categoryId: string) => {
    const { userId } = await auth();
    if (!userId) return [];
    const userSystemStep = await getUserSystemStep(userId);

    return db
        .select({
            id: userLessonResults.id,
            userId: userLessonResults.userId,
            lessonId: userLessonResults.lessonId,
            startedAt: userLessonResults.startedAt,
            completedAt: userLessonResults.completedAt,
            answers: userLessonResults.answers,
            rightQuestions: userLessonResults.rightQuestions,
            totalQuestions: userLessonResults.totalQuestions,
            createdAt: userLessonResults.createdAt,
            lessonCategoryId: lessons.lessonCategoryId,
        })
        .from(userLessonResults)
        .innerJoin(lessons, eq(lessons.id, userLessonResults.lessonId))
        .where(
            and(
                // eq(userLessonResults.userId, userId),      // <-- filter by THIS user
                eq(lessons.lessonCategoryId, categoryId),
                eq(userLessonResults.systemStep, userSystemStep),
                eq(lessons.systemStep, userSystemStep)
            )
        )
        .orderBy(desc(userLessonResults.completedAt), desc(userLessonResults.createdAt));
});


export const getUserProgress = cache(async () => {
    const { userId } = await auth();
    if (!userId) return null;
    const userSystemStep = await getUserSystemStep(userId);

    const userResult = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            settings: {
                where: (settings, { eq }) => eq(settings.systemStep, userSystemStep),
                limit: 1,
                with: {
                    lessonCategory: true,
                }
            },
        }
    });

    if (!userResult) return null;

    const user = {
        ...userResult,
        settings: userResult.settings[0],
    };

    // Get user system stats for the current step
    const systemStats = await db.query.userSystemStats.findFirst({
        where: and(
            eq(userSystemStats.userId, userId),
            eq(userSystemStats.systemStep, userSystemStep)
        ),
    });

    // Return user with experience and geniusScore from userSystemStats
    return {
        ...user,
        experience: systemStats?.experience ?? 0,
        geniusScore: systemStats?.geniusScore ?? 0,
    };
})
export const getUserSubscriptions = cache(async () => {
    const { userId } = await auth();
    if (!userId) {
        return new Set<ProductType>();
    }

    // Check if user has full access (whitelist)
    const hasAccess = await hasFullAccess(userId);
    if (hasAccess) return new Set<ProductType>(["all"]);
    // Get all valid subscriptions that haven't passed system_until
    const validSubscriptions = await db.query.subscriptions.findMany({
        where: (subs, { eq, and, isNotNull, gt, sql }) => and(
            eq(subs.userId, userId),
            // systemUntil must not be null and greater than current time (not passed)
            isNotNull(subs.systemUntil),
            gt(subs.systemUntil, sql`NOW()`)
        ),
        with: {
            product: {
                columns: {
                    productType: true,
                },
            },
        },
    });

    // Extract unique productTypes as a Set
    const productTypes = new Set<ProductType>(
        validSubscriptions
            .map(sub => sub.product?.productType)
            .filter((type): type is NonNullable<typeof type> => type !== undefined && type !== null)
    );

    return productTypes;
})
// cancelling the subscription tells stripe not to renew next month
async function getLessonQuestionGroupsWithFirstQuestionCategorySingleQuery(lessonId: string) {
    const result = await db.select({
        id: lessonQuestionGroups.id,
        lessonId: lessonQuestionGroups.lessonId,
        // --- IMPORTANT CHANGE HERE ---
        // Explicitly cast questionList to `string[]` using sql.type
        questionList: sql<string[]>`${lessonQuestionGroups.questionList}`,
        // Alternatively, if you prefer using the column directly:
        // questionList: sql<string[]>`${lessonQuestionGroups.questionList}::text[]`, // PostgreSQL explicit cast
        // Or sometimes just:
        // questionList: lessonQuestionGroups.questionList, // This *should* work but seems to be failing inference
        // Let's stick with the most explicit `sql<string[]>` to ensure the type.
        // If the above still fails, try `sql<string[]>`${lessonQuestionGroups.questionList}::uuid[]` or `::text[]` for PostgreSQL type cast.

        time: lessonQuestionGroups.time,
        createdAt: lessonQuestionGroups.createdAt,


        categoryType: lessonCategory.categoryType,
        categoryId: lessonCategory.id,
    })
        .from(lessonQuestionGroups)
        .leftJoin(lessons, eq(lessonQuestionGroups.lessonId, lessons.id))
        .leftJoin(lessonCategory, eq(lessonCategory.id, lessonQuestionGroups.categoryId))
        .where(eq(lessonQuestionGroups.lessonId, lessonId))
        .orderBy(asc(lessonQuestionGroups.createdAt));

    const formattedResult = result.map(row => ({
        id: row.id,
        lessonId: row.lessonId,
        questionList: row.questionList, // This should now correctly be string[]
        time: row.time,
        createdAt: row.createdAt as Date,
        categoryId: row.categoryId as string,
        categoryType: row.categoryType as string,
    }));

    return formattedResult;
}

export const getQuizDataByLessonId = cache(async (lessonId: string) => {
    const { userId } = await auth();
    const userSystemStep = await getUserSystemStep(userId);
    let userPreviousAnswers = null;
    if (userId) {
        const result = await db.query.userLessonResults.findFirst({
            where: and(
                eq(userLessonResults.userId, userId),
                eq(userLessonResults.lessonId, lessonId),
                eq(userLessonResults.systemStep, userSystemStep)
            ),
            orderBy: (userLessonResults, { desc }) => [desc(userLessonResults.createdAt)],
        });
        userPreviousAnswers = result?.answers ?? null;
    }

    const questionGroupsResult = await db.query.lessonQuestionGroups.findMany({
        where: and(
            eq(lessonQuestionGroups.lessonId, lessonId),
            eq(lessonQuestionGroups.systemStep, userSystemStep)
        ),
        orderBy: (lessonQuestionGroups, { asc }) => [asc(lessonQuestionGroups.createdAt)],
        with: {
            category: {
                columns: {
                    categoryType: true, // Select the categoryType from lessonCategory
                },
            },
        },
    });

    // TypeScript will now correctly infer the types for group.category.categoryType
    const questionGroups = questionGroupsResult.map(group => ({
        time: group.time,
        id: group.id,
        createdAt: group.createdAt,
        systemStep: group.systemStep,
        lessonId: group.lessonId,
        questionList: group.questionList,
        categoryId: group.categoryId,
        categoryType: group.category.categoryType,
    }));



    // Flatten all question IDs from all groups
    const questionIds = questionGroups.flatMap(group => group.questionList ?? []);

    // Get all questions for those IDs
    const questionsList = questionIds.length
        ? await db.query.questions.findMany({
            where: (q, { inArray: inArrayFn }) => inArrayFn(q.id, questionIds),
        })
        : [];


    const questionsDict = Object.fromEntries(
        questionsList.map(q => [q.id, q])
    );


    return {
        questionGroups: questionGroups,
        questionsDict,
        userPreviousAnswers: userPreviousAnswers as Array<"a" | "b" | "c" | "d" | null> | null,
    };
});


export const getUserWrongQuestionsByCategoryId = cache(async (categoryId: string) => {
    const { userId } = await auth();
    if (!userId) {
        return {
            questionGroups: [],
            questionsDict: {},
            userPreviousAnswers: null
        };
    }
    const userSystemStep = await getUserSystemStep(userId);

    // Fetch all user wrong questions for the given category using the stored lessonCategoryId
    const wrongQuestions = await db.query.userWrongQuestions.findMany({
        where: (wrongQuestionsAlias, { eq, and }) => and(
            eq(wrongQuestionsAlias.userId, userId),
            eq(wrongQuestionsAlias.systemStep, userSystemStep),
            eq(wrongQuestionsAlias.lessonCategoryId, categoryId)
        ),
        with: {
            question: {
                columns: {
                    id: true,
                    content: true,
                    question: true,
                    format: true,
                    options: true,
                    topicType: true,
                    explanation: true,
                    managerId: true,
                    createdAt: true,
                    // categoryId is intentionally excluded since it was removed
                },
            },
        },
        limit: 30,
    });

    // Extract question IDs
    const questionIds = wrongQuestions.map(wq => wq.questionId);

    // Fetch questions for those IDs
    const questionsList = questionIds.length
        ? await db.query.questions.findMany({
            where: (q, { inArray: inArrayFn }) => inArrayFn(q.id, questionIds),
        })
        : [];

    // Create a dictionary of questions
    const questionsDict = Object.fromEntries(
        questionsList.map(q => [q.id, q])
    );

    // Create a fake question group for the return format
    const questionGroups = [
        {
            id: "fake-group-id",
            createdAt: new Date(),
            systemStep: userSystemStep,
            lessonId: "fake-lesson-id",
            category: "fake-category",
            categoryId: categoryId,
            categoryType: "fake-category-type",
            questionList: questionIds,
            time: 0
        },
    ];

    return {
        questionsDict,
        questionGroups,
        userPreviousAnswers: null
    };
});
export const removeQuestionsWrongByQuestionId = cache(async (questionId: string) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User ID is required.");
    }
    const userSystemStep = await getUserSystemStep(userId);

    await db.delete(userWrongQuestions).where(
        and(
            eq(userWrongQuestions.userId, userId),
            eq(userWrongQuestions.questionId, questionId),
            eq(userWrongQuestions.systemStep, userSystemStep)
        )
    );
    revalidatePath("/lesson/[slug]");

});



// save user result
export const saveUserResult = cache(async (result: Array<"a" | "b" | "c" | "d" | null>, lessonId: string, questions: string[]) => {
    const { userId } = await auth();
    if (!userId) return null;
    const userSystemStep = await getUserSystemStep(userId);
    const totalScore = result.filter(answer => answer == "a").length;

    // Insert user lesson result using drizzle
    await db.insert(userLessonResults).values({
        id: crypto.randomUUID(),
        userId,
        lessonId: lessonId,
        startedAt: new Date(),
        completedAt: new Date(),
        answers: result,
        rightQuestions: totalScore,
        totalQuestions: result.length,
        systemStep: userSystemStep,
        createdAt: new Date(),
    });

    const wrongResult = {
        nullAnswers: result
            .map((answer, index) => (answer === null ? questions[index] : null))
            .filter((q): q is string => q !== null),
        wrongAnswers: result
            .map((answer, index) => (answer !== "a" && answer !== null ? questions[index] : null))
            .filter((q): q is string => q !== null),
    };

    // Map each questionId to its real lessonCategoryId based on lessonQuestionGroups for this lesson & step
    const lessonQuestionGroupsForLesson = await db.query.lessonQuestionGroups.findMany({
        where: (lg, { and, eq }) => and(
            eq(lg.lessonId, lessonId),
            eq(lg.systemStep, userSystemStep)
        ),
        columns: {
            categoryId: true,
            questionList: true,
        },
    });

    const questionToCategory = new Map<string, string>();
    for (const group of lessonQuestionGroupsForLesson) {
        if (!group.categoryId || !group.questionList) continue;
        for (const qId of group.questionList) {
            if (!qId || questionToCategory.has(qId)) continue;
            questionToCategory.set(qId, group.categoryId);
        }
    }

    // Insert wrong questions for the user using drizzle
    if (Array.isArray(questions) && questions.length > 0) {
        // Insert wrong answers and null answers into userWrongQuestions
        const wrongQuestionEntries = [
            ...wrongResult.nullAnswers.map((questionId: string) => ({
                id: crypto.randomUUID(),
                questionId,
                userId,
                isNull: true,
                systemStep: userSystemStep,
                lessonCategoryId: questionToCategory.get(questionId) ?? null,
            })),
            ...wrongResult.wrongAnswers.map((questionId: string) => ({
                id: crypto.randomUUID(),
                questionId,
                userId,
                systemStep: userSystemStep,
                isNull: false,
                lessonCategoryId: questionToCategory.get(questionId) ?? null,
            })),
        ];

        if (wrongQuestionEntries.length > 0) {
            await db.insert(userWrongQuestions).values(wrongQuestionEntries);
        }
    }

});


export const getTopUsers = cache(async () => {
    const { userId } = await auth();
    if (!userId) {
        return [];
    }
    const userSystemStep = await getUserSystemStep(userId);
    const data = await db
        .select({
            id: users.id,
            email: users.email,
            experience: userSystemStats.experience,
            avatar: userSettings.avatar,
        })
        .from(userSystemStats)
        .innerJoin(users, eq(userSystemStats.userId, users.id))
        .leftJoin(userSettings, eq(userSettings.userId, users.id))
        .where(eq(userSystemStats.systemStep, userSystemStep))
        .orderBy(desc(userSystemStats.experience))
        .limit(10);
    return data;
})

export const getUserByAuthId = async (authId: string) => {
    const data = await db.query.users.findFirst({
        where: eq(users.id, authId),
    });
    return data;
}

export const getUserSettingsById = async (userId: string) => {
    const systemStep = await getUserSystemStep(userId);
    const data = await db.query.userSettings.findFirst({
        where: and(
            eq(userSettings.userId, userId),
            eq(userSettings.systemStep, systemStep)
        ),
    });
    return data;
}

export const getAllWrongQuestionsWithDetails = async () => {
    const { userId } = await auth();

    if (!userId) {
        return [];
    }

    // Fetch all userWrongQuestions for the current user
    // Explicitly select only the columns we need from questions (excluding category_id)
    const wrongQuestionsWithDetails = await db.query.userWrongQuestions.findMany({
        where: eq(userWrongQuestions.userId, userId),
        with: {
            question: {
                columns: {
                    id: true,
                    content: true,
                    question: true,
                    format: true,
                    options: true,
                    topicType: true,
                    explanation: true,
                    managerId: true,
                    createdAt: true,
                    // categoryId is intentionally excluded since it was removed
                },
            },
            lessonCategory: true,
        },
    });

    return wrongQuestionsWithDetails;
};




// export const getCourseById = cache(async (courseId: number) => {
//     const data = await db.query.courses.findFirst({
//         where: eq(courses.id, courseId),
//         with: {
//             units: {
//                 orderBy: (units, { asc }) => [asc(units.order)],
//                 with: {
//                     lessons: {
//                         orderBy: (lessons, { asc }) => [asc(lessons.order)],
//                     }
//                 }
//             },
//         },
//     })
//     return data;
// })

// export const getUnits = cache(async () => {
//     const { userId } = await auth();
//     const userProgress = await getUserProgress();
//     if (!userId || !userProgress || !userProgress.activeCourseId) {
//         return [];
//     }
//     const data = await db.query.units.findMany({
//         orderBy: (units, { asc }) => [asc(units.order)],
//         where: eq(units.courseId, userProgress?.activeCourseId),
//         with: {
//             lessons: {
//                 orderBy: (lessons, { asc }) => [asc(lessons.order)],
//                 with: {
//                     challenges: {
//                         orderBy: (challenges, { asc }) => [asc(challenges.order)],
//                         with: {
//                             challengesProgress: {
//                                 where: eq(challengesProgress.userId, userId),
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     });
//     const normalizedData = data.map((unit) => {
//         const lessonsCompleted = unit.lessons.map((lesson) => {
//             if (lesson.challenges.length === 0) {
//                 return { ...lesson, completed: false }
//             }
//             const challengesCompleted = lesson.challenges.every((challenge) => {
//                 return challenge.challengesProgress
//                     && challenge.challengesProgress.length > 0
//                     && challenge.challengesProgress.every((progress) => progress.completed)
//             })
//             return { ...lesson, completed: challengesCompleted };
//         })
//         return { ...unit, lessons: lessonsCompleted }
//     })
//     return normalizedData;
// })

// export const getLesson = cache(async (id?: number) => {
//     const { userId } = await auth();
//     if (!userId) {
//         return null;
//     }

//     const courseProgress = await getCourseProgress();
//     const lessonsId = id || courseProgress?.activeLessonId;
//     if (!lessonsId) {
//         return null;
//     }
//     const data = await db.query.lessons.findFirst({
//         where: eq(lessons.id, lessonsId),
//         with: {
//             challenges: {
//                 orderBy: (challenges, { asc }) => [asc(challenges.order)],
//                 with: {
//                     challengesOptions: true,
//                     challengesProgress: {
//                         where: eq(challengesProgress.userId, userId)
//                     }
//                 }
//             }
//         }
//     })
//     console.log("getLesson is working")
//     if (!data || !data.challenges) {
//         return null;
//     }
//     const normalizedChallenges = data.challenges.map((challenge) => {
//         //Todo: If something doesnt work, check the last if clause
//         const completed =
//             challenge.challengesProgress &&
//             challenge.challengesProgress.length > 0
//             && challenge.challengesProgress.every((progress) => progress.completed)
//         return { ...challenge, completed }
//     })
//     return { ...data, challenges: normalizedChallenges }
// })

// export const getCourseProgress = cache(async () => {
//     const { userId } = await auth();
//     const userProgress = await getUserProgress();
//     if (!userId || !userProgress?.activeCourseId) {
//         return null;
//     }
//     const unitsInActiveCourse = await db.query.units.findMany({
//         orderBy: (units, { asc }) => [asc(units.order)],
//         where: eq(units.courseId, userProgress.activeCourseId),
//         with: {
//             lessons: {
//                 orderBy: (lessons, { asc }) => [asc(lessons.order)],
//                 with: {
//                     units: true,
//                     challenges: {
//                         with: {
//                             challengesProgress: {
//                                 where: eq(challengesProgress.userId, userId),
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     });
//     // normalising the data
//     // console.log("getCourseProgress is working");
//     const findUncompletedLessons = unitsInActiveCourse.
//         flatMap((unit) => unit.lessons).find((lesson) => {
//             //Todo: If something doesnt work, check the last if clause
//             return lesson.challenges.some((challenge) => {
//                 return !challenge.challengesProgress
//                     || challenge.challengesProgress.length === 0
//                     || challenge.challengesProgress.some((progress) =>
//                         progress.completed === false)
//             })
//         })
//     // return the active lessson from this
//     return {
//         activeLesson: findUncompletedLessons,
//         activeLessonId: findUncompletedLessons?.id,
//     }
// })

// export const getLessonPercentage = cache(async () => {
//     const { userId } = await auth();
//     const courseProgress = await getCourseProgress();
//     if (!courseProgress?.activeLessonId) {
//         return 0;
//     }
//     const lesson = await getLesson(courseProgress?.activeLessonId);
//     if (!lesson) {
//         return 0;
//     }
//     const completedChallenges = lesson.challenges
//         .filter((challenge) => challenge.completed);
//     const percentage = Math.round((completedChallenges.length / lesson.challenges.length) * 100);
//     return percentage;
// })


// export const getUserSubscriptions = cache(async () => {
//     const { userId } = await auth();
//     if (!userId) {
//         return null;
//     }
//     const subscription = await db.query.userSubscription.findFirst({
//         where: eq(userSubscription.userId, userId)
//     })
//     if (!subscription) return null;

//     const isActive =
//         subscription.stripePriceId
//         && subscription.stripeCurrentPeriodEnd?.getTime()!
//         + DAY_IN_MS > Date.now()

//     return {
//         ...subscription,
//         isActive: !!isActive
//     }

//     // PURCHASING AND CANCELLING HANDLED
// })
// // cancelling the subscription tells stripe not to renew next month


// export const getTopUsers = cache(async () => {
//     const { userId } = await auth();
//     if (!userId) {
//         return [];
//     }
//     const data = await db.query.userProgress.findMany({
//         orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
//         limit: 10,
//         columns: {
//             userId: true,
//             userName: true,
//             userImageSrc: true,
//             points: true,
//         },
//     })
//     return data;
// })

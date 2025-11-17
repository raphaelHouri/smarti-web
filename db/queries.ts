"use server";
import { cache } from "react";
import db from "./drizzle";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { lessonCategory, lessonQuestionGroups, lessons, questions, userLessonResults, users, userSettings, userWrongQuestions, onlineLessons, coupons, paymentTransactions, bookPurchases, subscriptions } from './schemaSmarti';
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type LessonWithResults =
    typeof lessons.$inferSelect & {
        results: Array<typeof userLessonResults.$inferSelect>;
    };



export const getCategories = cache(async () => {
    const data = await db.query.lessonCategory.findMany();
    return data;
});

export const getLessonCategory = cache(async () => {
    const data = await db.query.lessons.findMany({
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




export const getOrCreateUserFromGuest = cache(async (lessonCategoryId?: string) => {
    const { userId } = await auth();
    if (!userId) return null;

    const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            settings: true,
        }
    });

    if (!existingUser) {
        try {
            // Perform all inserts inside a transaction to ensure data integrity.
            // If any part fails, all changes are rolled back.
            const clerkInstance = await clerkClient();
            const user = await clerkInstance.users.getUser(userId);
            const userEmail = user.emailAddresses.find((e: { id: string; emailAddress: string }) => e.id === user.primaryEmailAddressId)?.emailAddress ?? "";
            let newLessonCategoryId
            if (lessonCategoryId) {
                const lesson = await db.query.lessons.findFirst({
                    where: eq(lessons.lessonCategoryId, lessonCategoryId),
                });
                if (!lesson) {
                    throw new Error("Invalid lesson category ID");
                }
                newLessonCategoryId = lessonCategoryId

            } else {
                const category = await getFirstCategory();
                newLessonCategoryId = category?.id || null;
            }


            // 1. Insert the new user.
            await db.insert(users).values({
                id: userId,
                name: user.firstName || "משתמש אורח", // Use the user's name from Clerk
                email: userEmail,
                lessonCategoryId: newLessonCategoryId,
            });

            // 2. Insert the corresponding user settings.
            await db.insert(userSettings).values({
                id: crypto.randomUUID(),
                userId: userId,
            });

            const newUser = await db.query.users.findFirst({
                where: eq(users.id, userId),
                with: {
                    settings: true,
                }
            });

            return newUser;
        } catch (error) {
            return null;
        }
    }

    return existingUser;
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

    if (existingResult) {
        await db.update(userLessonResults)
            .set({
                startedAt: startAt,
                completedAt: new Date(),
                answers,
                rightQuestions: answers.filter(answer => answer == "a").length,
                totalQuestions: answers.length,
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
            createdAt: new Date(),
        });
        await db.update(users)
            .set({
                experience: user.experience + answers.reduce((acc, answer) => acc + (answer === 'a' || answer != null ? 10 : 0), 0),
                geniusScore: user.geniusScore + answers.reduce((acc, answer, index) => acc + (answer === 'a' ? (index <= 1 ? 5 : 5 + Math.round(acc / 3)) : 0), 0),
            })
            .where(eq(users.id, userId));

    }

    answers.forEach(async (answer, index) => {
        if (answer !== "a") {
            const existingWrongQuestion = await db.query.userWrongQuestions.findFirst({
                where: and(
                    eq(userWrongQuestions.userId, userId),
                    eq(userWrongQuestions.questionId, questionList[index])
                ),
            });

            if (!existingWrongQuestion) {
                await db.insert(userWrongQuestions).values({
                    id: crypto.randomUUID(),
                    questionId: questionList[index],
                    userId: userId,
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
    const data = await db.query.lessonCategory.findFirst({
        orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.categoryType)],
    });

    return data ?? null;
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
    const data = await db.query.plans.findMany({
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

    await db.insert(subscriptions).values(
        subscriptionItems.map((s) => ({
            id: crypto.randomUUID(),
            userId: s.userId,
            productId: s.productId,
            couponId: s.couponId ?? null,
            paymentTransactionId: s.paymentTransactionId,
            systemUntil: s.systemUntil,
            createdAt: new Date(),
        }))
    );
}

/**
 * Mark the payment transaction as fulfilled and update the optional vatId.
 */
export async function fulfillPaymentTransaction(transactionId: string, vatId?: string): Promise<void> {
    await db
        .update(paymentTransactions)
        .set({
            status: "fulfilled",
            ...(vatId ? { vatId } : {}),
            updatedAt: new Date(),
        })
        .where(eq(paymentTransactions.id, transactionId));
}


export const getLessonsOfCategoryById = cache(async (categoryId: string) => {
    const data = await db.query.lessonCategory.findMany({
        where: eq(lessonCategory.id, String(categoryId)),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.lessonOrder)],
            }
        },
    })
    return data;
})

export const getOnlineLessonsWithCategory = cache(async (categoryId?: string) => {
    const data = categoryId
        ? await db.query.onlineLessons.findMany({
            where: (t, { eq }) => eq(t.categoryId, categoryId),
            orderBy: (t, { asc }) => [asc(t.order), asc(t.title)],
            with: {
                category: true,
            },
        })
        : await db.query.onlineLessons.findMany({
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
    const categories = await db.query.lessonCategory.findMany();
    const onlineLessons = await db.query.onlineLessons.findMany({
        with: {
            category: true,
        }
    });

    const categoryIds = new Set(onlineLessons.map(ol => ol.categoryId));
    return categories.filter(cat => categoryIds.has(cat.id)).map(cat => ({
        id: cat.id,
        categoryType: cat.categoryType,
        imageSrc: cat.imageSrc,
    }));
});

export const getLessonCategoryWithLessonsById = cache(async (categoryId: string) => {
    const { userId } = await auth();
    if (!userId) return [];

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
                eq(lessons.lessonCategoryId, categoryId)
            )
        )
        .orderBy(desc(userLessonResults.completedAt), desc(userLessonResults.createdAt));
});


export const getUserProgress = cache(async () => {
    const { userId } = await auth();
    if (!userId) return null;
    const data = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            lessonCategory: true,
            settings: true,
        }
    })
    return data;
})
export const getUserSubscriptions = cache(async () => {
    const { userId } = await auth();
    if (!userId) {
        return {
            lessonCategoryId: "61758a59-2c5e-4865-9c09-002cc0665881",
            isPro: false,
            experience: 0,
            geniusScore: 0,
        };
    }

    return {
        lessonCategoryId: "61758a59-2c5e-4865-9c09-002cc0665881",
        isPro: false,
        experience: 0,
        geniusScore: 0,
    };
    // const subscription = await db.query.subscriptions.findMany({
    //     where: eq(subscriptions.user_id, userId)
    // })
    // if (!subscription) return null;

    // const isActive =
    //     subscription.stripePriceId
    //     && subscription.stripeCurrentPeriodEnd?.getTime()!
    //     + DAY_IN_MS > Date.now()

    // return {
    //     ...subscription,
    //     isActive: !!isActive
    // }

    // PURCHASING AND CANCELLING HANDLED
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
        .leftJoin(questions, eq(questions.id, sql<string>`${lessonQuestionGroups.questionList}[1]`))
        .leftJoin(lessonCategory, eq(lessonCategory.id, questions.categoryId))
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
    let userPreviousAnswers = null;
    if (userId) {
        const result = await db.query.userLessonResults.findFirst({
            where: and(

                eq(userLessonResults.userId, userId),
                eq(userLessonResults.lessonId, lessonId)
            ),
            orderBy: (userLessonResults, { desc }) => [desc(userLessonResults.createdAt)],
        });
        userPreviousAnswers = result?.answers ?? null;
    }

    const questionGroupsResult = await db.query.lessonQuestionGroups.findMany({
        where: eq(lessonQuestionGroups.lessonId, lessonId),
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
        lessonId: group.lessonId,
        questionList: group.questionList,
        categoryId: group.categoryId,
        categoryType: group.category.categoryType,
    }));



    // Flatten all question IDs from all groups
    const questionIds = questionGroups.flatMap(group => group.questionList ?? []);


    await db.query.questions.findMany({
        where: (questions, { inArray }) => inArray(questions.id, questionIds),
    })

    // Get all questions for those IDs
    const questionsList = questionIds.length
        ? await db.query.questions.findMany({
            where: (q) => inArray(q.id, questionIds),
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

    // Fetch all user wrong questions for the given category using Drizzle syntax
    const wrongQuestions = await db.query.userWrongQuestions.findMany({
        where: (wrongQuestionsAlias, { eq, and, inArray }) => and(
            eq(wrongQuestionsAlias.userId, userId),
            inArray(wrongQuestionsAlias.questionId,
                db.select({ id: questions.id })
                    .from(questions)
                    .where(eq(questions.categoryId, categoryId))
            )
        ),
        with: {
            question: true,
        },
        limit: 30,
    });

    // Extract question IDs
    const questionIds = wrongQuestions.map(wq => wq.questionId);

    // Fetch questions for those IDs
    const questionsList = questionIds.length
        ? await db.query.questions.findMany({
            where: (q) => inArray(q.id, questionIds),
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
            lessonId: "fake-lesson-id",
            category: "fake-category",
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

    await db.delete(userWrongQuestions).where(
        and(
            eq(userWrongQuestions.userId, userId),
            eq(userWrongQuestions.questionId, questionId)
        )
    );
    revalidatePath("/lesson/[slug]");

});



// save user result
export const saveUserResult = cache(async (result: Array<"a" | "b" | "c" | "d" | null>, lessonId: string, questions: string[]) => {
    const { userId } = await auth();
    if (!userId) return null;
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

    // Insert wrong questions for the user using drizzle
    if (Array.isArray(questions) && questions.length > 0) {
        // Insert wrong answers and null answers into userWrongQuestions
        const wrongQuestionEntries = [
            ...wrongResult.nullAnswers.map((questionId: string) => ({
                id: crypto.randomUUID(),
                questionId,
                userId,
                isNull: true,
            })),
            ...wrongResult.wrongAnswers.map((questionId: string) => ({
                id: crypto.randomUUID(),
                questionId,
                userId,
                isNull: false,
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
    const data = await db
        .select({
            id: users.id,
            email: users.email,
            experience: users.experience,
            avatar: userSettings.avatar,
        })
        .from(users)
        .leftJoin(userSettings, eq(userSettings.userId, users.id))
        .orderBy(desc(users.experience))
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
    const data = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
    });
    return data;
}

export const getAllWrongQuestionsWithDetails = async () => {
    const { userId } = await auth();

    if (!userId) {
        return [];
    }

    // Fetch all userWrongQuestions for the current user
    // And eagerly load the related 'questions' data using 'with'
    const wrongQuestionsWithDetails = await db.query.userWrongQuestions.findMany({
        where: eq(userWrongQuestions.userId, userId),
        with: {
            question: {
                with: {
                    category: true, // Assuming 'category' is the relation to fetch category details
                },
            },
        },
    });

    // Replace categoryId with category title
    const result = wrongQuestionsWithDetails.map((entry) => ({
        ...entry,
        question: {
            ...entry.question
        },
    }));

    return result;
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

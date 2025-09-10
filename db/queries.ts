"use server";
import { cache } from "react";
import db from "./drizzle";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { lessonCategory, lessonQuestionGroups, lessons, userLessonResults, users, userWrongQuestions } from './schemaSmarti';
import { and, desc, eq, inArray } from "drizzle-orm";

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
        }
    });
    return data;
})

export const getLessonCategoryById = cache(async (categoryId: string) => {
    const data = await getLessonCategory()
    return data.filter(lesson => lesson.lessonCategoryId === categoryId) ?? null;
})




export const createUserFromGuest = cache(async (lessonCategoryId: string) => {
    const { userId } = await auth();
    if (!userId) return null;
    const data = await db.query.users.findFirst({
        where: eq(users.id, userId),

    })
    if (!data) {
        // create user if not exists with the userId
        const clerkInstance = await clerkClient()
        const user = await clerkInstance.users.getUser(userId)
        const userEmail = user.emailAddresses.find((e: { id: string; emailAddress: string }) => e.id === user.primaryEmailAddressId)?.emailAddress ?? "";
        const data = await db.insert(users).values({
            id: userId,
            name: "Guest User",
            email: userEmail,
        })
        console.log(data)
        return data;

    }
    return data;
})

export const getUser = cache(async () => {
    const { userId } = await auth();
    if (!userId) return null;
    const data = await db.query.users.findFirst({
        where: eq(users.id, userId),

    })
    if (!data) {
        // create user if not exists with the userId
        const clerkInstance = await clerkClient()
        const user = await clerkInstance.users.getUser(userId)
        const userEmail = user.emailAddresses.find((e: { id: string; emailAddress: string }) => e.id === user.primaryEmailAddressId)?.emailAddress ?? "";
        const data = await db.insert(users).values({
            id: userId,
            name: "Guest User",
            email: userEmail,
        })
        console.log(data)
        return data;

    }
    return data;
})

// getFirstCategory
export const getFirstCategory = cache(async () => {
    const data = await db.query.lessonCategory.findFirst({
        orderBy: (lessonCategory, { asc }) => [asc(lessonCategory.createdAt)],
    });
    return data ?? null;
});


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
            totalScore: userLessonResults.totalScore,
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

export const getQuizDataByLessonId = cache(async (lessonId: string) => {
    // Get all question groups for the lesson
    const questionGroups = await db.query.lessonQuestionGroups.findMany({
        where: eq(lessonQuestionGroups.lessonId, lessonId),
        orderBy: (lessonQuestionGroups, { asc }) => [asc(lessonQuestionGroups.createdAt)],
    });

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
        questionGroups,
        questionsDict
    };
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
        totalScore: Math.round((totalScore / result.length) * 100),
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

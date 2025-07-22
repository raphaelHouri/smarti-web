import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "@/db/schemaSmarti";
import { v4 as uuidv4 } from "uuid";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
    try {
        console.log("Seeding started");

        // await db.delete(schema.userWrongQuestions);
        // await db.delete(schema.userLessonResults);
        // await db.delete(schema.questions);
        // await db.delete(schema.lessonQuestionGroups);
        // await db.delete(schema.lessons);
        // await db.delete(schema.lessonCategory);
        // await db.delete(schema.subscriptions);
        // await db.delete(schema.coupons);
        // await db.delete(schema.plans);
        // await db.delete(schema.userSettings);
        // await db.delete(schema.users);
        // await db.delete(schema.organizationYears);
        // await db.delete(schema.organizationInfo);

        const userId = uuidv4();
        const orgId = uuidv4();
        const orgYearId = uuidv4();
        const settingsId = uuidv4();
        const planId = uuidv4();
        const couponId = uuidv4();
        const categoryId = uuidv4();
        const lessonId = uuidv4();
        const lesson2Id = uuidv4();
        const questionGroupId = uuidv4();
        const questionGroup2Id = uuidv4();
        const questionId = uuidv4();
        const question2Id = uuidv4();

        await db.insert(schema.organizationInfo).values({
            id: orgId,
            name: "EduSpark",
            contactEmail: "contact@eduspark.com",
            address: "123 Spark Ave",
            city: "Tel Aviv",
            phone: "03-1234567",
            createdAt: new Date()
        });

        await db.insert(schema.organizationYears).values({
            id: orgYearId,
            organizationId: orgId,
            year: 2025,
            notes: "Pilot year",
            createdAt: new Date()
        });

        await db.insert(schema.users).values({
            id: userId,
            name: "Alice Genius",
            email: "alice@example.com",
            managedorganization: [orgId],
            createdAt: new Date(),
            organizationYearId: orgYearId,
            userSettingsId: settingsId,
            experience: 100,
            geniuesScore: 200,
        });

        await db.insert(schema.userSettings).values({
            id: settingsId,
            userId,
            lessonClock: 30,
            quizClock: 15,
            grade: "6",
            gender: "female",
            avatar: "🧠"
        });

        await db.insert(schema.plans).values({
            id: planId,
            name: "Basic Plan",
            description: "Access to all lessons",
            days: 90,
            price: 99,
            createdAt: new Date()
        });

        await db.insert(schema.coupons).values({
            id: couponId,
            code: "WELCOME25",
            couponType: "percentage",
            value: 25,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            isActive: true,
            maxUses: 100,
            planId,
            organizationYearId: orgYearId,
            createdAt: new Date()
        });

        await db.insert(schema.subscriptions).values({
            id: uuidv4(),
            userId,
            systemUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
            price: 99,
            recepentId: "stripe-user-123",
            couponId,
            createdAt: new Date(),
            planId
        });

        await db.insert(schema.lessonCategory).values({
            id: categoryId,
            categoryType: "תרגול בעברית",
            createdAt: new Date()
        });

        await db.insert(schema.lessons).values([
            {
                id: lessonId,
                lessonCategoryId: categoryId,
                lessonOrder: 1,
                createdAt: new Date()
            },
            {
                id: lesson2Id,
                lessonCategoryId: categoryId,
                lessonOrder: 2,
                createdAt: new Date()
            }
        ]);

        await db.insert(schema.lessonQuestionGroups).values([
            {
                id: questionGroupId,
                lessonId,
                category: "בינוני",
                questionList: [questionId],
                time: 600,
                createdAt: new Date()
            },
            {
                id: questionGroup2Id,
                lessonId: lesson2Id,
                category: "קשה",
                questionList: [question2Id],
                time: 900,
                createdAt: new Date()
            }
        ]);

        await db.insert(schema.questions).values([
            {
                id: questionId,
                content: "<p>מה בירת ישראל?</p>",
                question: "מה בירת ישראל?",
                format: "single",
                options: {
                    a: "תל אביב",
                    b: "חיפה",
                    c: "ירושלים",
                    d: "אשדוד"
                },
                topicType: "ארץ ישראל",
                explanation: "ירושלים היא עיר הבירה של מדינת ישראל.",
                createdAt: new Date()
            },
            {
                id: question2Id,
                content: "<p>מתי קמה מדינת ישראל?</p>",
                question: "מתי קמה מדינת ישראל?",
                format: "single",
                options: {
                    a: "1945",
                    b: "1947",
                    c: "1948",
                    d: "1950"
                },
                topicType: "היסטוריה",
                explanation: "מדינת ישראל הוקמה ב־14 במאי 1948.",
                createdAt: new Date()
            }
        ]);

        await db.insert(schema.userLessonResults).values({
            id: uuidv4(),
            userId,
            lessonId,
            startedAt: new Date(Date.now() - 1000 * 60 * 30),
            completedAt: new Date(),
            answers: { c: true },
            totalScore: 100,
            createdAt: new Date()
        });

        await db.insert(schema.userWrongQuestions).values({
            id: uuidv4(),
            questionId: question2Id,
            userId
        });

        console.log("✅ Seeding finished");
    } catch (err) {
        console.error(err);
        throw new Error("❌ Failed to seed database");
    }
};

main();

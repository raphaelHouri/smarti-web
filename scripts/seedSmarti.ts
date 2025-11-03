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
        const categoryId = "61758a59-2c5e-4865-9c09-002cc0665881";
        const lessonId = uuidv4();
        const lesson2Id = uuidv4();
        const questionGroupId = uuidv4();
        const questionGroup2Id = uuidv4();
        const questionId = uuidv4();
        const question2Id = uuidv4();
        const question3Id = uuidv4();
        const question4Id = uuidv4();
        const question5Id = uuidv4();
        const question6Id = uuidv4();
        const question7Id = uuidv4();
        const question8Id = uuidv4();
        const question9Id = uuidv4();
        const question10Id = uuidv4();

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
            managedOrganization: [orgId],
            createdAt: new Date(),
            organizationYearId: orgYearId,
            // userSettingsId: settingsId,
            experience: 100,
            geniusScore: 200,
        });

        await db.insert(schema.userSettings).values({
            id: settingsId,
            userId,
            grade_class: "2nd Grade",
            gender: "female",
            avatar: "girl.svg"
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
            receiptId: "stripe-user-123",
            couponId,
            createdAt: new Date(),
            planId
        });

        await db.insert(schema.lessonCategory).values({
            id: categoryId,
            categoryType: "תרגול בעברית",
            title: "תרגול בעברית",
            description: "קטגוריה לתרגול שאלות בעברית",
            createdAt: new Date(),
            imageSrc: "fr.svg"
        });
        // Add new categories
        const category2Id = uuidv4();
        const category3Id = uuidv4();

        await db.insert(schema.lessonCategory).values([
            {
                id: category2Id,
                categoryType: "תרגול באנגלית",
                title: "תרגול באנגלית",
                description: "קטגוריה לתרגול שאלות באנגלית",
                createdAt: new Date(),
                imageSrc: "en.svg"
            },
            {
                id: category3Id,
                categoryType: "תרגול במתמטיקה",
                title: "תרגול במתמטיקה",
                description: "קטגוריה לתרגול שאלות במתמטיקה",
                createdAt: new Date(),
                imageSrc: "math.svg"
            }
        ]);

        // Add lessons for the new categories
        const lesson3Id = uuidv4();
        const lesson4Id = uuidv4();
        const lesson5Id = uuidv4();

        await db.insert(schema.lessons).values([
            {
                id: lesson3Id,
                lessonCategoryId: category2Id,
                lessonOrder: 1,
                isPremium: true,
                createdAt: new Date()
            },
            {
                id: lesson4Id,
                lessonCategoryId: category3Id,
                lessonOrder: 1,
                isPremium: false,
                createdAt: new Date()
            },
            {
                id: lesson5Id,
                lessonCategoryId: category3Id,
                lessonOrder: 2,
                isPremium: true,
                createdAt: new Date()
            }
        ]);

        // Add questions for the new categories
        const question11Id = uuidv4();
        const question12Id = uuidv4();
        const question13Id = uuidv4();
        const question14Id = uuidv4();
        const question15Id = uuidv4();

        await db.insert(schema.questions).values([
            {
                id: question11Id,
                content: "<p>What is the capital of France?</p>",
                question: "What is the capital of France?",
                format: "REGULAR",
                options: {
                    a: "Berlin",
                    b: "Madrid",
                    c: "Paris",
                    d: "Rome"
                },
                topicType: "Geography",
                categoryId: category2Id,
                explanation: "Paris is the capital of France.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question12Id,
                content: "<p>What is 5 + 7?</p>",
                question: "What is 5 + 7?",
                format: "REGULAR",
                options: {
                    a: "10",
                    b: "11",
                    c: "12",
                    d: "13"
                },
                topicType: "Mathematics",
                categoryId: category3Id,
                explanation: "5 + 7 equals 12.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question13Id,
                content: "<p>What is the largest planet in our solar system?</p>",
                question: "What is the largest planet in our solar system?",
                format: "REGULAR",
                options: {
                    a: "Earth",
                    b: "Mars",
                    c: "Jupiter",
                    d: "Saturn"
                },
                topicType: "Astronomy",
                categoryId: category2Id,
                explanation: "Jupiter is the largest planet in our solar system.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question14Id,
                content: "<p>What is 9 x 6?</p>",
                question: "What is 9 x 6?",
                format: "REGULAR",
                options: {
                    a: "54",
                    b: "56",
                    c: "58",
                    d: "60"
                },
                topicType: "Mathematics",
                categoryId: category3Id,
                explanation: "9 x 6 equals 54.",
                createdAt: new Date(),
                managerId: uuidv4()

            },
            {
                id: question15Id,
                content: "<p>What is the synonym of 'happy'?</p>",
                question: "What is the synonym of 'happy'?",
                format: "REGULAR",
                options: {
                    a: "Sad",
                    b: "Angry",
                    c: "Joyful",
                    d: "Tired"
                },
                topicType: "English",
                categoryId: category2Id,
                explanation: "'Joyful' is a synonym of 'happy'.",
                createdAt: new Date(),
                managerId: uuidv4()
            }
        ]);

        // Add question groups for the new lessons
        const questionGroup3Id = uuidv4();
        const questionGroup4Id = uuidv4();
        const questionGroup5Id = uuidv4();

        await db.insert(schema.lessonQuestionGroups).values([
            {
                id: questionGroup3Id,
                lessonId: lesson3Id,
                categoryId: category2Id,
                questionList: [question11Id, question15Id],
                time: 600,
                createdAt: new Date()
            },
            {
                id: questionGroup4Id,
                lessonId: lesson4Id,
                categoryId: category3Id,
                questionList: [question12Id, question14Id],
                time: 900,
                createdAt: new Date()
            },
            {
                id: questionGroup5Id,
                lessonId: lesson5Id,
                categoryId: category3Id,
                questionList: [question12Id, question14Id],
                time: 900,
                createdAt: new Date()
            }
        ]);

        await db.insert(schema.lessons).values([
            {
                id: lessonId,
                lessonCategoryId: categoryId,
                lessonOrder: 1,
                isPremium: false,
                createdAt: new Date()
            },
            {
                id: lesson2Id,
                lessonCategoryId: categoryId,
                lessonOrder: 2,
                isPremium: true,
                createdAt: new Date()
            }
        ]);

        await db.insert(schema.lessonQuestionGroups).values([
            {
                id: questionGroupId,
                lessonId,
                categoryId: categoryId,
                questionList: [questionId, question3Id, question4Id, question5Id, question6Id, question7Id, question8Id, question9Id, question10Id],
                time: 600,
                createdAt: new Date()
            },
            {
                id: questionGroup2Id,
                lessonId: lesson2Id,
                categoryId: categoryId,
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
                format: "REGULAR",
                options: {

                    b: "חיפה",
                    a: "תל אביב",
                    d: "אשדוד",
                    c: "ירושלים"

                },
                topicType: "ארץ ישראל",
                categoryId: categoryId,
                explanation: "ירושלים היא עיר הבירה של מדינת ישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question2Id,
                content: "<p>מתי קמה מדינת ישראל?</p>",
                question: "מתי קמה מדינת ישראל?",
                format: "REGULAR",
                options: {
                    a: "1945",
                    b: "1947",
                    c: "1948",
                    d: "1950"
                },
                topicType: "היסטוריה",
                categoryId: categoryId,
                explanation: "מדינת ישראל הוקמה ב־14 במאי 1948.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question3Id,
                content: "<p>מהי השפה הרשמית של ישראל?</p>",
                question: "מהי השפה הרשמית של ישראל?",
                format: "REGULAR",
                options: {
                    a: "אנגלית",
                    b: "עברית",
                    c: "ערבית",
                    d: "רוסית"
                },
                topicType: "שפה",
                categoryId: categoryId,
                explanation: "עברית היא השפה הרשמית של ישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question4Id,
                content: "<p>איזה ים נמצא במזרח ישראל?</p>",
                question: "איזה ים נמצא במזרח ישראל?",
                format: "REGULAR",
                options: {
                    a: "ים התיכון",
                    b: "ים סוף",
                    c: "ים המלח",
                    d: "ים כנרת"
                },
                topicType: "גיאוגרפיה",
                categoryId: categoryId,
                explanation: "ים המלח נמצא במזרח ישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question5Id,
                content: "<p>מהו ההר הגבוה ביותר בישראל?</p>",
                question: "מהו ההר הגבוה ביותר בישראל?",
                format: "REGULAR",
                options: {
                    a: "הר תבור",
                    b: "הר מירון",
                    c: "הר חרמון",
                    d: "הר הכרמל"
                },
                topicType: "גיאוגרפיה",
                categoryId: categoryId,
                explanation: "הר חרמון הוא ההר הגבוה ביותר בישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question6Id,
                content: "<p>מי היה ראש הממשלה הראשון של ישראל?</p>",
                question: "מי היה ראש הממשלה הראשון של ישראל?",
                format: "REGULAR",
                options: {
                    a: "גולדה מאיר",
                    b: "בנימין נתניהו",
                    c: "דוד בן גוריון",
                    d: "יצחק רבין"
                },
                topicType: "היסטוריה",
                categoryId: categoryId,
                explanation: "דוד בן גוריון היה ראש הממשלה הראשון של ישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question7Id,
                content: "<p>מהי עיר הנמל המרכזית של ישראל?</p>",
                question: "מהי עיר הנמל המרכזית של ישראל?",
                format: "REGULAR",
                options: {
                    a: "אשדוד",
                    b: "חיפה",
                    c: "תל אביב",
                    d: "עכו"
                },
                topicType: "גיאוגרפיה",
                categoryId: categoryId,
                explanation: "חיפה היא עיר הנמל המרכזית של ישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question8Id,
                content: "<p>באיזו שנה נכבשה ירושלים במלחמת ששת הימים?</p>",
                question: "באיזו שנה נכבשה ירושלים במלחמת ששת הימים?",
                format: "REGULAR",
                options: {
                    a: "1967",
                    b: "1973",
                    c: "1956",
                    d: "1948"
                },
                topicType: "היסטוריה",
                categoryId: categoryId,
                explanation: "ירושלים נכבשה מחדש במלחמת ששת הימים בשנת 1967.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question9Id,
                content: "<p>מהו הנהר הארוך ביותר בישראל?</p>",
                question: "מהו הנהר הארוך ביותר בישראל?",
                format: "REGULAR",
                options: {
                    a: "הירקון",
                    b: "הירדן",
                    c: "הבשור",
                    d: "הקישון"
                },
                topicType: "גיאוגרפיה",
                categoryId: categoryId,
                explanation: "הירדן הוא הנהר הארוך ביותר בישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            },
            {
                id: question10Id,
                content: "<p>איזו עיר נחשבת לעיר הבירה הכלכלית של ישראל?</p>",
                question: "איזו עיר נחשבת לעיר הבירה הכלכלית של ישראל?",
                format: "REGULAR",
                options: {
                    a: "תל אביב",
                    b: "חיפה",
                    c: "ירושלים",
                    d: "באר שבע"
                },
                topicType: "כלכלה",
                categoryId: categoryId,
                explanation: "תל אביב נחשבת לעיר הבירה הכלכלית של ישראל.",
                createdAt: new Date(),
                managerId: uuidv4()
            }
        ]);

        await db.insert(schema.userLessonResults).values({
            id: uuidv4(),
            userId,
            lessonId,
            startedAt: new Date(Date.now() - 1000 * 60 * 30),
            completedAt: new Date(),
            answers: { c: true },
            rightQuestions: 1,
            totalQuestions: 1,
            createdAt: new Date()
        });

        await db.insert(schema.userWrongQuestions).values({
            id: uuidv4(),
            questionId: question2Id,
            userId
        });
        await db.insert(schema.feedbacks).values({
            id: uuidv4(),
            userId,
            screenName: "LessonScreen",
            identifier: lessonId,
            rate: "5",
            title: "Great Lesson!",
            description: "The lesson was very informative and engaging.",
            createdAt: new Date()
        });
        console.log("✅ Seeding finished");
    } catch (err) {
        console.error(err);
        throw new Error("❌ Failed to seed database");
    }
};

main();

import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "@/db/schemaSmarti";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
    try {
        console.log("Resetting started");
        await db.execute("DROP SCHEMA public CASCADE;");
        await db.execute("CREATE SCHEMA public;");
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

        console.log("Resetting finished");
    }
    catch (err) {
        console.error(err);
        throw new Error("Failed to Reset database")
    }
}

main()
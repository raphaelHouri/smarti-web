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

        const categoryId = "61758a59-2c5e-4865-9c09-002cc0665881";
        const categoryId3 = "45688a59-2c5e-4865-9c09-002cc0665881";


        await db.insert(schema.lessonCategory).values({
            id: categoryId,
            categoryType: "תרגול בעברית",
            title: "תרגול בעברית",
            description: "קטגוריה לתרגול שאלות בעברית",
            createdAt: new Date(),
            imageSrc: "/hebrew.svg"
        });
        const category2Id = "77ddfdc8-b47a-4c7f-ae6b-9ce6ea25ac98";


        await db.insert(schema.lessonCategory).values([

            {
                id: category2Id,
                categoryType: "תרגול במתמטיקה",
                title: "תרגול במתמטיקה",
                description: "קטגוריה לתרגול שאלות במתמטיקה",
                createdAt: new Date(),
                imageSrc: "/math.svg"
            },
            {
                id: category2Id,
                categoryType: "תרגול בחנים",
                title: "תרגול בחנים",
                description: "קטגוריה לתרגול  בחנים",
                createdAt: new Date(),
                imageSrc: "/test.svg"
            }
        ]);

        console.log("✅ Seeding finished");
    } catch (err) {
        console.error(err);
        throw new Error("❌ Failed to seed database");
    }
};

main();

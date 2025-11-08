import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function upsertProducts() {
    // Ensure base products exist and are updated
    // system product
    const systemProduct = await db.query.products.findFirst({
        where: (t, { eq }) => eq(t.productType, "system" as any),
    });
    const systemProductData = {
        serviceType: "system" as any,
        productType: "system" as any,
        name: "Preparation System",
        description: "Monthly Preparation Program",
        createdAt: new Date(),
        displayData: {
            title: "Preparation System",
            subtitle: "Monthly Preparation Program",
            periodLabel: "Monthly",
            monthlyPrice: "$40",
            features: [
                "All lessons unlocked",
                "Practice tests & exams",
                "Personalized analytics",
                "Email support",
            ],
        },
    };
    let systemProductId = systemProduct?.id;
    if (systemProduct) {
        await db.update(schema.products)
            .set(systemProductData)
            .where(eq(schema.products.id, systemProduct.id));
    } else {
        const inserted = await db.insert(schema.products)
            .values({ id: crypto.randomUUID(), ...systemProductData })
            .returning();
        systemProductId = inserted[0].id;
    }

    // book product (bookStep1)
    const bookProduct = await db.query.products.findFirst({
        where: (t, { eq }) => eq(t.productType, "bookStep1" as any),
    });
    const bookProductData = {
        serviceType: "system" as any,
        productType: "bookStep1" as any,
        name: "Preparation Booklet",
        description: "Preparation Booklet for Grade B Stage A",
        createdAt: new Date(),
        displayData: {
            title: "Preparation Booklet",
            subtitle: "Preparation Booklet for Grade B Stage A",
            year: "2025",
            stage: "Stage A",
            grade: "Grade B",
            productTypeLabel: "Home Printing",
            price: "$35",
            featuresTitle: "What's included in the booklet:",
            features: [
                "Comprehensive Reading Comprehension Chapter",
                "Arithmetic Chapter with Diverse Exercises",
                "Exams Chapter for Practice",
                "Useful Tips for Parents and Children",
            ],
        },
    };
    let bookProductId = bookProduct?.id;
    if (bookProduct) {
        await db.update(schema.products)
            .set(bookProductData)
            .where(eq(schema.products.id, bookProduct.id));
    } else {
        const inserted = await db.insert(schema.products)
            .values({ id: crypto.randomUUID(), ...bookProductData })
            .returning();
        bookProductId = inserted[0].id;
    }

    return { systemProductId: systemProductId!, bookProductId: bookProductId! };
}

async function upsertPlans(systemProductId: string, bookProductId: string) {
    type PlanSeed = {
        name: string;
        description: string;
        days: number;
        price: number;
        packageType: "system" | "book";
        productsIds: string[];
        displayData?: any;
        needsBookPlanId?: boolean;
    };

    // First pass: Create/update book plan to get its ID
    const bookPlanSeed: PlanSeed = {
        name: "Study Books Collection",
        description: "Complete study materials in digital and physical format",
        days: 0,
        price: 35,
        packageType: "book",
        productsIds: [bookProductId],
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "Digital PDF (instant)",
                "Physical book (shipped)",
                "400+ practice questions",
                "Detailed solutions",
                "Study guides",
            ],
            badge: "Save $5",
            badgeColor: "green",
        },
    };

    let bookPlanId: string;
    const existingBookPlan = await db.query.plans.findFirst({
        where: (t, { eq }) => eq(t.name, bookPlanSeed.name),
    });
    if (existingBookPlan) {
        await db
            .update(schema.plans)
            .set({
                packageType: bookPlanSeed.packageType as any,
                productsIds: bookPlanSeed.productsIds as any,
                name: bookPlanSeed.name,
                description: bookPlanSeed.description,
                days: bookPlanSeed.days,
                price: bookPlanSeed.price,
                displayData: bookPlanSeed.displayData,
                createdAt: new Date(),
            })
            .where(eq(schema.plans.id, existingBookPlan.id));
        bookPlanId = existingBookPlan.id;
    } else {
        const inserted = await db.insert(schema.plans).values({
            id: crypto.randomUUID(),
            packageType: bookPlanSeed.packageType as any,
            productsIds: bookPlanSeed.productsIds as any,
            name: bookPlanSeed.name,
            description: bookPlanSeed.description,
            days: bookPlanSeed.days,
            price: bookPlanSeed.price,
            displayData: bookPlanSeed.displayData,
            createdAt: new Date(),
        }).returning();
        bookPlanId = inserted[0].id;
    }

    // Second pass: Create/update system plans with book plan reference
    const seeds: PlanSeed[] = [
        {
            name: "Trial Period",
            description: "Test our preparation program",
            days: 7,
            price: 12,
            packageType: "system",
            productsIds: [systemProductId],
            displayData: {
                icon: "Rocket",
                color: "blue",
                features: [
                    "1 week access",
                    "Basic lessons",
                    "Progress tracking",
                    "Community support",
                ],
            },
        },
        {
            name: "Standard Prep",
            description: "Comprehensive monthly preparation program",
            days: 30,
            price: 40,
            packageType: "system",
            productsIds: [systemProductId],
            displayData: {
                icon: "Rocket",
                color: "blue",
                features: [
                    "All lessons unlocked",
                    "Practice tests",
                    "Analytics dashboard",
                    "Email support",
                ],
                badge: "Popular",
                badgeColor: "yellow",
                addBookOption: {
                    price: "$60",
                    originalPrice: "$75",
                    savings: "Save $15",
                    productId: bookProductId,
                },
            },
        },
        {
            name: "Extended Prep",
            description: "Long-term preparation with priority support",
            days: 180,
            price: 199,
            packageType: "system",
            productsIds: [systemProductId],
            displayData: {
                icon: "Rocket",
                color: "blue",
                features: [
                    "All content unlocked",
                    "Priority support",
                    "Mock exams",
                    "Progress reports",
                    "Study schedule",
                ],
                badge: "Save $41",
                badgeColor: "green",
                addBookOption: {
                    price: "$215",
                    originalPrice: "$234",
                    savings: "Save $19",
                    productId: bookProductId,
                },
            },
        },
    ];

    for (const seed of seeds) {
        const existing = await db.query.plans.findFirst({
            where: (t, { eq }) => eq(t.name, seed.name),
        });
        if (existing) {
            await db
                .update(schema.plans)
                .set({
                    packageType: seed.packageType as any,
                    productsIds: seed.productsIds as any,
                    name: seed.name,
                    description: seed.description,
                    days: seed.days,
                    price: seed.price,
                    displayData: seed.displayData,
                    createdAt: new Date(),
                })
                .where(eq(schema.plans.id, existing.id));
        } else {
            await db.insert(schema.plans).values({
                id: crypto.randomUUID(),
                packageType: seed.packageType as any,
                productsIds: seed.productsIds as any,
                name: seed.name,
                description: seed.description,
                days: seed.days,
                price: seed.price,
                displayData: seed.displayData,
                createdAt: new Date(),
            });
        }
    }
}

async function main() {
    try {
        console.log("Seeding products and plans started");
        const { systemProductId, bookProductId } = await upsertProducts();
        await upsertPlans(systemProductId, bookProductId);
        console.log("✅ Seeding products and plans finished");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();



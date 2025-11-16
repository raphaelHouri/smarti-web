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
        where: (t, { eq }) => eq(t.productType, "system1"),
    });
    const systemProductData = {
        productType: "system1" as const,
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

    // Helper function to upsert a book product
    const upsertBookProduct = async (productType: "bookStep1" | "bookStep2" | "bookStep3", name: string, description: string, displayData: any) => {
        const existingProduct = await db.query.products.findFirst({
            where: (t, { eq }) => eq(t.productType, productType),
        });
        const productData: {
            productType: "bookStep1" | "bookStep2" | "bookStep3";
            name: string;
            description: string;
            createdAt: Date;
            displayData: any;
        } = {
            productType,
            name,
            description,
            createdAt: new Date(),
            displayData,
        };
        if (existingProduct) {
            await db.update(schema.products)
                .set(productData)
                .where(eq(schema.products.id, existingProduct.id));
            return existingProduct.id;
        } else {
            const inserted = await db.insert(schema.products)
                .values({ id: crypto.randomUUID(), ...productData })
                .returning();
            return inserted[0].id;
        }
    };

    // book product (bookStep1)
    const bookStep1ProductId = await upsertBookProduct(
        "bookStep1",
        "Preparation Booklet Step 1",
        "Preparation Booklet for Grade B Stage A",
        {
            title: "Preparation Booklet Step 1",
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
        }
    );

    // book product (bookStep2)
    const bookStep2ProductId = await upsertBookProduct(
        "bookStep2",
        "Preparation Booklet Step 2",
        "Preparation Booklet for Grade B Stage B",
        {
            title: "Preparation Booklet Step 2",
            subtitle: "Preparation Booklet for Grade B Stage B",
            year: "2025",
            stage: "Stage B",
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
        }
    );

    // book product (bookStep3)
    const bookStep3ProductId = await upsertBookProduct(
        "bookStep3",
        "Preparation Booklet Step 3",
        "Preparation Booklet for Grade B Stage C",
        {
            title: "Preparation Booklet Step 3",
            subtitle: "Preparation Booklet for Grade B Stage C",
            year: "2025",
            stage: "Stage C",
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
        }
    );

    return {
        systemProductId: systemProductId!,
        bookStep1ProductId,
        bookStep2ProductId,
        bookStep3ProductId,
    };
}

async function upsertPlans(systemProductId: string, bookStep1ProductId: string, bookStep2ProductId: string, bookStep3ProductId: string) {
    type PlanSeed = {
        name: string;
        description: string;
        internalDescription?: string;
        days: number;
        price: number;
        packageType: "system" | "book";
        productsIds: string[];
        displayData?: any;
        needsBookPlanId?: boolean;
    };

    // Helper function to upsert a book plan
    const upsertBookPlan = async (planSeed: PlanSeed) => {
        const existingPlan = await db.query.plans.findFirst({
            where: (t, { eq }) => eq(t.name, planSeed.name),
        });
        if (existingPlan) {
            await db
                .update(schema.plans)
                .set({
                    packageType: planSeed.packageType as any,
                    productsIds: planSeed.productsIds as any,
                    name: planSeed.name,
                    description: planSeed.description,
                    days: planSeed.days,
                    price: planSeed.price,
                    displayData: planSeed.displayData,
                    internalDescription: planSeed.internalDescription ?? planSeed.description,
                    createdAt: new Date(),
                })
                .where(eq(schema.plans.id, existingPlan.id));
            return existingPlan.id;
        } else {
            const inserted = await db.insert(schema.plans).values({
                id: crypto.randomUUID(),
                packageType: planSeed.packageType as any,
                productsIds: planSeed.productsIds as any,
                name: planSeed.name,
                description: planSeed.description,
                days: planSeed.days,
                price: planSeed.price,
                displayData: planSeed.displayData,
                internalDescription: planSeed.internalDescription ?? planSeed.description,
                createdAt: new Date(),
            }).returning();
            return inserted[0].id;
        }
    };

    // Create/update book plans for each step
    const bookStep1PlanId = await upsertBookPlan({
        name: "Study Book Step 1",
        description: "Preparation Booklet for Grade B Stage A",
        days: 0,
        price: 35,
        packageType: "book",
        productsIds: [bookStep1ProductId],
        internalDescription: "Book Step 1",
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
            badge: "Step 1",
            badgeColor: "green",
        },
    });

    const bookStep2PlanId = await upsertBookPlan({
        name: "Study Book Step 2",
        description: "Preparation Booklet for Grade B Stage B",
        days: 0,
        price: 35,
        packageType: "book",
        productsIds: [bookStep2ProductId],
        internalDescription: "Book Step 2",
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
            badge: "Step 2",
            badgeColor: "green",
        },
    });

    const bookStep3PlanId = await upsertBookPlan({
        name: "Study Book Step 3",
        description: "Preparation Booklet for Grade B Stage C",
        days: 0,
        price: 35,
        packageType: "book",
        productsIds: [bookStep3ProductId],
        internalDescription: "Book Step 3",
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
            badge: "Step 3",
            badgeColor: "green",
        },
    });

    // Also create a bundle plan with all three books
    const bookBundlePlanId = await upsertBookPlan({
        name: "Study Books Collection",
        description: "Complete study materials in digital and physical format - All 3 Steps",
        days: 0,
        price: 100,
        packageType: "book",
        productsIds: [bookStep1ProductId, bookStep2ProductId, bookStep3ProductId],
        internalDescription: "Books bundle - All steps",
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "All 3 book steps included",
                "Digital PDF (instant)",
                "Physical books (shipped)",
                "1200+ practice questions",
                "Detailed solutions",
                "Study guides",
            ],
            badge: "Save $5",
            badgeColor: "green",
        },
    });

    // Second pass: Create/update system plans with book plan reference
    const seeds: PlanSeed[] = [
        {
            name: "Trial Period",
            description: "Test our preparation program",
            internalDescription: "Trial access",
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
            internalDescription: "Monthly subscription",
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
                    productId: bookStep1ProductId,
                },
            },
        },
        {
            name: "Extended Prep",
            description: "Long-term preparation with priority support",
            internalDescription: "6 months bundle",
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
                    productId: bookStep1ProductId,
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
                    internalDescription: seed.internalDescription ?? seed.description,
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
                internalDescription: seed.internalDescription ?? seed.description,
                createdAt: new Date(),
            });
        }
    }
}

async function main() {
    try {
        console.log("Seeding products and plans started");
        const { systemProductId, bookStep1ProductId, bookStep2ProductId, bookStep3ProductId } = await upsertProducts();
        await upsertPlans(systemProductId, bookStep1ProductId, bookStep2ProductId, bookStep3ProductId);
        console.log("✅ Seeding products and plans finished");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();



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
        name: "מערכת למידה - 30 ימים",
        description: "מערכת למידה - 30 ימים",
        createdAt: new Date(),
        displayData: {
            title: "מערכת למידה",
            subtitle: "תוכנית הכנה חודשית",
            periodLabel: "חודשי",
            monthlyPrice: "99",
            description: "תרגולים ומבחנים לתרגול במחשב ובפלאפון לקראת מבחן כיתה ב' - שלב א'",
            features: [
            "תרגולים לפי נושאים",
            "מבחני דמה למבחן",
            "פתרונות מפורטים",
            "תרגול טעויות",
            "תחרויות ושלבים",
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
        "כיתה ב' - שלב א'",
        "חוברת הכנה לכיתה ב' - שלב א'",
        {
            title: "כיתה ב' - שלב א'",
            subtitle: "חוברת הכנה לכיתה ב' - שלב א'",
            year: "2025",
            stage: "שלב א'",
            grade: "כיתה ב'",
            productTypeLabel: "הדפסה ביתית",
            price: "$35",
            pages: 115,
            description: "חוברת הכנה המדמה את המבחן האמיתי בדיוק כמו בשטח – אפשרות למבחן מודפס על נייר, כמו בבית הספר – ולא על מחשב! ",
            featuresTitle: "מה כוללת החוברת:",
            features: [
                "מידע חשוב להורים",
                "המלצות וטיפים לילדים",
                "פרק הבנת הנקרא",
                "פרק חשבון",
                "סימולציות",
                "פתרונות מלאים לכל השאלות",
            ],
        }
    );

    // book product (bookStep2)
    const bookStep2ProductId = await upsertBookProduct(
        "bookStep2",
        "כיתה ב' - שלב ב'",
        "חוברת הכנה לכיתה ב' - שלב ב'",
        {
            title: "כיתה ב' - שלב ב'",
            subtitle: "חוברת הכנה לכיתה ב' - שלב ב'",
            year: "2025",
            stage: "שלב ב'",
            grade: "כיתה ב'",
            productTypeLabel: "הדפסה ביתית",
            price: "$35",
            pages: 000,
            description: "חוברת הכנה המדמה את המבחן האמיתי בדיוק כמו בשטח – אפשרות למבחן מודפס על נייר, כמו בבית הספר – ולא על מחשב! ",
            featuresTitle: "מה כוללת החוברת:",
            features: [
                "מידע חשוב להורים",
                "המלצות וטיפים לילדים",
                "פרק שאלות מילוליות",
                "פרק חשבון",
                "פרק חשיבה צורנית",
                "סימולציות",
                "פתרונות מלאים לכל השאלות",
            ],
        }
    );

    // book product (bookStep3)
    const bookStep3ProductId = await upsertBookProduct(
        "bookStep3",
        "כיתה ג' - שלב ב'",
        "חוברת הכנה לכיתה ג' - שלב ב'",
        {
            title: "כיתה ג' - שלב ב'",
            subtitle: "חוברת הכנה לכיתה ג' - שלב ב'",
            year: "2025",
            stage: "שלב ב'",
            grade: "כיתה ג'",
            productTypeLabel: "הדפסה ביתית",
            price: "$35",
            pages: 148,
            description: "חוברת הכנה המדמה את המבחן האמיתי בדיוק כמו בשטח – אפשרות למבחן מודפס על נייר, כמו בבית הספר – ולא על מחשב! ",
            featuresTitle: "מה כוללת החוברת:",
            features: [
                "מידע חשוב להורים",
                "המלצות וטיפים לילדים",
                "פרק שאלות מילוליות",
                "פרק חשבון",
                "פרק חשיבה צורנית",
                "סימולציות",
                "פתרונות מלאים לכל השאלות",
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
        order?: number;
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
                    order: planSeed.order,
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
                order: planSeed.order,
                createdAt: new Date(),
            }).returning();
            return inserted[0].id;
        }
    };

    // Create/update book plans for each step
    const bookStep1PlanId = await upsertBookPlan({
        name: "כיתה ב' - שלב א'",
        description: "חוברת הכנה לכיתה ב' - שלב א'",
        days: 0,
        price: 99,
        packageType: "book",
        productsIds: [bookStep1ProductId],
        internalDescription: "חוברת כיתה ב' - שלב א'",
        order: 1,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "2 פרקי תרגול",
                "3 סימולציות",
                "115 דפים",
                "פתרונות מפורטים",
                "חוברת להדפסה (PDF)",
            ],
            badge: "כיתה ב'",
            badgeColor: "green",
        },
    });

    const bookStep2PlanId = await upsertBookPlan({
        name: "כיתה ב' - שלב ב'",
        description: "חוברת הכנה לכיתה ב' - שלב ב'",
        days: 0,
        price: 189,
        packageType: "book",
        productsIds: [bookStep2ProductId],
        internalDescription: "חוברת הכנה לכיתה ב' - שלב ב'",
        order: 2,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
            "3 פרקי תרגול",
            "3 סימולציות",
            "??? דפים",
            "פתרונות מפורטים",
            "חוברת להדפסה (PDF)",
            ],
            badge: "כיתה ב'",
            badgeColor: "green",
        },
    });

    const bookStep3PlanId = await upsertBookPlan({
        name: "כיתה ג' - שלב ב'",
        description: "חוברת הכנה לכיתה ג' - שלב ב'",
        days: 0,
        price: 199,
        packageType: "book",
        productsIds: [bookStep3ProductId],
        internalDescription: "חוברת הכנה לכיתה ג' - שלב ב'",
        order: 3,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
            "3 פרקי תרגול",
            "3 סימולציות",
            "148 דפים",
            "פתרונות מפורטים",
            "חוברת להדפסה (PDF)",
            ],
            badge: "כיתה ג'",
            badgeColor: "green",
        },
    });

    // Also create a bundle plan with all three books
    const bookBundlePlanId = await upsertBookPlan({
        name: "כיתה ב' - שלב א' + שלב ב'",
        description: "חומרי לימוד מלאים בפורמט דיגיטלי ומודפס - כל 3 השלבים",
        days: 0,
        price: 269,
        packageType: "book",
        productsIds: [bookStep1ProductId, bookStep2ProductId],
        internalDescription: "חבילת חוברות - כיתה ב' - שלב א' + שלב ב'",
        order: 4,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "חוברת הכנה לכיתה ב' - שלב א'",
                "חוברת הכנה לכיתה ב' - שלב ב'",
                "פתרונות מפורטים",
                "חוברת להדפסה (PDF)",
            ],
            badge: "כיתה ב'",
            badgeColor: "green",
        },
    });

    // Second pass: Create/update system plans with book plan reference
    const seeds: PlanSeed[] = [
        {
            name: "מערכת למידה - 30 ימים",
            description: "תרגולים ומבחנים לתרגול במחשב ובפלאפון לקראת מבחן כיתה ב' - שלב א'",
            internalDescription: "מערכת למידה כיתה ב' שלב א' - 30 ימים",
            days: 30,
            price: 99,
            packageType: "system",
            productsIds: [systemProductId],
            order: 1,
            displayData: {
                icon: "Rocket",
                color: "blue",
                features: [
                    "תרגולים לפי נושאים",
                    "מבחני דמה למבחן",
                    "פתרונות מפורטים",
                    "תרגול טעויות",
                    "תחרויות ושלבים",
                ],
            },
        },
        {
            name: "הכנה סטנדרטית",
            description: "תוכנית הכנה חודשית מקיפה",
            internalDescription: "מנוי חודשי",
            days: 30,
            price: 40,
            packageType: "system",
            productsIds: [systemProductId],
            order: 2,
            displayData: {
                icon: "Rocket",
                color: "blue",
                features: [
                    "כל השיעורים פתוחים",
                    "מבחני תרגול",
                    "לוח בקרה אנליטי",
                    "תמיכה במייל",
                ],
                badge: "פופולרי",
                badgeColor: "yellow",
                addBookOption: {
                    price: "$60",
                    originalPrice: "$75",
                    savings: "חסכו $15",
                    productId: bookStep1ProductId,
                },
            },
        },
        {
            name: "הכנה מורחבת",
            description: "הכנה לטווח ארוך עם תמיכה מועדפת",
            internalDescription: "חבילת 6 חודשים",
            days: 180,
            price: 199,
            packageType: "system",
            productsIds: [systemProductId],
            order: 3,
            displayData: {
                icon: "Rocket",
                color: "blue",
                features: [
                    "כל התוכן פתוח",
                    "תמיכה מועדפת",
                    "מבחנים סימולציה",
                    "דוחות התקדמות",
                    "לוח זמנים ללימוד",
                ],
                badge: "חסכו $41",
                badgeColor: "green",
                addBookOption: {
                    price: "$215",
                    originalPrice: "$234",
                    savings: "חסכו $19",
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
                    order: seed.order,
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
                order: seed.order,
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

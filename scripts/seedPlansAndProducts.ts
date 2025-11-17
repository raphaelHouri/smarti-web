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
        name: "מערכת הכנה",
        description: "תוכנית הכנה חודשית",
        createdAt: new Date(),
        displayData: {
            title: "מערכת הכנה",
            subtitle: "תוכנית הכנה חודשית",
            periodLabel: "חודשי",
            monthlyPrice: "$40",
            description: "תוכניות למידה מובנות, מבחני תרגול ואנליטיקה בזמן אמת — הכל בתוך מערכת יפה וידידותית לילדים שתוכננה לשפר ביצועים במבחני מחוננים.",
            features: [
                "כל השיעורים פתוחים",
                "מבחני תרגול ובחינות",
                "אנליטיקה מותאמת אישית",
                "תמיכה במייל",
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
        "חוברת הכנה שלב 1",
        "חוברת הכנה לכיתה ב' שלב א'",
        {
            title: "חוברת הכנה שלב 1",
            subtitle: "חוברת הכנה לכיתה ב' שלב א'",
            year: "2025",
            stage: "שלב א'",
            grade: "כיתה ב'",
            productTypeLabel: "הדפסה ביתית",
            price: "$35",
            pages: 115,
            description: "מעוניינים בחוברת הכנה מודפסת המדמה תנאי בחינה? תוכלו להדפיס את חוברת ההכנה בבית ולהתחיל לתרגל. החוברת כוללת 3 פרקים: הבנת הנקרא, חשבון, ופרק בחינות. בנוסף, לאורך הספר יש טיפים להורים וילדים.",
            featuresTitle: "מה כלול בחוברת:",
            features: [
                "פרק הבנת הנקרא מקיף",
                "פרק חשבון עם תרגילים מגוונים",
                "פרק בחינות לתרגול",
                "טיפים שימושיים להורים וילדים",
            ],
        }
    );

    // book product (bookStep2)
    const bookStep2ProductId = await upsertBookProduct(
        "bookStep2",
        "חוברת הכנה שלב 2",
        "חוברת הכנה לכיתה ב' שלב ב'",
        {
            title: "חוברת הכנה שלב 2",
            subtitle: "חוברת הכנה לכיתה ב' שלב ב'",
            year: "2025",
            stage: "שלב ב'",
            grade: "כיתה ב'",
            productTypeLabel: "הדפסה ביתית",
            price: "$35",
            pages: 115,
            description: "מעוניינים בחוברת הכנה מודפסת המדמה תנאי בחינה? תוכלו להדפיס את חוברת ההכנה בבית ולהתחיל לתרגל. החוברת כוללת 3 פרקים: הבנת הנקרא, חשבון, ופרק בחינות. בנוסף, לאורך הספר יש טיפים להורים וילדים.",
            featuresTitle: "מה כלול בחוברת:",
            features: [
                "פרק הבנת הנקרא מקיף",
                "פרק חשבון עם תרגילים מגוונים",
                "פרק בחינות לתרגול",
                "טיפים שימושיים להורים וילדים",
            ],
        }
    );

    // book product (bookStep3)
    const bookStep3ProductId = await upsertBookProduct(
        "bookStep3",
        "חוברת הכנה שלב 3",
        "חוברת הכנה לכיתה ב' שלב ג'",
        {
            title: "חוברת הכנה שלב 3",
            subtitle: "חוברת הכנה לכיתה ב' שלב ג'",
            year: "2025",
            stage: "שלב ג'",
            grade: "כיתה ב'",
            productTypeLabel: "הדפסה ביתית",
            price: "$35",
            pages: 115,
            description: "מעוניינים בחוברת הכנה מודפסת המדמה תנאי בחינה? תוכלו להדפיס את חוברת ההכנה בבית ולהתחיל לתרגל. החוברת כוללת 3 פרקים: הבנת הנקרא, חשבון, ופרק בחינות. בנוסף, לאורך הספר יש טיפים להורים וילדים.",
            featuresTitle: "מה כלול בחוברת:",
            features: [
                "פרק הבנת הנקרא מקיף",
                "פרק חשבון עם תרגילים מגוונים",
                "פרק בחינות לתרגול",
                "טיפים שימושיים להורים וילדים",
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
        name: "חוברת לימוד שלב 1",
        description: "חוברת הכנה לכיתה ב' שלב א'",
        days: 0,
        price: 35,
        packageType: "book",
        productsIds: [bookStep1ProductId],
        internalDescription: "חוברת שלב 1",
        order: 1,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "PDF דיגיטלי (מיידי)",
                "חוברת מודפסת (משולחת)",
                "400+ שאלות תרגול",
                "פתרונות מפורטים",
                "מדריכי לימוד",
            ],
            badge: "שלב 1",
            badgeColor: "green",
        },
    });

    const bookStep2PlanId = await upsertBookPlan({
        name: "חוברת לימוד שלב 2",
        description: "חוברת הכנה לכיתה ב' שלב ב'",
        days: 0,
        price: 35,
        packageType: "book",
        productsIds: [bookStep2ProductId],
        internalDescription: "חוברת שלב 2",
        order: 2,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "PDF דיגיטלי (מיידי)",
                "חוברת מודפסת (משולחת)",
                "400+ שאלות תרגול",
                "פתרונות מפורטים",
                "מדריכי לימוד",
            ],
            badge: "שלב 2",
            badgeColor: "green",
        },
    });

    const bookStep3PlanId = await upsertBookPlan({
        name: "חוברת לימוד שלב 3",
        description: "חוברת הכנה לכיתה ב' שלב ג'",
        days: 0,
        price: 35,
        packageType: "book",
        productsIds: [bookStep3ProductId],
        internalDescription: "חוברת שלב 3",
        order: 3,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "PDF דיגיטלי (מיידי)",
                "חוברת מודפסת (משולחת)",
                "400+ שאלות תרגול",
                "פתרונות מפורטים",
                "מדריכי לימוד",
            ],
            badge: "שלב 3",
            badgeColor: "green",
        },
    });

    // Also create a bundle plan with all three books
    const bookBundlePlanId = await upsertBookPlan({
        name: "אוסף חוברות לימוד",
        description: "חומרי לימוד מלאים בפורמט דיגיטלי ומודפס - כל 3 השלבים",
        days: 0,
        price: 100,
        packageType: "book",
        productsIds: [bookStep1ProductId, bookStep2ProductId, bookStep3ProductId],
        internalDescription: "חבילת חוברות - כל השלבים",
        order: 4,
        displayData: {
            icon: "BookOpen",
            color: "green",
            features: [
                "כל 3 שלבי החוברות כלולים",
                "PDF דיגיטלי (מיידי)",
                "חוברות מודפסות (משולחות)",
                "1200+ שאלות תרגול",
                "פתרונות מפורטים",
                "מדריכי לימוד",
            ],
            badge: "חסכו $5",
            badgeColor: "green",
        },
    });

    // Second pass: Create/update system plans with book plan reference
    const seeds: PlanSeed[] = [
        {
            name: "תקופת ניסיון",
            description: "נסו את תוכנית ההכנה שלנו",
            internalDescription: "גישה לניסיון",
            days: 7,
            price: 12,
            packageType: "system",
            productsIds: [systemProductId],
            order: 1,
            displayData: {
                icon: "Rocket",
                color: "blue",
                features: [
                    "גישה לשבוע אחד",
                    "שיעורים בסיסיים",
                    "מעקב התקדמות",
                    "תמיכה בקהילה",
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



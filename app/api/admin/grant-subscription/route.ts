import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { subscriptions, bookPurchases } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { grantBookPlanAdmin } from "@/lib/admin-grant-book";
import { and, eq, gt, inArray, sql } from "drizzle-orm";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function addDays(from: Date, days: number): Date {
    return new Date(from.getTime() + days * DAY_IN_MS);
}

function computeNewSystemUntil(existingUntil: Date | null | undefined, daysToAdd: number): Date {
    const now = new Date();
    const base =
        existingUntil && existingUntil.getTime() > now.getTime() ? existingUntil : now;
    return addDays(base, daysToAdd);
}

function daysRemaining(until: Date | null | undefined): number {
    if (!until) return 0;
    const diff = until.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / DAY_IN_MS));
}

type PlanRow = {
    id: string;
    name: string;
    description: string | null;
    internalDescription: string;
    days: number;
    price: number;
    packageType: "system" | "book";
    productsIds: string[] | null;
    systemStep: number;
};

function findPlanForProduct(productId: string, plans: PlanRow[]): PlanRow | null {
    return plans.find((plan) => (plan.productsIds ?? []).includes(productId)) ?? null;
}

async function buildCurrentPlans(userId: string) {
    const [activeSubscriptions, allPlans, allProducts] = await Promise.all([
        db.query.subscriptions.findMany({
            where: and(
                eq(subscriptions.userId, userId),
                gt(subscriptions.systemUntil, sql`NOW()`)
            ),
            columns: {
                id: true,
                productId: true,
                systemUntil: true,
                systemStep: true,
            },
        }),
        db.query.plans.findMany({
            columns: {
                id: true,
                name: true,
                description: true,
                internalDescription: true,
                days: true,
                price: true,
                packageType: true,
                productsIds: true,
                systemStep: true,
            },
        }),
        db.query.products.findMany({
            columns: {
                id: true,
                name: true,
                packageType: true,
            },
        }),
    ]);

    const productMap = new Map(allProducts.map((product) => [product.id, product]));

    type GroupKey = string;
    const groups = new Map<
        GroupKey,
        {
            plan: PlanRow | null;
            productName: string;
            packageType: "system" | "book";
            subscriptionIds: string[];
            productIds: string[];
            systemUntil: Date | null;
            systemStep: number;
        }
    >();

    for (const sub of activeSubscriptions) {
        const plan = findPlanForProduct(sub.productId, allPlans);
        const product = productMap.get(sub.productId);
        const groupKey = plan?.id ?? `product:${sub.productId}`;

        const existing = groups.get(groupKey);
        const until = sub.systemUntil ?? null;

        if (!existing) {
            groups.set(groupKey, {
                plan,
                productName: product?.name ?? "מוצר לא ידוע",
                packageType: plan?.packageType ?? product?.packageType ?? "system",
                subscriptionIds: [sub.id],
                productIds: [sub.productId],
                systemUntil: until,
                systemStep: sub.systemStep,
            });
            continue;
        }

        existing.subscriptionIds.push(sub.id);
        existing.productIds.push(sub.productId);
        if (until && (!existing.systemUntil || until > existing.systemUntil)) {
            existing.systemUntil = until;
        }
    }

    return Array.from(groups.values())
        .map((group) => ({
            planId: group.plan?.id ?? null,
            planName: group.plan?.name ?? group.productName,
            planDescription: group.plan?.description ?? null,
            internalDescription: group.plan?.internalDescription ?? null,
            packageType: group.packageType,
            defaultDays: group.plan?.days ?? null,
            price: group.plan?.price ?? null,
            systemUntil: group.systemUntil?.toISOString() ?? null,
            daysRemaining: daysRemaining(group.systemUntil),
            systemStep: group.systemStep,
            subscriptionIds: group.subscriptionIds,
            productIds: group.productIds,
        }))
        .sort((a, b) => {
            if (!a.systemUntil) return 1;
            if (!b.systemUntil) return -1;
            return new Date(b.systemUntil).getTime() - new Date(a.systemUntil).getTime();
        });
}

export async function GET(req: Request) {
    if (!(await IsAdmin())) {
        return new NextResponse("UnAuthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
        return new NextResponse("Missing email", { status: 400 });
    }

    const user = await db.query.users.findFirst({
        where: (u, { ilike }) => ilike(u.email, email),
    });

    if (!user) {
        return NextResponse.json({ user: null, currentPlans: [] });
    }

    const currentPlans = await buildCurrentPlans(user.id);

    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            systemStep: user.systemStep,
        },
        currentPlans,
        activeSubscriptions: currentPlans.flatMap((plan) =>
            plan.productIds.map((productId, index) => ({
                productId,
                systemUntil: plan.systemUntil,
                subscriptionId: plan.subscriptionIds[index] ?? null,
            }))
        ),
    });
}

export async function PATCH(req: Request) {
    if (!(await IsAdmin())) {
        return new NextResponse("UnAuthorized", { status: 401 });
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subscriptionIds = Array.isArray(body.subscriptionIds)
        ? body.subscriptionIds.filter((id: unknown): id is string => typeof id === "string")
        : [];
    const daysToAdd = body.daysToAdd !== undefined ? Number(body.daysToAdd) : undefined;
    const systemUntilRaw =
        typeof body.systemUntil === "string" ? body.systemUntil.trim() : undefined;

    if (!email || subscriptionIds.length === 0) {
        return new NextResponse("Invalid request body", { status: 400 });
    }

    if (daysToAdd === undefined && !systemUntilRaw) {
        return new NextResponse("Provide daysToAdd or systemUntil", { status: 400 });
    }

    if (daysToAdd !== undefined && (!Number.isFinite(daysToAdd) || daysToAdd < 1 || daysToAdd > 3650)) {
        return new NextResponse("Invalid daysToAdd", { status: 400 });
    }

    const user = await db.query.users.findFirst({
        where: (u, { ilike }) => ilike(u.email, email),
    });

    if (!user) {
        return new NextResponse("User not found", { status: 404 });
    }

    let newSystemUntil: Date;
    if (systemUntilRaw) {
        newSystemUntil = new Date(systemUntilRaw);
        if (Number.isNaN(newSystemUntil.getTime())) {
            return new NextResponse("Invalid systemUntil", { status: 400 });
        }
    } else {
        const subs = await db.query.subscriptions.findMany({
            where: and(
                eq(subscriptions.userId, user.id),
                inArray(subscriptions.id, subscriptionIds)
            ),
        });

        if (subs.length === 0) {
            return new NextResponse("Subscriptions not found", { status: 404 });
        }

        const latestUntil = subs.reduce<Date | null>((latest, sub) => {
            if (!sub.systemUntil) return latest;
            if (!latest || sub.systemUntil > latest) return sub.systemUntil;
            return latest;
        }, null);

        newSystemUntil = computeNewSystemUntil(latestUntil, daysToAdd!);
    }

    const updated = await db
        .update(subscriptions)
        .set({ systemUntil: newSystemUntil })
        .where(
            and(
                eq(subscriptions.userId, user.id),
                inArray(subscriptions.id, subscriptionIds)
            )
        )
        .returning({ id: subscriptions.id });

    if (updated.length === 0) {
        return new NextResponse("Subscriptions not found", { status: 404 });
    }

    const currentPlans = await buildCurrentPlans(user.id);

    return NextResponse.json({
        newSystemUntil: newSystemUntil.toISOString(),
        updatedCount: updated.length,
        currentPlans,
    });
}

export async function POST(req: Request) {
    if (!(await IsAdmin())) {
        return new NextResponse("UnAuthorized", { status: 401 });
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";
    const daysToAdd = Number(body.daysToAdd);

    if (!email || !planId || !Number.isFinite(daysToAdd) || daysToAdd < 1 || daysToAdd > 3650) {
        return new NextResponse("Invalid request body", { status: 400 });
    }

    const user = await db.query.users.findFirst({
        where: (u, { ilike }) => ilike(u.email, email),
    });

    if (!user) {
        return new NextResponse("User not found", { status: 404 });
    }

    const plan = await db.query.plans.findFirst({
        where: (p, { eq: eqFn }) => eqFn(p.id, planId),
    });

    if (!plan) {
        return new NextResponse("Plan not found", { status: 404 });
    }

    const productIds = (plan.productsIds ?? []).filter(Boolean);
    if (productIds.length === 0) {
        return new NextResponse("Plan has no products", { status: 400 });
    }

    if (plan.packageType === "book") {
        const studentName =
            typeof body.studentName === "string" ? body.studentName.trim() : "";
        const deliveryEmail =
            typeof body.deliveryEmail === "string"
                ? body.deliveryEmail.trim().toLowerCase()
                : user.email;
        const bookPassword =
            typeof body.bookPassword === "string" ? body.bookPassword.trim() : "";
        const phone = typeof body.phone === "string" ? body.phone.trim() : "";

        if (!studentName || !deliveryEmail || !bookPassword) {
            return new NextResponse(
                "Book grant requires studentName, deliveryEmail, and bookPassword",
                { status: 400 }
            );
        }

        try {
            const bookResult = await grantBookPlanAdmin({
                userId: user.id,
                planId: plan.id,
                productIds,
                systemStep: plan.systemStep,
                studentName,
                deliveryEmail,
                bookPassword,
                phone,
                daysToAdd,
            });

            const currentPlans = await buildCurrentPlans(user.id);

            return NextResponse.json({
                userName: user.name,
                userEmail: user.email,
                planName: plan.name,
                newSystemUntil: bookResult.newSystemUntil.toISOString(),
                deliveryEmail: bookResult.deliveryEmail,
                emailSent: true,
                isBookGrant: true,
                bookPassword: body.bookPassword as string,
                books: bookResult.books,
                updatedSubscriptions: bookResult.books.map((book) => ({
                    productId: book.productId,
                    newSystemUntil: bookResult.newSystemUntil.toISOString(),
                })),
                currentPlans,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Book grant failed";
            return new NextResponse(message, { status: 500 });
        }
    }

    const updatedSubscriptions: { productId: string; newSystemUntil: string }[] = [];

    for (const productId of productIds) {
        const existing = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, user.id),
                eq(subscriptions.productId, productId)
            ),
            orderBy: (s, { desc: descFn }) => [descFn(s.systemUntil)],
        });

        const newSystemUntil = computeNewSystemUntil(existing?.systemUntil ?? null, daysToAdd);

        if (existing) {
            await db
                .update(subscriptions)
                .set({
                    systemUntil: newSystemUntil,
                    systemStep: plan.systemStep,
                })
                .where(eq(subscriptions.id, existing.id));
        } else {
            await db.insert(subscriptions).values({
                id: crypto.randomUUID(),
                userId: user.id,
                productId,
                couponId: null,
                paymentTransactionId: null,
                systemUntil: newSystemUntil,
                systemStep: plan.systemStep,
                createdAt: new Date(),
            });
        }

        updatedSubscriptions.push({
            productId,
            newSystemUntil: newSystemUntil.toISOString(),
        });
    }

    const latestExpiry = updatedSubscriptions.reduce((latest, sub) => {
        const date = new Date(sub.newSystemUntil);
        return date > latest ? date : latest;
    }, new Date(0));

    const currentPlans = await buildCurrentPlans(user.id);

    return NextResponse.json({
        userName: user.name,
        userEmail: user.email,
        planName: plan.name,
        newSystemUntil: latestExpiry.toISOString(),
        updatedSubscriptions,
        currentPlans,
    });
}

export async function DELETE(req: Request) {
    if (!(await IsAdmin())) {
        return new NextResponse("UnAuthorized", { status: 401 });
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subscriptionIds = Array.isArray(body.subscriptionIds)
        ? body.subscriptionIds.filter((id: unknown): id is string => typeof id === "string")
        : [];
    const productIds = Array.isArray(body.productIds)
        ? body.productIds.filter((id: unknown): id is string => typeof id === "string")
        : [];

    if (!email || subscriptionIds.length === 0) {
        return new NextResponse("Invalid request body", { status: 400 });
    }

    const user = await db.query.users.findFirst({
        where: (u, { ilike }) => ilike(u.email, email),
    });

    if (!user) {
        return new NextResponse("User not found", { status: 404 });
    }

    const cancelledAt = new Date(Date.now() - 1000);

    const updated = await db
        .update(subscriptions)
        .set({ systemUntil: cancelledAt })
        .where(
            and(
                eq(subscriptions.userId, user.id),
                inArray(subscriptions.id, subscriptionIds)
            )
        )
        .returning({ id: subscriptions.id });

    if (updated.length === 0) {
        return new NextResponse("Subscriptions not found", { status: 404 });
    }

    if (productIds.length > 0) {
        await db
            .update(bookPurchases)
            .set({ validUntil: cancelledAt, updatedAt: new Date() })
            .where(
                and(
                    eq(bookPurchases.userId, user.id),
                    inArray(bookPurchases.productId, productIds),
                    gt(bookPurchases.validUntil, sql`NOW()`)
                )
            );
    }

    const currentPlans = await buildCurrentPlans(user.id);

    return NextResponse.json({
        cancelledCount: updated.length,
        cancelledAt: cancelledAt.toISOString(),
        currentPlans,
    });
}

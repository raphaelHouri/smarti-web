import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendMail";
import { downloadReadyHtml } from "@/emails/downloadReady";
import { getFileName } from "@/lib/book_utils";
import { createBookPurchase, getProductById, createSubscriptionsIfMissingForTransaction, clearUserCoupon, updatePaymentTransaction, getUserSystemStep, getPlan, getCoupon, getUserByAuthId, validateCoupon } from "@/db/queries";
import { calculateAmount } from "@/lib/utils";
import db from "@/db/drizzle";
import { paymentTransactions, products as ProductsTable } from "@/db/schemaSmarti";
import type { PaymentStatus } from "@/db/schemaSmarti";
import { trackServerEvent } from "@/lib/posthog-server";
import { buildSubscriptionsSuccessHtml } from "./success-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SubscriptionArrayItem = {
    userId: string;
    productId: string;
    couponId: string | null;
    paymentTransactionId: string;
    systemUntil: Date;
    systemStep: number;
    displayName: string;
    type: "system" | "book";
    downloadLink?: string;
    convertUrl?: string;
    password?: string;
};

type BookDownloadMetadata = {
    productId: string;
    downloadLink: string;
    filename: string;
    convertUrl: string | null;
    systemUntil: Date;
};

async function createBookPurchaseAndGetDownloadUrl(
    productBook: typeof ProductsTable.$inferSelect,
    studentName: string,
    email: string,
    paymentTransactionId: string,
    userId: string,
    vat_id: string,
    status: PaymentStatus
): Promise<{ downloadLink: string; filename: string }> {
    const gcsBucket = process.env.GCS_BUCKET_NAME;
    if (!gcsBucket) {
        throw new Error("Server misconfigured");
    }
    const filename = `${getFileName(userId, productBook.productType)}.pdf`;
    const downloadLink = `https://storage.cloud.google.com/${gcsBucket}/${filename}?authuser=3`;
    if (status === "fulfilled" || status === "icount" || status === "bookCreated") {
        return { downloadLink, filename };
    }

    const generated = false;

    await createBookPurchase({
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paymentTransactionId: paymentTransactionId,
        userId,
        productId: productBook.id,
        studentName: studentName,
        email: email,
        phone: "",
        filename,
        gcsBucket,
        generated,
        vatId: vat_id,
    });
    await updatePaymentTransaction(paymentTransactionId, vat_id, "bookCreated");

    return { downloadLink, filename };
}

export async function GET(request: Request) {
    const u = new URL(request.url);
    const userId = u.searchParams.get("UserId");
    if (!userId) return NextResponse.json({ error: "invalid user" }, { status: 401 });
    const user = await getUserByAuthId(userId);
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

    const planId = u.searchParams.get("PlanId");
    const bookIncluded = u.searchParams.get("bookIncluded") === "True";
    const couponCode = u.searchParams.get("CouponCode") ?? null;
    const email = u.searchParams.get("Email") ?? user?.email ?? null;
    const studentName = u.searchParams.get("StudentName") ?? null;

    if (!planId) return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    if (!couponCode) return NextResponse.json({ error: "coupon code required" }, { status: 400 });

    const plan = await getPlan(planId);
    if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

    if (bookIncluded && (!studentName || !email)) {
        return NextResponse.json({ error: "student name and email required for book purchase" }, { status: 400 });
    }

    // Validate coupon
    const systemStep = plan.systemStep;
    const validation = await validateCoupon(couponCode, systemStep);
    if (!validation.valid || !validation.coupon) {
        return NextResponse.json({ error: validation.error ?? "invalid coupon" }, { status: 400 });
    }

    const coupon = validation.coupon;

    // Check if coupon is 100% discount
    const amount = await calculateAmount(plan, coupon.id, bookIncluded);
    if (amount > 0) {
        return NextResponse.json({ error: "coupon must provide 100% discount for free purchase" }, { status: 400 });
    }

    // Check if coupon is valid for this plan
    if (coupon.planId && coupon.planId !== planId) {
        return NextResponse.json({ error: "הקופון לא תקף לתכנית זו" }, { status: 400 });
    }

    // Check book purchase if needed
    if (bookIncluded) {
        let productBookId = "";
        if (plan.packageType === "book") {
            productBookId = plan.productsIds?.[0] ?? "";
        } else {
            productBookId = (plan.displayData as { addBookOption?: { productId?: string } } | null)?.addBookOption?.productId ?? "";
        }
        if (!productBookId) {
            return NextResponse.json({ error: "product book not found" }, { status: 404 });
        }
        // Note: We skip checking for existing book purchase here to allow re-purchase with free coupon
    }

    // Create payment transaction
    const transaction = {
        userId,
        planId,
        status: "created" as const,
        email,
        studentName,
        couponId: coupon.id,
        bookIncluded,
        totalPrice: 0, // Free purchase
        systemStep: plan.systemStep,
    };

    const inserted = await db.insert(paymentTransactions).values(transaction).returning({ id: paymentTransactions.id });
    const transactionId = inserted[0]?.id;

    if (!transactionId) {
        return NextResponse.json({ error: "failed to create transaction" }, { status: 500 });
    }

    // Track checkout page view
    trackServerEvent(userId, "checkout_page_viewed", {
        systemStep: plan.systemStep,
        planId,
        planName: plan.name,
        planType: plan.packageType,
        category: plan.packageType === "book" ? "books" : "system",
        totalPrice: 0,
        couponCode: couponCode,
        bookIncluded,
        transactionId,
    });

    // Track purchase initiation
    trackServerEvent(userId, "purchase_initiated", {
        systemStep: plan.systemStep,
        planId,
        planName: plan.name,
        planType: plan.packageType,
        category: plan.packageType === "book" ? "books" : "system",
        totalPrice: 0,
        couponCode: couponCode,
        bookIncluded,
        transactionId,
    });

    // Mark transaction as paid (since it's free)
    await updatePaymentTransaction(transactionId, userId, "paid");

    // Track payment success
    trackServerEvent(userId, "payment_success", {
        systemStep: plan.systemStep,
        transactionId,
        amount: 0,
        planId,
        planType: plan.packageType,
        couponId: coupon.id,
        bookIncluded,
        paymentMethod: "free_coupon",
    });

    // Track payment completed
    trackServerEvent(userId, "payment_completed", {
        systemStep: plan.systemStep,
        transactionId,
        amount: 0,
        planId,
        planType: plan.packageType,
        couponId: coupon.id,
        bookIncluded,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? null;
    const planProductIds = plan.productsIds ?? [];

    const subscriptionArray: SubscriptionArrayItem[] = [];
    const bookDownloadInfos: BookDownloadMetadata[] = [];
    const now = Date.now();
    const planDurationMs = plan.days * DAY_IN_MS;
    // Use email username (part before @) as vat_id for free purchases
    const vat_id = email ? email.split("@")[0] : userId;

    // Process subscriptions similar to success route
    if (plan.packageType === "book") {
        for (const productId of planProductIds) {
            const product = await getProductById(productId);
            if (!product) {
                return new NextResponse("Product not found", { status: 404 });
            }

            const systemUntil = new Date(now + 365 * DAY_IN_MS);
            const { downloadLink, filename } = await createBookPurchaseAndGetDownloadUrl(
                product,
                studentName || "",
                email || "",
                transactionId,
                userId,
                vat_id,
                "paid"
            );
            const convertUrl = appUrl ? `${appUrl}/api/book/generate?userId=${userId}&productId=${product.id}` : null;

            subscriptionArray.push({
                userId,
                productId: product.id,
                couponId: coupon.id,
                paymentTransactionId: transactionId,
                systemUntil,
                systemStep: product.systemStep,
                displayName: product.name ?? "החוברת הדיגיטלית",
                type: "book",
                downloadLink,
                convertUrl: convertUrl ?? undefined,
                password: vat_id,
            });

            bookDownloadInfos.push({
                productId: product.id,
                downloadLink,
                filename,
                convertUrl,
                systemUntil,
            });
        }
    } else {
        for (const productId of planProductIds) {
            const product = await getProductById(productId);
            if (!product) {
                return new NextResponse("Product not found", { status: 404 });
            }

            const systemUntil = new Date(now + planDurationMs);
            subscriptionArray.push({
                userId,
                productId: product.id,
                couponId: coupon.id,
                paymentTransactionId: transactionId,
                systemUntil,
                systemStep: product.systemStep,
                displayName: product.name ?? "מנוי",
                type: "system",
            });
        }

        if (bookIncluded) {
            const productBookId = (plan.displayData as { addBookOption?: { productId?: string } } | null)?.addBookOption?.productId ?? "";

            if (!productBookId) {
                return new NextResponse("Product book not configured", { status: 500 });
            }
            const productBook = await getProductById(productBookId);
            if (!productBook) {
                return new NextResponse("Product book not found", { status: 404 });
            }

            const systemUntil = new Date(now + 365 * DAY_IN_MS);
            const { downloadLink, filename } = await createBookPurchaseAndGetDownloadUrl(
                productBook,
                studentName || "",
                email || "",
                transactionId,
                userId,
                vat_id,
                "paid"
            );
            const convertUrl = appUrl ? `${appUrl}/api/book/generate?userId=${userId}&productId=${productBook.id}` : null;

            subscriptionArray.push({
                userId,
                productId: productBook.id,
                couponId: coupon.id,
                paymentTransactionId: transactionId,
                systemUntil,
                systemStep: productBook.systemStep,
                displayName: productBook.name ?? "החוברת הדיגיטלית",
                type: "book",
                downloadLink,
                convertUrl: convertUrl ?? undefined,
                password: vat_id,
            });

            bookDownloadInfos.push({
                productId: productBook.id,
                downloadLink,
                filename,
                convertUrl,
                systemUntil,
            });
        }
    }

    const successHtml = buildSubscriptionsSuccessHtml(subscriptionArray);
    const response = new NextResponse(successHtml, { headers: { "content-type": "text/html; charset=utf-8" } });

    try {
        // Send email for book downloads
        if (bookDownloadInfos.length > 0) {
            const recipientEmail = email;
            if (recipientEmail) {
                const recipientName = studentName ?? "הורה יקר";
                for (const info of bookDownloadInfos) {
                    await sendEmail(
                        recipientEmail,
                        downloadReadyHtml({
                            recipient: recipientName,
                            downloadLink: info.downloadLink,
                            filename: info.filename,
                            password: vat_id,
                            expiresAt: info.systemUntil.toISOString(),
                        }),
                        "הקובץ שלך מוכן להורדה"
                    );
                }
            }
        }

        // Create subscriptions (idempotent) and mark transaction as fulfilled
        if (subscriptionArray.length > 0) {
            await createSubscriptionsIfMissingForTransaction(
                subscriptionArray.map((s) => ({
                    userId: s.userId,
                    productId: s.productId,
                    couponId: s.couponId ?? null,
                    paymentTransactionId: s.paymentTransactionId,
                    systemUntil: s.systemUntil,
                    systemStep: s.systemStep,
                })),
                transactionId
            );

            // Track subscription creation
            subscriptionArray.forEach((subscription) => {
                trackServerEvent(userId, "subscription_created", {
                    systemStep: subscription.systemStep,
                    subscriptionId: subscription.paymentTransactionId,
                    productId: subscription.productId,
                    productType: subscription.type,
                    validUntil: subscription.systemUntil.toISOString(),
                    planId,
                });
            });
        }

        await updatePaymentTransaction(transactionId, vat_id, "fulfilled");

        // Track purchase completed
        trackServerEvent(userId, "purchase_completed", {
            systemStep: plan.systemStep,
            transactionId,
            amount: 0,
            planId,
            planName: plan.name,
            planType: plan.packageType,
            category: plan.packageType === "book" ? "books" : "system",
            couponId: coupon.id,
            bookIncluded,
            subscriptionsCreated: subscriptionArray.length,
        });

        // Clear saved coupon if it was used
        const userSystemStep = await getUserSystemStep(userId);
        await clearUserCoupon(userId, userSystemStep);
    } catch (e) {
        console.error("Background task failed:", e);
    }

    return response;
}


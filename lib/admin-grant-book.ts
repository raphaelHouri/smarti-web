import db from "@/db/drizzle";
import { bookPurchases, paymentTransactions, subscriptions } from "@/db/schemaSmarti";
import { createBookPurchase, getProductById } from "@/db/queries";
import { downloadReadyHtml } from "@/emails/downloadReady";
import { getFileName } from "@/lib/book_utils";
import { sendEmail } from "@/lib/sendMail";
import { and, eq } from "drizzle-orm";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type AdminBookGrantInput = {
    userId: string;
    planId: string;
    productIds: string[];
    systemStep: number;
    studentName: string;
    deliveryEmail: string;
    bookPassword: string;
    phone?: string;
    daysToAdd: number;
};

export type AdminBookGrantResult = {
    transactionId: string;
    newSystemUntil: Date;
    deliveryEmail: string;
    books: Array<{
        productId: string;
        filename: string;
        downloadLink: string;
    }>;
};

function computeValidUntil(existingUntil: Date | null | undefined, daysToAdd: number): Date {
    const now = new Date();
    const base =
        existingUntil && existingUntil.getTime() > now.getTime() ? existingUntil : now;
    return new Date(base.getTime() + daysToAdd * DAY_IN_MS);
}

export async function grantBookPlanAdmin(input: AdminBookGrantInput): Promise<AdminBookGrantResult> {
    const gcsBucket = process.env.GCS_BUCKET_NAME;
    if (!gcsBucket) {
        throw new Error("Server misconfigured: GCS_BUCKET_NAME");
    }

    const [transaction] = await db
        .insert(paymentTransactions)
        .values({
            userId: input.userId,
            planId: input.planId,
            status: "created",
            studentName: input.studentName,
            email: input.deliveryEmail,
            phone: input.phone ?? "",
            totalPrice: 0,
            bookIncluded: false,
            systemStep: input.systemStep,
            metadata: { source: "admin_grant" },
        })
        .returning();

    const books: AdminBookGrantResult["books"] = [];
    let latestExpiry = new Date(0);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        throw new Error("Server misconfigured: NEXT_PUBLIC_APP_URL");
    }

    for (const productId of input.productIds) {
        const product = await getProductById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        const existingSub = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, input.userId),
                eq(subscriptions.productId, productId)
            ),
            orderBy: (sub, { desc }) => [desc(sub.systemUntil)],
        });

        const validUntil = computeValidUntil(existingSub?.systemUntil ?? null, input.daysToAdd);
        if (validUntil > latestExpiry) {
            latestExpiry = validUntil;
        }

        const filename = `${getFileName(input.userId, product.productType)}.pdf`;

        const existingBook = await db.query.bookPurchases.findFirst({
            where: and(
                eq(bookPurchases.userId, input.userId),
                eq(bookPurchases.productId, productId)
            ),
            orderBy: (bp, { desc }) => [desc(bp.createdAt)],
        });

        if (existingBook) {
            await db
                .update(bookPurchases)
                .set({
                    studentName: input.studentName,
                    email: input.deliveryEmail,
                    phone: input.phone ?? "",
                    vatId: input.bookPassword,
                    validUntil,
                    paymentTransactionId: transaction.id,
                    generated: false,
                    updatedAt: new Date(),
                })
                .where(eq(bookPurchases.id, existingBook.id));
        } else {
            await createBookPurchase({
                validUntil,
                paymentTransactionId: transaction.id,
                userId: input.userId,
                productId,
                studentName: input.studentName,
                email: input.deliveryEmail,
                phone: input.phone ?? "",
                filename,
                gcsBucket,
                generated: false,
                vatId: input.bookPassword,
                systemStep: input.systemStep,
            });
        }

        if (existingSub) {
            await db
                .update(subscriptions)
                .set({
                    systemUntil: validUntil,
                    systemStep: input.systemStep,
                    paymentTransactionId: transaction.id,
                })
                .where(eq(subscriptions.id, existingSub.id));
        } else {
            await db.insert(subscriptions).values({
                id: crypto.randomUUID(),
                userId: input.userId,
                productId,
                couponId: null,
                paymentTransactionId: transaction.id,
                systemUntil: validUntil,
                systemStep: input.systemStep,
                createdAt: new Date(),
            });
        }

        // Generate the PDF before sending the email so the file actually exists
        const generateResp = await fetch(
            `${appUrl}/api/book/generate?userId=${encodeURIComponent(input.userId)}&productId=${encodeURIComponent(productId)}`
        );
        if (!generateResp.ok) {
            throw new Error(`Book generation failed: ${generateResp.status}`);
        }

        // Re-fetch the book purchase to get the actual filename/bucket written by the generate route
        const generatedBook = await db.query.bookPurchases.findFirst({
            where: and(
                eq(bookPurchases.userId, input.userId),
                eq(bookPurchases.productId, productId)
            ),
            orderBy: (bp, { desc }) => [desc(bp.createdAt)],
        });

        const actualFilename = generatedBook?.filename ?? filename;
        const actualBucket = generatedBook?.gcsBucket ?? gcsBucket;
        const downloadLink = `https://storage.googleapis.com/${actualBucket}/${actualFilename}`;

        await sendEmail(
            input.deliveryEmail,
            downloadReadyHtml({
                recipient: input.studentName,
                downloadLink,
                filename: actualFilename,
                password: input.bookPassword,
                expiresAt: validUntil.toISOString(),
            }),
            "הקובץ שלך מוכן להורדה"
        );

        books.push({ productId, filename: actualFilename, downloadLink });
    }

    await db
        .update(paymentTransactions)
        .set({
            status: "fulfilled",
            vatId: input.bookPassword,
            updatedAt: new Date(),
        })
        .where(eq(paymentTransactions.id, transaction.id));

    return {
        transactionId: transaction.id,
        newSystemUntil: latestExpiry,
        deliveryEmail: input.deliveryEmail,
        books,
    };
}

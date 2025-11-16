import db from '@/db/drizzle';
import { getProductById } from '@/db/queries';
import { bookPurchases } from '@/db/schemaSmarti';
import { and, eq } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import z from 'zod';



export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const productId = searchParams.get('productId');

        if (!userId || !productId) {
            return NextResponse.json({ error: 'userId and productId are required' }, { status: 400 });
        }

        const purchase = await db.query.bookPurchases.findFirst({
            where: (bp, { and: andClause, eq: eqClause }) => andClause(eqClause(bp.userId, userId), eqClause(bp.productId, productId)),
        });

        if (!purchase) {
            return NextResponse.json({ error: 'Book purchase not found' }, { status: 404 });
        }




        const { studentName, vatId, email, generated } = purchase;

        if (!generated) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL;
            if (!appUrl) {
                throw new Error('NEXT_PUBLIC_APP_URL is not configured');
            }
            const product = await getProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            const formData = new URLSearchParams();
            formData.append("vat_id", vatId);
            formData.append("email", email);
            formData.append("StudentName", studentName);
            formData.append("productType", product.productType);
            formData.append("userId", userId);
            const convertResp = await fetch(`${appUrl}/api/book/convert`, {
                method: "POST",
                headers: { "content-type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });

            if (!convertResp.ok) {
                throw new Error(`Convert API failed: ${convertResp.status}`);
            }

            const convertResult = await convertResp.json();
            const ConvertResultSchema = z.object({ bucket: z.string(), filename: z.string() });
            const parsedConvertResult = ConvertResultSchema.safeParse(convertResult);
            if (!parsedConvertResult.success) {
                throw new Error(`Invalid Convert API response: ${JSON.stringify(parsedConvertResult.error.issues)}`);
            }
            await db
                .update(bookPurchases)
                .set({
                    generated: true,
                    updatedAt: new Date(),
                    gcsBucket: convertResult.bucket,
                    filename: convertResult.filename,
                })
                .where(and(eq(bookPurchases.userId, userId), eq(bookPurchases.productId, productId)));
        }

        return NextResponse.json({ message: 'Success', userId, productId }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}



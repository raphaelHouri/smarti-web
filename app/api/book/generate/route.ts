import { getDocument, updateDocumentFields } from '@/lib/firestore';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import z from 'zod';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        const data = await getDocument(`books/${email}`);
        if (!data) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const BookSchema = z.object({
            StudentName: z.string(),
            amount: z.number(),
            planId: z.string(),
            vat_id: z.string(),
            phone: z.string(),
            filename: z.string().optional(),
            gcsBucket: z.string().optional(),
            generated: z.boolean().optional(),
        });

        const parseResult = BookSchema.safeParse(data);
        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid document data', details: parseResult.error.issues }, { status: 400 });
        }

        const { StudentName, vat_id, generated } = parseResult.data;

        if (!generated) {
            const formData = new URLSearchParams();
            formData.append("vat_id", vat_id);
            formData.append("email", email);
            formData.append("StudentName", StudentName);

            const convertResp = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/book/convert`, {
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
            const { filename: gcsFilename } = parsedConvertResult.data;
            await updateDocumentFields(`books/${email}`, { generated: true, gcsFilename });
        }

        return NextResponse.json({ message: 'Success', email }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}



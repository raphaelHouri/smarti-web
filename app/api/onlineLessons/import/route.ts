import { NextRequest, NextResponse } from 'next/server';
import db from "@/db/drizzle";
import { lessonCategory, onlineLessons } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { InferInsertModel } from 'drizzle-orm';
import * as XLSX from 'xlsx';

type DrizzleOnlineLessonInsert = InferInsertModel<typeof onlineLessons>;

interface ParsedOnlineLessonRow {
    id: string;
    categoryId: string;
    topicType?: string | null;
    title: string;
    description?: string | null;
    link: string;
    order?: number;
    systemStep: number;
}

export async function POST(req: NextRequest) {
    if (!IsAdmin()) {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    const categories = await db.query.lessonCategory.findMany();
    const categoryMap = categories.reduce((map, c) => {
        map[c.categoryType] = c.id;
        return map;
    }, {} as Record<string, string>);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        const fileName = file.name.toLowerCase();
        let rows: any[] = [];

        if (fileName.endsWith('.csv')) {
            const content = buffer.toString('utf8');
            const lines = content.split('\n').filter(l => l.trim() !== '');
            const headers = lines[0].split(',').map(h => h.trim());
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const row: Record<string, string> = {};
                headers.forEach((h, idx) => row[h] = values[idx]);
                rows.push(row);
            }
        } else if (fileName.endsWith('.xlsx')) {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const a = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (a.length === 0) {
                return NextResponse.json({ message: 'No data found in the XLSX file.' }, { status: 400 });
            }
            const headers = (a.shift() as string[]).map(h => h.trim());
            rows = a.map(r => {
                const obj: Record<string, string> = {};
                (r as string[]).forEach((value, index) => {
                    obj[headers[index]] = value;
                });
                return obj;
            });
        } else {
            return NextResponse.json({ message: 'Unsupported file type. Please upload a CSV or XLSX file.' }, { status: 400 });
        }

        if (rows.length === 0) {
            return NextResponse.json({ message: 'No valid data found in the file after parsing.' }, { status: 400 });
        }

        const toInsert: ParsedOnlineLessonRow[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const obj: Partial<ParsedOnlineLessonRow> = { id: crypto.randomUUID() };

            for (const header in row) {
                const value = row[header];
                if (value === undefined || value === null || String(value).trim() === '') continue;

                if (header === 'id') {
                    obj.id = String(value);
                } else if (header === 'title') {
                    obj.title = String(value);
                } else if (header === 'description') {
                    obj.description = String(value);
                } else if (header === 'link') {
                    obj.link = String(value);
                } else if (header === 'order' || header === 'sortOrder') {
                    const n = Number(value);
                    obj.order = Number.isFinite(n) ? n : 0;
                } else if (header === 'categoryId') {
                    // Accept categoryType alias
                    const catTypeOrId = String(value);
                    obj.categoryId = categoryMap[catTypeOrId] ?? catTypeOrId;
                } else if (header === 'categoryType') {
                    const catType = String(value);
                    if (categoryMap[catType]) obj.categoryId = categoryMap[catType];
                } else if (header === 'topicType') {
                    obj.topicType = String(value);
                } else if (header === 'systemStep') {
                    const n = Number(value);
                    if (!Number.isFinite(n) || n < 1 || n > 3) {
                        throw new Error(`Row ${i + 2}: systemStep must be 1, 2 or 3.`);
                    }
                    (obj as any).systemStep = n;
                }
            }

            if (!obj.title) throw new Error(`Row ${i + 2}: title is required.`);
            if (!obj.link) throw new Error(`Row ${i + 2}: link is required.`);
            if (!obj.categoryId) throw new Error(`Row ${i + 2}: categoryId/categoryType is required or invalid.`);
            if ((obj as any).systemStep == null) {
                throw new Error(`Row ${i + 2}: systemStep is missing.`);
            }

            toInsert.push(obj as ParsedOnlineLessonRow);
        }

        const inserted = await db.insert(onlineLessons).values(toInsert).returning();
        return NextResponse.json({
            message: `${inserted.length} online lessons imported successfully!`,
            count: inserted.length,
            data: inserted
        }, { status: 200 });
    } catch (error: any) {
        console.error("[ONLINE_LESSONS_IMPORT_POST_ERROR]", error);
        return NextResponse.json({ message: error.message || 'Failed to import online lessons.' }, { status: 500 });
    }
}



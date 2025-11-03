import { NextRequest, NextResponse } from 'next/server';
import db from "@/db/drizzle";
import { lessons, lessonQuestionGroups } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { InferInsertModel, eq, inArray } from 'drizzle-orm';
import * as XLSX from 'xlsx';

type DrizzleLessonInsert = InferInsertModel<typeof lessons>;
type DrizzleLessonQGInsert = InferInsertModel<typeof lessonQuestionGroups>;

interface ParsedRow {
    questionIds?: string;
    categoryType?: string;
    order?: string | number;
    time?: string | number;
    premium?: string | boolean;
    groupCategoryType?: string;
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedData: any[] = [];
    const fileName = file.name.toLowerCase();

    const standardize = (h: string) => {
        const key = String(h || '').toLowerCase().replace(/\s+|\.|_/g, '');
        switch (key) {
            case 'questionIds':
                return 'questionIds';
            case 'categoryType':
                return 'categoryType';
            case 'order':
                return 'order';
            case 'time':
            case 'duration':
                return 'time';
            case 'premium':
                return 'premium';
            case 'groupCategoryType':
                return 'groupCategoryType';
            default:
                return String(h || '').trim();
        }
    };

    try {
        if (fileName.endsWith('.xlsx')) {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (parsedData.length === 0) {
                return NextResponse.json({ message: 'No data found in the XLSX file.' }, { status: 400 });
            }
            const headers = (parsedData.shift() as string[]).map(h => standardize(String(h || '')));
            parsedData = parsedData.map(row => {
                const obj: { [key: string]: string | undefined } = {};
                (row as (string | number | undefined)[]).forEach((value, index) => {
                    const k = headers[index];
                    if (!k) return;
                    obj[k] = value === undefined || value === null ? undefined : String(value);
                });
                return obj;
            });
        } else if (fileName.endsWith('.csv')) {
            const text = buffer.toString('utf-8');
            const lines = text.split(/\r?\n/).filter(Boolean);
            if (lines.length === 0) {
                return NextResponse.json({ message: 'No data found in the CSV file.' }, { status: 400 });
            }
            const headers = lines[0].split(',').map(h => standardize(h.trim()));
            parsedData = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj: Record<string, string> = {};
                headers.forEach((h, i) => { if (h) obj[h] = (values[i] || '').trim(); });
                return obj;
            });
        } else {
            return NextResponse.json({ message: 'Unsupported file type. Please upload a CSV or XLSX file.' }, { status: 400 });
        }
    } catch (e) {
        return NextResponse.json({ message: 'Failed to parse file.' }, { status: 400 });
    }

    if (parsedData.length === 0) {
        return NextResponse.json({ message: 'No valid data found in the file after parsing.' }, { status: 400 });
    }

    // Preload category map by categoryType
    const lessonCategories = await db.query.lessonCategory.findMany();
    const categoryMap = lessonCategories.reduce((map, category) => {
        map[category.categoryType] = category.id;
        return map;
    }, {} as Record<string, string>);

    // Optional: preload question IDs to validate existence and normalize
    // If provided IDs are not UUIDs in your sheet, this will simply skip validation
    const allQuestionIds: string[] = [];
    for (const row of parsedData as ParsedRow[]) {
        if (row.questionIds) {
            const ids = row.questionIds.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
            allQuestionIds.push(...ids);
        }
    }
    let existingQuestionIds = new Set<string>();
    if (allQuestionIds.length > 0) {
        try {
            // Lazy import to avoid circular import of schema in some environments
            const { questions } = await import('@/db/schemaSmarti');
            const uniqueIds = Array.from(new Set(allQuestionIds));
            const chunks: string[][] = [];
            const size = 500;
            for (let i = 0; i < uniqueIds.length; i += size) chunks.push(uniqueIds.slice(i, i + size));
            for (const chunk of chunks) {
                const rows = await db.select({ id: questions.id }).from(questions).where(inArray(questions.id, chunk));
                rows.forEach(r => existingQuestionIds.add(r.id));
            }
        } catch {
            // If validation fails for any reason, proceed without blocking
        }
    }

    const created: { lessonId: string; order: number }[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < parsedData.length; i++) {
        const raw = parsedData[i] as ParsedRow;
        const categoryType = (raw.categoryType || '').trim();
        const categoryId = categoryMap[categoryType];
        if (!categoryId) {
            errors.push({ row: i + 2, message: `Unknown categoryType: ${categoryType}` });
            continue;
        }
        const groupCategoryType = (raw.groupCategoryType || '').trim();
        const groupCategoryId = categoryMap[groupCategoryType];
        if (!groupCategoryId) {
            errors.push({ row: i + 2, message: `Unknown groupCategoryType: ${groupCategoryType}` });
            continue;
        }

        const orderNum = typeof raw.order === 'number' ? raw.order : parseInt(String(raw.order || '').trim(), 10);
        if (!Number.isFinite(orderNum)) {
            errors.push({ row: i + 2, message: 'Invalid order' });
            continue;
        }

        const isPremium = typeof raw.premium === 'boolean'
            ? raw.premium
            : /^(true|1|yes)$/i.test(String(raw.premium || '').trim());

        const timeSec = typeof raw.time === 'number' ? raw.time : parseInt(String(raw.time || '').trim(), 10);
        if (!Number.isFinite(timeSec)) {
            errors.push({ row: i + 2, message: 'Invalid time' });
            continue;
        }

        const questionList = (raw.questionIds || '')
            .split(/[,;\s]+/)
            .map(s => s.trim())
            .filter(Boolean);

        // Optional: filter to existing IDs only if we have validation
        const normalizedQuestionList = existingQuestionIds.size > 0
            ? questionList.filter(id => existingQuestionIds.has(id))
            : questionList;

        if (normalizedQuestionList.length === 0) {
            errors.push({ row: i + 2, message: 'No valid questionIds provided' });
            continue;
        }

        // Create lesson
        const lessonToInsert: DrizzleLessonInsert = {
            lessonCategoryId: categoryId,
            lessonOrder: orderNum,
            isPremium,
        } as DrizzleLessonInsert;

        const inserted = await db.insert(lessons).values(lessonToInsert).returning();
        const newLesson = inserted[0];
        if (!newLesson) {
            errors.push({ row: i + 2, message: 'Failed to create lesson' });
            continue;
        }

        // Create lesson question group linked to the lesson
        const qgToInsert: DrizzleLessonQGInsert = {
            lessonId: newLesson.id,
            categoryId: groupCategoryType,
            questionList: normalizedQuestionList as unknown as string[],
            time: Number(timeSec),
        } as DrizzleLessonQGInsert;

        await db.insert(lessonQuestionGroups).values(qgToInsert);
        created.push({ lessonId: newLesson.id, order: orderNum });
    }

    return NextResponse.json({
        message: `Processed ${parsedData.length} rows. Created ${created.length} lessons. ${errors.length} errors.`,
        created,
        errors,
    });
}



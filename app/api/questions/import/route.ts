import { NextRequest, NextResponse } from 'next/server';
import db from "@/db/drizzle";
import { questions } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { InferInsertModel } from 'drizzle-orm';
import * as XLSX from 'xlsx'; // Import the xlsx library

type DrizzleQuestionInsert = InferInsertModel<typeof questions>;

interface ParsedQuestionFromCSV {
    content?: string | null;
    question: string;
    format: DrizzleQuestionInsert['format'];
    options?: {
        a?: string;
        b?: string;
        c?: string;
        d?: string;
    } | null;
    categoryId: string;
    topicType?: string | null;
    explanation?: string | null;
    id: string;
}

export async function POST(req: NextRequest) {
    if (!IsAdmin()) {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    const lessonCategories = await db.query.lessonCategory.findMany();
    const categoryMap = lessonCategories.reduce((map, category) => {
        map[category.categoryType] = category.id;
        return map;
    }, {} as Record<string, string>);

    if (!file) {
        return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileContent: string;
    let parsedData: any[] = []; // To hold the parsed rows from either CSV or XLSX

    try {
        // Check file extension to determine parsing method
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.csv')) {
            // Original CSV parsing logic
            fileContent = buffer.toString('utf8');
            // Heuristic check for potential encoding issues (as discussed before)

            const lines = fileContent.split('\n').filter(line => line.trim() !== '');
            if (lines.length === 0) {
                return NextResponse.json({ message: 'File is empty after filtering blank lines.' }, { status: 400 });
            }

            const headers = lines[0].split(',').map(h => h.trim());
            if (headers.length === 0) {
                return NextResponse.json({ message: 'No headers found in the CSV file.' }, { status: 400 });
            }

            // Convert lines to a format similar to what XLSX.utils.sheet_to_json produces
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const row: { [key: string]: string | undefined } = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                parsedData.push(row);
            }

        } else if (fileName.endsWith('.xlsx')) {
            // XLSX parsing logic using xlsx library
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0]; // Get the first sheet
            const worksheet = workbook.Sheets[sheetName];

            // Convert worksheet to JSON, assuming the first row is headers
            parsedData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1 // Returns an array of arrays, where the first array is headers
            });

            if (parsedData.length === 0) {
                return NextResponse.json({ message: 'No data found in the XLSX file.' }, { status: 400 });
            }

            // The first array in parsedData is the headers
            const headers = (parsedData.shift() as string[]).map(h => h.trim());

            // Transform parsedData into objects using the headers
            parsedData = parsedData.map(row => {
                const obj: { [key: string]: string | undefined } = {};
                (row as string[]).forEach((value, index) => {
                    obj[headers[index]] = value;
                });
                return obj;
            });

        } else {
            return NextResponse.json({ message: 'Unsupported file type. Please upload a CSV or XLSX file.' }, { status: 400 });
        }

        if (parsedData.length === 0) {
            return NextResponse.json({ message: 'No valid data found in the file after parsing.' }, { status: 400 });
        }

        const questionsToInsert: ParsedQuestionFromCSV[] = [];

        // Now, iterate through parsedData regardless of whether it came from CSV or XLSX
        for (let i = 0; i < parsedData.length; i++) {
            const rowObj = parsedData[i]; // This is now a simple object { header: value, ... }
            const obj: Partial<ParsedQuestionFromCSV> = { id: crypto.randomUUID() }; // Initialize with a new UUID

            // Map row data to the ParsedQuestionFromCSV interface
            for (const header in rowObj) {
                const value = rowObj[header];
                if (value === undefined || value === null || String(value).trim() === '') {
                    continue;
                }

                if (header === 'content') {
                    obj.content = String(value);

                } else if (header === 'question') {
                    obj.question = String(value);

                } else if (header === 'id') {
                    obj.id = String(value);
                } else if (header === 'format') {
                    const upperCaseValue = String(value).toUpperCase();
                    if (['REGULAR', 'SHAPES', 'COMPREHENSION', 'MATH'].includes(upperCaseValue)) {
                        obj.format = upperCaseValue as DrizzleQuestionInsert['format'];

                    } else {
                        obj.format = 'REGULAR';
                        console.warn(`Row ${i + 2}: Unrecognized format '${value}'. Defaulting to 'SELECT'.`);
                    }
                } else if (header.startsWith('options.')) {
                    const subOptionKey = header.split('.')[1];
                    if (!obj.options) obj.options = {};
                    (obj.options as any)[subOptionKey] = String(value);
                } else if (header === 'categoryId') {
                    if (categoryMap[String(value)]) {
                        obj.categoryId = categoryMap[String(value)];
                    } else {
                        console.warn(`Row ${i + 2}: Category type '${value}' not found in database. Trying form categoryId.`);
                    }
                } else if (header === 'topicType') {
                    obj.topicType = String(value);
                } else if (header === 'explanation') {
                    obj.explanation = String(value);
                }
            }

            // --- Server-side Validation for each row ---
            if (!obj.question) {
                throw new Error(`Row ${i + 2}: Question content is missing.`);
            }
            if (!obj.format) {
                throw new Error(`Row ${i + 2}: Format could not be determined or is missing.`);
            }

            if (!obj.categoryId) {
                throw new Error(`Row ${i + 2}: Category ID is missing or invalid.`);
            }

            questionsToInsert.push(obj as ParsedQuestionFromCSV);
        }

        if (questionsToInsert.length === 0) {
            return NextResponse.json({ message: 'No valid questions found in the file after parsing.' }, { status: 400 });
        }

        const insertedQuestions = await db.insert(questions).values(questionsToInsert).returning();

        return NextResponse.json({
            message: `${insertedQuestions.length} questions imported successfully!`,
            count: insertedQuestions.length,
            data: insertedQuestions
        }, { status: 200 });

    } catch (error: any) {
        console.error("[QUESTIONS_IMPORT_POST_ERROR]", error);
        return NextResponse.json({ message: error.message || 'Failed to import questions.' }, { status: 500 });
    }
}
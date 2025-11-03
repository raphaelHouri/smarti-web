import db from "@/db/drizzle"
import { questions } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ questionId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { questionId } = await params;
    const data = await db.query.questions.findFirst({
        where: eq(questions.id, questionId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ questionId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { questionId } = await params;
    const body = await req.json();
    const data = await db.update(questions).set({
        ...body
    }).where(
        eq(questions.id, questionId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ questionId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { questionId } = await params;
    const data = await db.delete(questions).
        where(eq(questions.id, questionId)).returning()
    return NextResponse.json(data[0]);
}




export const POST = async (
    req: Request,
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 });
    }

    try {
        const body = await req.json();

        // Basic validation (you might want more comprehensive validation with a library like Zod)
        if (!body.question || !body.categoryId || !body.managerId) {
            return new NextResponse("Missing required fields: question, categoryId, and managerId are required.", { status: 400 });
        }

        const newQuestion = await db.insert(questions).values({
            // Ensure these fields match your `questions` schema and are non-null if required
            id: body.id || crypto.randomUUID(), // Generate an ID if not provided
            question: body.question,
            format: body.format,
            options: body.options,
            categoryId: body.categoryId,
            topicType: body.topicType,
            explanation: body.explanation,
            managerId: body.managerId,
        }).returning(); // .returning() is crucial to get the created record back

        if (!newQuestion || newQuestion.length === 0) {
            return new NextResponse("Failed to create question.", { status: 500 });
        }

        return NextResponse.json(newQuestion[0], { status: 201 }); // Return the first created record with 201 Created status

    } catch (error: any) {
        console.error("[QUESTIONS_POST_ERROR]", error);
        return new NextResponse(`Internal Error: ${error.message || 'Unknown error'}`, { status: 500 });
    }
};
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { lessonCategory } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.lessonCategory.findMany();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const body = await req.json();

    // If id is provided and not empty, use it; otherwise generate a UUID
    const valuesToInsert: typeof lessonCategory.$inferInsert = {
        ...body,
    };

    // Generate UUID if id is not provided or empty
    if (!body.id || (typeof body.id === 'string' && body.id.trim() === '')) {
        valuesToInsert.id = crypto.randomUUID();
    }

    const data = await db.insert(lessonCategory).values(valuesToInsert).returning();

    return NextResponse.json(data[0]);
}

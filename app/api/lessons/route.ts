import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { lessons } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.lessons.findMany();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const body = await req.json();
    const insertPayload: any = { ...body };
    if (typeof insertPayload.createdAt === "string") {
        const d = new Date(insertPayload.createdAt);
        insertPayload.createdAt = isNaN(d.getTime()) ? undefined : d;
    }
    const data = await db.insert(lessons).values(insertPayload).returning()


    return NextResponse.json(data[0]);
}

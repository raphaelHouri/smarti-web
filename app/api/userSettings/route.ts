import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSettings } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.userSettings.findMany();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const body = await req.json();
    const data = await db.insert(userSettings).values({
        ...body
    }).returning()


    return NextResponse.json(data[0]);
}

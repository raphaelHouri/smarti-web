import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { organizationYears } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { sanitizeDates } from "@/lib/api/sanitize";

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.organizationYears.findMany();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const body = await req.json();
    const insertPayload = sanitizeDates(body);
    const data = await db.insert(organizationYears).values(insertPayload).returning()


    return NextResponse.json(data[0]);
}

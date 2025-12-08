import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { plans } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.plans.findMany();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const body = await req.json();

    // Parse displayData if it's a string
    let displayData = body.displayData;
    if (typeof displayData === 'string' && displayData.trim()) {
        try {
            displayData = JSON.parse(displayData);
        } catch (e) {
            return new NextResponse("Invalid JSON in displayData", { status: 400 });
        }
    }

    const data = await db.insert(plans).values({
        ...body,
        displayData: displayData || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
    }).returning()


    return NextResponse.json(data[0]);
}

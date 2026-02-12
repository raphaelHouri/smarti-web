import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { organizationYears } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { sanitizeDates } from "@/lib/api/sanitize";
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.organizationYears.findMany({
        with: {
            organization: {
                columns: { name: true },
            },
        },
    });
    
    // Add organizationName to each record for easier access in React Admin
    const dataWithOrgName = data.map(year => ({
        ...year,
        organizationName: year.organization?.name ?? null,
    }));
    
    return NextResponse.json(dataWithOrgName);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const body = await req.json();
    const insertPayload = sanitizeDates(body);
    const data = await db.insert(organizationYears).values({
        id: uuidv4(),
        ...insertPayload
    }).returning()


    return NextResponse.json(data[0]);
}

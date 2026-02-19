import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { systemConfig } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { sanitizeDates } from "@/lib/api/sanitize";
import crypto from "crypto";

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.systemConfig.findMany({
        orderBy: (config, { desc }) => [desc(config.systemStep), desc(config.createdAt)],
    });
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }

    try {
        const body = await req.json();
        const sanitized = sanitizeDates(body);

        // Validate required fields
        if (!sanitized.systemStep || typeof sanitized.systemStep !== 'number') {
            return NextResponse.json({ error: "System Step is required and must be a number" }, { status: 400 });
        }

        const values = {
            id: crypto.randomUUID(),
            systemStep: sanitized.systemStep,
            linkWhatsappGroup: sanitized.linkWhatsappGroup || null,
            examDate: sanitized.examDate || null,
            numQuestion: sanitized.numQuestion || null,
            iosVersion: sanitized.iosVersion ?? null,
            androidVersion: sanitized.androidVersion ?? null,
        };

        const data = await db.insert(systemConfig).values(values).returning();

        return NextResponse.json(data[0]);
    } catch (error: any) {
        console.error("Error creating system config:", error);
        return NextResponse.json({
            error: error.message || "Failed to create system config",
            details: error.detail || error.cause?.detail
        }, { status: 500 });
    }
}


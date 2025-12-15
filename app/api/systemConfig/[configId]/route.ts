import db from "@/db/drizzle"
import { systemConfig } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { sanitizeDates } from "@/lib/api/sanitize"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ configId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { configId } = await params;
    const data = await db.query.systemConfig.findFirst({
        where: eq(systemConfig.id, configId)
    })

    if (!data) {
        return NextResponse.json(null);
    }

    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ configId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    try {
        const { configId } = await params;
        const body = await req.json();
        const sanitized = sanitizeDates(body);

        // Validate systemStep if provided
        if (sanitized.systemStep !== undefined && typeof sanitized.systemStep !== 'number') {
            return NextResponse.json({ error: "System Step must be a number" }, { status: 400 });
        }

        const updateData: any = {};
        if (sanitized.systemStep !== undefined) updateData.systemStep = sanitized.systemStep;
        if (sanitized.linkWhatsappGroup !== undefined) updateData.linkWhatsappGroup = sanitized.linkWhatsappGroup;
        if (sanitized.examDate !== undefined) updateData.examDate = sanitized.examDate;
        if (sanitized.numQuestion !== undefined) updateData.numQuestion = sanitized.numQuestion;
        updateData.updatedAt = new Date();

        const data = await db.update(systemConfig)
            .set(updateData)
            .where(eq(systemConfig.id, configId))
            .returning();

        if (!data || data.length === 0) {
            return NextResponse.json({ error: "System config not found" }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error: any) {
        console.error("Error updating system config:", error);
        return NextResponse.json({
            error: error.message || "Failed to update system config",
            details: error.detail || error.cause?.detail
        }, { status: 500 });
    }
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ configId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { configId } = await params;
    const data = await db.delete(systemConfig)
        .where(eq(systemConfig.id, configId))
        .returning();

    return NextResponse.json(data[0]);
}


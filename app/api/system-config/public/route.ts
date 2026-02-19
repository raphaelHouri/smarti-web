import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { systemConfig } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";

// GET - Get system config by systemStep (public endpoint for app)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const systemStepParam = searchParams.get('systemStep');

        // Default to systemStep = 1 if not provided
        const systemStep = systemStepParam ? parseInt(systemStepParam, 10) : 1;

        if (![1, 2, 3].includes(systemStep)) {
            return NextResponse.json(
                { error: "Invalid systemStep. Must be 1, 2, or 3" },
                { status: 400 }
            );
        }

        const config = await db.query.systemConfig.findFirst({
            where: eq(systemConfig.systemStep, systemStep),
            columns: {
                iosVersion: true,
                androidVersion: true,
                systemStep: true,
            },
        });

        // If no config found, return default values (null versions = test mode)
        if (!config) {
            return NextResponse.json({
                iosVersion: null,
                androidVersion: null,
                systemStep: systemStep,
            });
        }

        return NextResponse.json({
            iosVersion: config.iosVersion ?? null,
            androidVersion: config.androidVersion ?? null,
            systemStep: config.systemStep,
        });
    } catch (error) {
        console.error("Error fetching public system config:", error);
        return NextResponse.json(
            { error: "Failed to fetch system config" },
            { status: 500 }
        );
    }
}


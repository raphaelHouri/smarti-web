"use server";

import { cookies } from "next/headers";
import { verifyBiCookie, COOKIE_NAME } from "@/lib/bi-auth";
import db from "@/db/drizzle";
import { paymentTransactions } from "@/db/schemaSmarti";
import { and, gte, lte, desc } from "drizzle-orm";

const SUCCESS_STATUSES = ["paid", "bookCreated", "icount", "fulfilled"] as const;

export type BiSummary = {
    totalRevenue: number;
    paidCount: number;
    failedCount: number;
    createdCount: number;
    cancelledCount: number;
    bookIncludedCount: number;
    totalCount: number;
};

export type BiByPlan = {
    planId: string;
    planName: string;
    count: number;
    revenue: number;
};

export type BiByStatus = {
    status: string;
    count: number;
};

export type BiTimeSeriesPoint = {
    date: string;
    count: number;
    revenue: number;
};

export type BiRecentTransaction = {
    id: string;
    createdAt: Date | null;
    status: string;
    totalPrice: number;
    planName: string;
    email: string | null;
};

export type BiInsightsData = {
    summary: BiSummary;
    byPlan: BiByPlan[];
    byStatus: BiByStatus[];
    timeSeries: BiTimeSeriesPoint[];
    recentTransactions: BiRecentTransaction[];
};

export type GetBiInsightsResult =
    | { ok: true; data: BiInsightsData }
    | { ok: false; needsAuth: true };

function startOfDay(d: Date): Date {
    const out = new Date(d);
    out.setUTCHours(0, 0, 0, 0);
    return out;
}

function endOfDay(d: Date): Date {
    const out = new Date(d);
    out.setUTCHours(23, 59, 59, 999);
    return out;
}

function toDateKey(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export async function getBiInsights(
    from: string,
    to: string
): Promise<GetBiInsightsResult> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME)?.value;
    if (!verifyBiCookie(cookie)) {
        return { ok: false, needsAuth: true };
    }

    const fromDate = startOfDay(new Date(from));
    const toDate = endOfDay(new Date(to));
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
        return { ok: false, needsAuth: true };
    }

    const rows = await db.query.paymentTransactions.findMany({
        where: and(
            gte(paymentTransactions.createdAt, fromDate),
            lte(paymentTransactions.createdAt, toDate)
        ),
        with: { plan: true },
        orderBy: [desc(paymentTransactions.createdAt)],
    });

    const summary: BiSummary = {
        totalRevenue: 0,
        paidCount: 0,
        failedCount: 0,
        createdCount: 0,
        cancelledCount: 0,
        bookIncludedCount: 0,
        totalCount: rows.length,
    };

    const byPlanMap = new Map<string, { planName: string; count: number; revenue: number }>();
    const byStatusMap = new Map<string, number>();
    const timeSeriesMap = new Map<string, { count: number; revenue: number }>();

    for (const row of rows) {
        const isSuccess = SUCCESS_STATUSES.includes(row.status as (typeof SUCCESS_STATUSES)[number]);
        if (isSuccess) {
            summary.totalRevenue += row.totalPrice;
            summary.paidCount += 1;
        }
        if (row.status === "failed") summary.failedCount += 1;
        if (row.status === "created") summary.createdCount += 1;
        if (row.status === "cancelled") summary.cancelledCount += 1;
        if (row.bookIncluded) summary.bookIncludedCount += 1;

        const planId = row.planId ?? "unknown";
        const planName = row.plan?.name ?? "Unknown plan";
        const existing = byPlanMap.get(planId);
        if (existing) {
            existing.count += 1;
            if (isSuccess) existing.revenue += row.totalPrice;
        } else {
            byPlanMap.set(planId, {
                planName,
                count: 1,
                revenue: isSuccess ? row.totalPrice : 0,
            });
        }

        byStatusMap.set(row.status, (byStatusMap.get(row.status) ?? 0) + 1);

        const dateKey = row.createdAt ? toDateKey(new Date(row.createdAt)) : toDateKey(fromDate);
        const ts = timeSeriesMap.get(dateKey);
        if (ts) {
            ts.count += 1;
            if (isSuccess) ts.revenue += row.totalPrice;
        } else {
            timeSeriesMap.set(dateKey, {
                count: 1,
                revenue: isSuccess ? row.totalPrice : 0,
            });
        }
    }

    const byPlan: BiByPlan[] = Array.from(byPlanMap.entries()).map(([planId, v]) => ({
        planId,
        planName: v.planName,
        count: v.count,
        revenue: v.revenue,
    }));

    const byStatus: BiByStatus[] = Array.from(byStatusMap.entries()).map(([status, count]) => ({
        status,
        count,
    }));

    const sortedDates = Array.from(timeSeriesMap.keys()).sort();
    const timeSeries: BiTimeSeriesPoint[] = sortedDates.map((date) => {
        const v = timeSeriesMap.get(date)!;
        return { date, count: v.count, revenue: v.revenue };
    });

    const recentTransactions: BiRecentTransaction[] = rows.slice(0, 20).map((row) => ({
        id: row.id,
        createdAt: row.createdAt,
        status: row.status,
        totalPrice: row.totalPrice,
        planName: row.plan?.name ?? "Unknown",
        email: row.email ?? null,
    }));

    return {
        ok: true,
        data: {
            summary,
            byPlan,
            byStatus,
            timeSeries,
            recentTransactions,
        },
    };
}

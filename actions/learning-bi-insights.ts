"use server";

import db from "@/db/drizzle";
import {
    lessonCategory,
    lessons,
    organizationInfo,
    organizationYears as organizationYearsTable,
    userLessonResults,
    userSystemStats,
    users,
} from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { and, asc, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";

const MAX_DAYS_ALL_ORGS = 90;

export interface LearningBiFiltersInput {
    from: string;
    to: string;
    /** Broad scan guard: only allowed with date window ≤ MAX_DAYS_ALL_ORGS. */
    scopeAllOrganizations?: boolean;
    organizationId?: string | null;
    organizationYearIds?: string[];
    systemStep?: number | null;
    lessonCategoryIds?: string[];
    minGeniusScore?: number | null;
    minExperience?: number | null;
    seriousMinLessons?: number | null;
    seriousMinAvgScorePct?: number | null;
}

export interface LearningBiSummary {
    qualifyingUserCount: number;
    totalCompletions: number;
    weightedAccuracyPct: number;
}

export interface LearningBiCategoryRow {
    categoryId: string;
    categoryTitle: string;
    categoryType: string;
    systemStep: number;
    completions: number;
    rightSum: number;
    totalSum: number;
    distinctUsers: number;
    weightedAccuracyPct: number;
}

export interface LearningBiProgressionPoint {
    lessonOrder: number;
    completions: number;
    rightSum: number;
    totalSum: number;
    distinctUsers: number;
    weightedAccuracyPct: number;
}

export interface LearningBiProgressionSeries {
    categoryId: string;
    categoryTitle: string;
    points: LearningBiProgressionPoint[];
}

export interface LearningBiInsightsData {
    summary: LearningBiSummary;
    byCategory: LearningBiCategoryRow[];
    progression: LearningBiProgressionSeries[];
}

export type GetLearningBiInsightsResult =
    | { ok: true; data: LearningBiInsightsData }
    | { ok: false; forbidden: true }
    | { ok: false; error: "invalid_dates" | "scope_required" | "date_span_too_long" };

export interface LearningBiOrgYearOption {
    id: string;
    year: number;
    organizationId: string;
    organizationName: string;
}

export interface LearningBiCategoryOption {
    id: string;
    title: string;
    categoryType: string;
    systemStep: number;
}

export interface LearningBiFilterMeta {
    organizations: { id: string; name: string }[];
    organizationYears: LearningBiOrgYearOption[];
    categories: LearningBiCategoryOption[];
}

export type GetLearningBiFilterMetaResult =
    | { ok: true; data: LearningBiFilterMeta }
    | { ok: false; forbidden: true };

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

function emptyData(): LearningBiInsightsData {
    return {
        summary: {
            qualifyingUserCount: 0,
            totalCompletions: 0,
            weightedAccuracyPct: 0,
        },
        byCategory: [],
        progression: [],
    };
}

export async function getLearningBiFilterMeta(): Promise<GetLearningBiFilterMetaResult> {
    if (!(await IsAdmin())) {
        return { ok: false, forbidden: true };
    }

    const [orgs, yearsRows, categoriesRows] = await Promise.all([
        db.query.organizationInfo.findMany({
            columns: { id: true, name: true },
            orderBy: [asc(organizationInfo.name)],
        }),
        db.query.organizationYears.findMany({
            columns: { id: true, year: true, organizationId: true },
            with: {
                organization: {
                    columns: { name: true },
                },
            },
            orderBy: [asc(organizationYearsTable.year)],
        }),
        db.query.lessonCategory.findMany({
            columns: { id: true, title: true, categoryType: true, systemStep: true, order: true },
            orderBy: [asc(lessonCategory.systemStep), asc(lessonCategory.order), asc(lessonCategory.title)],
        }),
    ]);

    const orgYearOptions: LearningBiOrgYearOption[] = yearsRows.map((y) => ({
        id: y.id,
        year: y.year,
        organizationId: y.organizationId,
        organizationName: y.organization?.name ?? "",
    }));

    const categories: LearningBiCategoryOption[] = categoriesRows.map((c) => ({
        id: c.id,
        title: c.title,
        categoryType: c.categoryType,
        systemStep: c.systemStep,
    }));

    return {
        ok: true,
        data: {
            organizations: orgs.map((o) => ({ id: o.id, name: o.name })),
            organizationYears: orgYearOptions,
            categories,
        },
    };
}

function buildJoinedWhere(filters: LearningBiFiltersInput, yearIds: string[] | undefined, fromDate: Date, toDate: Date): SQL {
    const parts: SQL[] = [
        gte(userLessonResults.completedAt, fromDate),
        lte(userLessonResults.completedAt, toDate),
        eq(lessons.systemStep, userLessonResults.systemStep),
        eq(lessonCategory.systemStep, userLessonResults.systemStep),
    ];

    if (yearIds?.length) {
        parts.push(inArray(users.organizationYearId, yearIds));
    }

    if (filters.systemStep != null) {
        parts.push(eq(userLessonResults.systemStep, filters.systemStep));
    }

    if (filters.lessonCategoryIds?.length) {
        parts.push(inArray(lessonCategory.id, filters.lessonCategoryIds));
    }

    if (filters.minGeniusScore != null) {
        /** Live score is in user_system_stats for the lesson's system_step; users.genius_score is legacy / may be stale. */
        parts.push(
            sql`COALESCE(${userSystemStats.geniusScore}, ${users.geniusScore}, 0) >= ${filters.minGeniusScore}`
        );
    }

    if (filters.minExperience != null) {
        parts.push(
            sql`COALESCE(${userSystemStats.experience}, ${users.experience}, 0) >= ${filters.minExperience}`
        );
    }

    return and(...parts)!;
}

export async function getLearningBiInsights(filters: LearningBiFiltersInput): Promise<GetLearningBiInsightsResult> {
    if (!(await IsAdmin())) {
        return { ok: false, forbidden: true };
    }

    const fromDate = startOfDay(new Date(filters.from));
    const toDate = endOfDay(new Date(filters.to));
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
        return { ok: false, error: "invalid_dates" };
    }

    const spanDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000);
    const scopeAll = !!filters.scopeAllOrganizations;

    if (!scopeAll) {
        const hasOrg = !!(filters.organizationId || filters.organizationYearIds?.length);
        if (!hasOrg) {
            return { ok: false, error: "scope_required" };
        }
    } else if (spanDays > MAX_DAYS_ALL_ORGS) {
        return { ok: false, error: "date_span_too_long" };
    }

    let yearIds: string[] | undefined;
    if (!scopeAll && filters.organizationYearIds?.length) {
        yearIds = filters.organizationYearIds;
    } else if (!scopeAll && filters.organizationId) {
        const years = await db.query.organizationYears.findMany({
            where: eq(organizationYearsTable.organizationId, filters.organizationId),
            columns: { id: true },
        });
        yearIds = years.map((y) => y.id);
        if (yearIds.length === 0) {
            return { ok: true, data: emptyData() };
        }
    }

    const baseWhereJoined = buildJoinedWhere(filters, yearIds, fromDate, toDate);

    const serious =
        filters.seriousMinLessons != null || filters.seriousMinAvgScorePct != null;

    let qualifyingUserIds: string[] | undefined;
    if (serious) {
        const userRows = await db
            .select({
                userId: userLessonResults.userId,
                distinctLessons: sql<number>`count(distinct ${userLessonResults.lessonId})::int`,
                rightSum: sql<number>`coalesce(sum(${userLessonResults.rightQuestions}), 0)::int`,
                totalSum: sql<number>`coalesce(sum(${userLessonResults.totalQuestions}), 0)::int`,
            })
            .from(userLessonResults)
            .innerJoin(lessons, eq(userLessonResults.lessonId, lessons.id))
            .innerJoin(lessonCategory, eq(lessons.lessonCategoryId, lessonCategory.id))
            .innerJoin(users, eq(userLessonResults.userId, users.id))
            .leftJoin(
                userSystemStats,
                and(
                    eq(userSystemStats.userId, users.id),
                    eq(userSystemStats.systemStep, userLessonResults.systemStep),
                ),
            )
            .where(baseWhereJoined)
            .groupBy(userLessonResults.userId);

        qualifyingUserIds = userRows
            .filter((row) => {
                const pct = row.totalSum > 0 ? (100 * row.rightSum) / row.totalSum : 0;
                const okLessons =
                    filters.seriousMinLessons == null ||
                    row.distinctLessons >= filters.seriousMinLessons;
                const okAvg =
                    filters.seriousMinAvgScorePct == null ||
                    pct >= filters.seriousMinAvgScorePct;
                return okLessons && okAvg;
            })
            .map((r) => r.userId);

        if (qualifyingUserIds.length === 0) {
            return { ok: true, data: emptyData() };
        }
    }

    const aggWhere =
        qualifyingUserIds && qualifyingUserIds.length > 0
            ? and(baseWhereJoined, inArray(userLessonResults.userId, qualifyingUserIds))!
            : baseWhereJoined;

    const categoryAgg = await db
        .select({
            categoryId: lessonCategory.id,
            categoryTitle: lessonCategory.title,
            categoryType: lessonCategory.categoryType,
            systemStep: lessonCategory.systemStep,
            completions: sql<number>`count(*)::int`,
            rightSum: sql<number>`coalesce(sum(${userLessonResults.rightQuestions}), 0)::int`,
            totalSum: sql<number>`coalesce(sum(${userLessonResults.totalQuestions}), 0)::int`,
            distinctUsers: sql<number>`count(distinct ${userLessonResults.userId})::int`,
        })
        .from(userLessonResults)
        .innerJoin(lessons, eq(userLessonResults.lessonId, lessons.id))
        .innerJoin(lessonCategory, eq(lessons.lessonCategoryId, lessonCategory.id))
        .innerJoin(users, eq(userLessonResults.userId, users.id))
        .leftJoin(
            userSystemStats,
            and(
                eq(userSystemStats.userId, users.id),
                eq(userSystemStats.systemStep, userLessonResults.systemStep),
            ),
        )
        .where(aggWhere)
        .groupBy(
            lessonCategory.id,
            lessonCategory.title,
            lessonCategory.categoryType,
            lessonCategory.systemStep
        );

    const byCategory: LearningBiCategoryRow[] = categoryAgg.map((row) => {
        const pct =
            row.totalSum > 0 ? Math.round((10000 * row.rightSum) / row.totalSum) / 100 : 0;
        return {
            categoryId: row.categoryId,
            categoryTitle: row.categoryTitle,
            categoryType: row.categoryType,
            systemStep: row.systemStep,
            completions: row.completions,
            rightSum: row.rightSum,
            totalSum: row.totalSum,
            distinctUsers: row.distinctUsers,
            weightedAccuracyPct: pct,
        };
    }).sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle, "he"));

    const progAgg = await db
        .select({
            categoryId: lessonCategory.id,
            categoryTitle: lessonCategory.title,
            lessonOrder: lessons.lessonOrder,
            completions: sql<number>`count(*)::int`,
            rightSum: sql<number>`coalesce(sum(${userLessonResults.rightQuestions}), 0)::int`,
            totalSum: sql<number>`coalesce(sum(${userLessonResults.totalQuestions}), 0)::int`,
            distinctUsers: sql<number>`count(distinct ${userLessonResults.userId})::int`,
        })
        .from(userLessonResults)
        .innerJoin(lessons, eq(userLessonResults.lessonId, lessons.id))
        .innerJoin(lessonCategory, eq(lessons.lessonCategoryId, lessonCategory.id))
        .innerJoin(users, eq(userLessonResults.userId, users.id))
        .leftJoin(
            userSystemStats,
            and(
                eq(userSystemStats.userId, users.id),
                eq(userSystemStats.systemStep, userLessonResults.systemStep),
            ),
        )
        .where(aggWhere)
        .groupBy(lessonCategory.id, lessonCategory.title, lessons.lessonOrder);

    const progByCat = new Map<string, LearningBiProgressionSeries>();
    for (const row of progAgg) {
        const pct =
            row.totalSum > 0 ? Math.round((10000 * row.rightSum) / row.totalSum) / 100 : 0;
        const point: LearningBiProgressionPoint = {
            lessonOrder: row.lessonOrder,
            completions: row.completions,
            rightSum: row.rightSum,
            totalSum: row.totalSum,
            distinctUsers: row.distinctUsers,
            weightedAccuracyPct: pct,
        };
        const existing = progByCat.get(row.categoryId);
        if (existing) {
            existing.points.push(point);
        } else {
            progByCat.set(row.categoryId, {
                categoryId: row.categoryId,
                categoryTitle: row.categoryTitle,
                points: [point],
            });
        }
    }

    const progression: LearningBiProgressionSeries[] = Array.from(progByCat.values())
        .map((s) => ({
            ...s,
            points: [...s.points].sort((a, b) => a.lessonOrder - b.lessonOrder),
        }))
        .sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle, "he"));

    const totalCompletions = byCategory.reduce((s, r) => s + r.completions, 0);
    const rightTotal = byCategory.reduce((s, r) => s + r.rightSum, 0);
    const qTotal = byCategory.reduce((s, r) => s + r.totalSum, 0);
    const weightedAccuracyPct =
        qTotal > 0 ? Math.round((10000 * rightTotal) / qTotal) / 100 : 0;

    let qualifyingUserCount: number;
    if (qualifyingUserIds) {
        qualifyingUserCount = qualifyingUserIds.length;
    } else {
        const [row] = await db
            .select({
                c: sql<number>`count(distinct ${userLessonResults.userId})::int`,
            })
            .from(userLessonResults)
            .innerJoin(lessons, eq(userLessonResults.lessonId, lessons.id))
            .innerJoin(lessonCategory, eq(lessons.lessonCategoryId, lessonCategory.id))
            .innerJoin(users, eq(userLessonResults.userId, users.id))
            .leftJoin(
                userSystemStats,
                and(
                    eq(userSystemStats.userId, users.id),
                    eq(userSystemStats.systemStep, userLessonResults.systemStep),
                ),
            )
            .where(aggWhere);
        qualifyingUserCount = row?.c ?? 0;
    }

    return {
        ok: true,
        data: {
            summary: {
                qualifyingUserCount,
                totalCompletions,
                weightedAccuracyPct,
            },
            byCategory,
            progression,
        },
    };
}

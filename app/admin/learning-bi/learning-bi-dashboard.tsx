"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    type ChartData,
    type ChartOptions,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LEARNING_BI_ATTEMPT_HISTORY_NOTE } from "@/lib/learning-bi-constants";
import {
    getLearningBiFilterMeta,
    getLearningBiInsights,
    type GetLearningBiFilterMetaResult,
    type GetLearningBiInsightsResult,
    type LearningBiCategoryOption,
    type LearningBiFiltersInput,
    type LearningBiInsightsData,
    type LearningBiOrgYearOption,
} from "@/actions/learning-bi-insights";
import { BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ChartTitle,
    ChartTooltip,
    ChartLegend
);

function defaultDateRange(): { from: string; to: string } {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 30);
    return {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
    };
}

interface KpiCardProps {
    title: string;
    value: string;
}

function KpiCard({ title, value }: KpiCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <span className="text-2xl font-bold">{value}</span>
            </CardContent>
        </Card>
    );
}

export function LearningBiDashboard() {
    const [meta, setMeta] = useState<GetLearningBiFilterMetaResult | null>(null);
    const [result, setResult] = useState<GetLearningBiInsightsResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    const { from: defaultFrom, to: defaultTo } = defaultDateRange();
    const [from, setFrom] = useState(defaultFrom);
    const [to, setTo] = useState(defaultTo);
    const [scopeAllOrganizations, setScopeAllOrganizations] = useState(false);
    const [organizationId, setOrganizationId] = useState("");
    const [selectedYearIds, setSelectedYearIds] = useState<Set<string>>(new Set());
    const [useAllYearsInOrg, setUseAllYearsInOrg] = useState(true);
    const [systemStepFilter, setSystemStepFilter] = useState<string>("all");
    const [categorySelection, setCategorySelection] = useState<Set<string>>(new Set());
    const [minGeniusScore, setMinGeniusScore] = useState("");
    const [minExperience, setMinExperience] = useState("");
    const [useSeriousFilter, setUseSeriousFilter] = useState(false);
    const [seriousMinLessons, setSeriousMinLessons] = useState("5");
    const [seriousMinAvgScorePct, setSeriousMinAvgScorePct] = useState("55");
    const [progressionCategoryId, setProgressionCategoryId] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const metaData = meta && meta.ok ? meta.data : null;

    const yearOptionsForOrg = useMemo(() => {
        if (!organizationId || !metaData?.organizationYears) return [] as LearningBiOrgYearOption[];
        return metaData.organizationYears.filter((y) => y.organizationId === organizationId);
    }, [organizationId, metaData?.organizationYears]);

    const filteredCategoryOptions = useMemo(() => {
        if (!metaData?.categories) return [] as LearningBiCategoryOption[];
        if (systemStepFilter === "all") return metaData.categories;
        const step = Number(systemStepFilter);
        return metaData.categories.filter((c) => c.systemStep === step);
    }, [metaData?.categories, systemStepFilter]);

    const systemStepOptions = useMemo(() => {
        if (!metaData?.categories?.length) return [] as number[];
        const uniq = new Set<number>();
        for (const c of metaData.categories) uniq.add(c.systemStep);
        return Array.from(uniq).sort((a, b) => a - b);
    }, [metaData?.categories]);

    const loadMeta = useCallback(async () => {
        setLoading(true);
        const res = await getLearningBiFilterMeta();
        setMeta(res);
        if (res.ok && res.data.organizations.length > 0) {
            const firstOrg = res.data.organizations[0].id;
            setOrganizationId(firstOrg);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadMeta();
    }, [loadMeta]);

    function buildFilters(): LearningBiFiltersInput | null {
        const genius = minGeniusScore.trim() === "" ? undefined : Number(minGeniusScore);
        const exp = minExperience.trim() === "" ? undefined : Number(minExperience);
        const seriousL =
            useSeriousFilter && seriousMinLessons.trim() !== ""
                ? Number(seriousMinLessons)
                : undefined;
        const seriousA =
            useSeriousFilter && seriousMinAvgScorePct.trim() !== ""
                ? Number(seriousMinAvgScorePct)
                : undefined;

        const stepParsed =
            systemStepFilter !== "all" && systemStepFilter !== ""
                ? Number(systemStepFilter)
                : undefined;

        const cats = categorySelection.size > 0 ? Array.from(categorySelection) : undefined;

        if (
            (genius !== undefined && Number.isNaN(genius)) ||
            (exp !== undefined && Number.isNaN(exp)) ||
            (seriousL !== undefined && Number.isNaN(seriousL)) ||
            (seriousA !== undefined && Number.isNaN(seriousA))
        ) {
            setErrorMessage("ערכים מספריים לא תקינים.");
            return null;
        }

        const filters: LearningBiFiltersInput = {
            from,
            to,
            scopeAllOrganizations,
            organizationId:
                scopeAllOrganizations ? undefined :
                organizationId || undefined,
            organizationYearIds:
                scopeAllOrganizations ? undefined :
                useAllYearsInOrg || selectedYearIds.size === 0
                    ? undefined
                    : Array.from(selectedYearIds),
            systemStep: stepParsed ?? undefined,
            lessonCategoryIds: cats,
            minGeniusScore: genius ?? undefined,
            minExperience: exp ?? undefined,
            seriousMinLessons: seriousL ?? undefined,
            seriousMinAvgScorePct: seriousA ?? undefined,
        };

        if (!scopeAllOrganizations && !filters.organizationId) {
            setErrorMessage("בחר ארגון או הפעל ״כל הארגונים״ (טווח לכל היותר 90 יום).");
            return null;
        }

        setErrorMessage(null);
        return filters;
    }

    const refreshInsights = useCallback(async () => {
        const filters = buildFilters();
        if (!filters) return;

        setLoadingData(true);
        const res = await getLearningBiInsights(filters);
        setLoadingData(false);
        setResult(res);
        if (res.ok === false && "forbidden" in res) {
            setErrorMessage("אין הרשאה לצפות בנתוני הלימוד.");
            return;
        }
        if (res.ok === false && "error" in res) {
            if (res.error === "scope_required") {
                setErrorMessage("יש לבחור ארגון, או לסמן ״כל הארגונים״ עם טווח תאריכים של עד 90 יום.");
            } else if (res.error === "date_span_too_long") {
                setErrorMessage(`בחירת ״כל הארגונים״ מוגבלת ל־${90} ימים בתאריכים.`);
            } else if (res.error === "invalid_dates") {
                setErrorMessage("טווח תאריכים לא תקין.");
            }
            return;
        }
        setErrorMessage(null);
    }, [
        from,
        to,
        scopeAllOrganizations,
        organizationId,
        selectedYearIds,
        useAllYearsInOrg,
        systemStepFilter,
        categorySelection,
        minGeniusScore,
        minExperience,
        useSeriousFilter,
        seriousMinLessons,
        seriousMinAvgScorePct,
    ]);

    useEffect(() => {
        if (loading !== false) return;
        if (meta?.ok !== true) return;
        if (scopeAllOrganizations) return;
        if (!organizationId) return;

        void refreshInsights();
        // Omit refreshInsights from deps: avoids refetch on every filter keystroke; runs on bootstrap and org/scope changes only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, meta?.ok, scopeAllOrganizations, organizationId]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        void refreshInsights();
    }

    function toggleYear(id: string) {
        setSelectedYearIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleCategory(id: string) {
        setCategorySelection((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    const progressionSeries =
        result && result.ok === true ? result.data.progression ?? [] : [];
    const progressionForChart =
        progressionSeries.find((s) => s.categoryId === progressionCategoryId) ?? null;

    useEffect(() => {
        if (progressionSeries.length === 0) {
            setProgressionCategoryId("");
            return;
        }
        const exists = progressionSeries.some((s) => s.categoryId === progressionCategoryId);
        if (!exists && progressionSeries[0]) {
            setProgressionCategoryId(progressionSeries[0].categoryId);
        }
    }, [progressionSeries, progressionCategoryId]);

    const insightsData: LearningBiInsightsData | null =
        result && result.ok === true ? result.data : null;

    const categoryBarData: ChartData<"bar"> = useMemo(() => {
        const rows = insightsData?.byCategory ?? [];
        return {
            labels: rows.map((r) => r.categoryTitle.slice(0, 32)),
            datasets: [
                {
                    label: "ממוצע משוקלל (%)",
                    data: rows.map((r) => r.weightedAccuracyPct),
                    backgroundColor: "rgba(56, 189, 248, 0.5)",
                },
            ],
        };
    }, [insightsData]);

    const categoryBarOptions: ChartOptions<"bar"> = useMemo(
        () => ({
            responsive: true,
            scales: {
                x: {
                    ticks: { maxRotation: 45, minRotation: 45 },
                    grid: { display: false },
                },
                y: { beginAtZero: true, max: 100 },
            },
        }),
        []
    );

    const progressionLineData: ChartData<"line"> = useMemo(() => {
        const pts = progressionForChart?.points ?? [];
        return {
            labels: pts.map((p) => `תרגול ${p.lessonOrder}`),
            datasets: [
                {
                    label: "מדויקות משוקללת (%)",
                    data: pts.map((p) => p.weightedAccuracyPct),
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.25)",
                    tension: 0.2,
                    fill: false,
                },
            ],
        };
    }, [progressionForChart]);

    const progressionChartOptions: ChartOptions<"line"> = useMemo(() => {
        const title =
            progressionForChart?.categoryTitle !== undefined ?
                progressionForChart.categoryTitle
                : "";

        return {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100 },
            },
            plugins: {
                legend: { display: true },
                title:
                    title.length > 0 ? { display: false, text: title } : { display: false },
            },
        };
    }, [progressionForChart?.categoryTitle]);

    if (loading && meta === null) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4" dir="rtl">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (meta !== null && meta.ok === false) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8" dir="rtl">
                <p className="text-muted-foreground">אין הרשאת מנהל.</p>
                <Button asChild variant="primaryOutlineBorder">
                    <Link href="/">חזרה לדף הבית</Link>
                </Button>
            </div>
        );
    }

    const submitDisabled =
        loadingData ||
        (!scopeAllOrganizations && !organizationId) ||
        (!useAllYearsInOrg && selectedYearIds.size === 0);

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-6" dir="rtl">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-sky-500 p-2 text-white shadow-md">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">דשבורד BI לימוד</h1>
                            <p className="text-sm text-muted-foreground">
                                מנהלים פנימיים — סיכומי הצלחה לפי מקצועות וכיתות
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="primaryOutlineBorder">
                        <Link href="/admin">מרכז מנהלה (CRM)</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">פרשנות נתונים</CardTitle>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {LEARNING_BI_ATTEMPT_HISTORY_NOTE} עקומת ״סדר תרגול״ משווה <strong>
                                זה לצד זה תרגולים שונים
                            </strong>{" "}
                            (אותם תלמידים מתקדמים עשויים להיחשף לכל אחד בנפרד). סינון ציון גאונות וניסיון נשען על נתוני השלב (user_system_stats), כפי שמוצגים באפליקציה לרוב.
                        </p>
                    </CardHeader>
                </Card>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap gap-6">
                        <div className="space-y-2">
                            <Label>מתאריך</Label>
                            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>עד תאריך</Label>
                            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="space-y-2">
                                <Label className="block">כל הארגונים ({90} יום מירבי לטווח)</Label>
                                <div className="flex h-11 items-center gap-2">
                                    <Switch
                                        checked={scopeAllOrganizations}
                                        onCheckedChange={(v) => {
                                            setScopeAllOrganizations(v);
                                            if (v) {
                                                setUseAllYearsInOrg(true);
                                                setSelectedYearIds(new Set());
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {!scopeAllOrganizations && metaData?.organizations?.length ?
                        <>
                            <div className="max-w-md space-y-2">
                                <Label>ארגון</Label>
                                <Select
                                    value={organizationId}
                                    onValueChange={(v) => {
                                        setOrganizationId(v);
                                        setSelectedYearIds(new Set());
                                        setUseAllYearsInOrg(true);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחר ארגון" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metaData.organizations.map((o) => (
                                            <SelectItem key={o.id} value={o.id}>
                                                {o.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {yearOptionsForOrg.length > 0 ?
                                <>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border"
                                                checked={useAllYearsInOrg}
                                                onChange={(e) => setUseAllYearsInOrg(e.target.checked)}
                                            />
                                            כל השנים בארגון
                                        </Label>
                                    </div>
                                    {!useAllYearsInOrg ?
                                        <fieldset className="flex flex-wrap gap-3 rounded-lg border p-3">
                                            <legend className="sr-only">שנות לימוד בארגון</legend>
                                            {yearOptionsForOrg.map((y) => (
                                                <label key={y.id} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedYearIds.has(y.id)}
                                                        onChange={() => toggleYear(y.id)}
                                                        className="h-4 w-4 rounded border"
                                                    />
                                                    {y.year}{" "}
                                                    {y.organizationName ? ` (${y.organizationName})` : ""}
                                                </label>
                                            ))}
                                        </fieldset>
                                    : null}
                                </>
                            : null}
                        </>
                    : null}

                    <div className="flex flex-wrap gap-6">
                        <div className="max-w-xs space-y-2">
                            <Label>שלב</Label>
                            <Select value={systemStepFilter} onValueChange={setSystemStepFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="כל השלבים" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">כל השלבים</SelectItem>
                                    {systemStepOptions.map((st) => (
                                        <SelectItem key={st} value={String(st)}>
                                            שלב {st}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full max-w-xs space-y-2">
                            <Label>ציון גאונות מינימום לפי שלב השיעור</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="ריק — ללא"
                                value={minGeniusScore}
                                onChange={(e) => setMinGeniusScore(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                נספר מ־user_system_stats עבור אותו system_step כמו ההשלמה (כמו בתצוגת המשתמש באפליקציה), עם נפילה חלופית לערך ישן בטבלת users.
                            </p>
                        </div>
                        <div className="w-full max-w-xs space-y-2">
                            <Label>ניסיון מינימום לפי שלב השיעור</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="ריק — ללא"
                                value={minExperience}
                                onChange={(e) => setMinExperience(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                מקור: user_system_stats לפי שלב השיעור, כמו למעלה.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">סינון ״לומדים רציניים״ בתוך הטווח</Label>
                                <p className="text-xs text-muted-foreground">
                                    רק משתמשים שהשלמו מספר שיעורים מינימלי ו/או ממוצע אחוזי הצלחה מעל סף בהשלמות בטווח.
                                </p>
                            </div>
                            <Switch checked={useSeriousFilter} onCheckedChange={setUseSeriousFilter} />
                        </div>
                        {useSeriousFilter ?
                            <div className="mt-4 flex flex-wrap gap-4">
                                <div className="w-36 space-y-2">
                                    <Label>שיעורים שונים (מינימום)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={seriousMinLessons}
                                        onChange={(e) => setSeriousMinLessons(e.target.value)}
                                    />
                                </div>
                                <div className="w-36 space-y-2">
                                    <Label>ממוצע % (מינימום)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={seriousMinAvgScorePct}
                                        onChange={(e) => setSeriousMinAvgScorePct(e.target.value)}
                                    />
                                </div>
                            </div>
                        : null}
                    </div>

                    <div>
                        <Label className="mb-2 block">מקצועות — סמן למצב סינון (ברירת מחדל: כל המקצועות)</Label>
                        <div className="max-h-56 overflow-y-auto rounded-lg border bg-background p-3">
                            <div className="mb-2 flex gap-4 text-xs">
                                <button
                                    type="button"
                                    className="text-sky-600 underline"
                                    onClick={() => setCategorySelection(new Set())}
                                >
                                    נקה
                                </button>
                                <button
                                    type="button"
                                    className="text-sky-600 underline"
                                    onClick={() =>
                                        setCategorySelection(
                                            new Set(filteredCategoryOptions.map((c) => c.id))
                                        )
                                    }
                                >
                                    הכל בשלב הנבחר
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {filteredCategoryOptions.map((c) => (
                                    <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 shrink-0 rounded border"
                                            checked={categorySelection.has(c.id)}
                                            onChange={() => toggleCategory(c.id)}
                                        />
                                        <span>
                                            ({c.systemStep}) {c.title}
                                        </span>
                                    </label>
                                ))}
                                {filteredCategoryOptions.length === 0 ?
                                    <span className="text-sm text-muted-foreground">
                                        לא נטענו קטגוריות עדיין
                                    </span>
                                : null}
                            </div>
                        </div>
                    </div>

                    {errorMessage ?
                        <p className="text-sm font-medium text-rose-600">{errorMessage}</p>
                    : null}

                    <Button type="submit" variant="super" disabled={submitDisabled}>
                        {loadingData ?
                            <Loader2 className="h-4 w-4 animate-spin" />
                        : "חשב מחדש"}
                    </Button>
                </form>

                {loadingData && result === null ?
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    </div>
                : null}

                {!loadingData || result ?
                    <>
                        {result && !result.ok ?
                            <Card>
                                <CardContent className="pt-6 text-sm text-muted-foreground">
                                    אין הרשאה לנתונים או בקשה נכשלה.
                                </CardContent>
                            </Card>
                        : null}

                        {result?.ok ?
                            <>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <KpiCard
                                        title="לומדים (באכלוס המסכים)"
                                        value={String(insightsData?.summary.qualifyingUserCount ?? "—")}
                                    />
                                    <KpiCard title="סה״כ השלמות" value={String(insightsData?.summary.totalCompletions ?? "—")} />
                                    <KpiCard
                                        title="מדויקות משוקללת כללית (%)"
                                        value={
                                            insightsData ?
                                                insightsData.summary.weightedAccuracyPct.toFixed(1)
                                            : "—"
                                        }
                                    />
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>מקצוע — מדויקות משוקללת (%)</CardTitle>
                                            <p className="text-sm font-normal text-muted-foreground">
                                                סכום נכון / סכום שאלות בתוך כל קטגוריה בהתאמה לפילטרים.
                                            </p>
                                        </CardHeader>
                                        <CardContent className="h-96">
                                            {(insightsData?.byCategory.length ?? 0) === 0 ?
                                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                    אין נתונים בטווח
                                                </div>
                                            : (
                                                <Bar data={categoryBarData} options={categoryBarOptions} />
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                                                התקדמות לפי סדר תרגול בעמוד
                                                {progressionSeries.length > 0 ?
                                                    <div className="max-w-[220px]">
                                                        <Select
                                                            dir="rtl"
                                                            value={
                                                                progressionCategoryId ||
                                                                progressionSeries[0]?.categoryId ||
                                                                ""
                                                            }
                                                            onValueChange={setProgressionCategoryId}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="בחר קטגוריה" />
                                                            </SelectTrigger>
                                                            <SelectContent dir="rtl">
                                                                {progressionSeries.map((s) => (
                                                                    <SelectItem key={s.categoryId} value={s.categoryId}>
                                                                        {s.categoryTitle.slice(0, 40)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                : null}
                                            </CardTitle>
                                            <p className="text-sm font-normal text-muted-foreground">
                                                מדויקות משוקללת לפי מספר הסדר של השיעור בתוך המקצוע הנבחר (שדה סדר השיעור במסד).
                                            </p>
                                        </CardHeader>
                                        <CardContent className="h-96">
                                            {!progressionForChart?.points?.length ?
                                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                    אין עקומה — אחרי חישוב, בחרו מקצוע עם נתונים.
                                                </div>
                                            : (
                                                <Line
                                                    data={progressionLineData}
                                                    options={progressionChartOptions}
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>טבלת סיכום — מקצועות</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-sm">
                                                <thead>
                                                    <tr className="border-b text-start">
                                                        <th className="px-3 py-2 font-semibold">מקצוע</th>
                                                        <th className="px-3 py-2 font-semibold">שלב</th>
                                                        <th className="px-3 py-2 font-semibold">השלמות</th>
                                                        <th className="px-3 py-2 font-semibold">משתמשים</th>
                                                        <th className="px-3 py-2 font-semibold">%</th>
                                                        <th className="px-3 py-2 font-semibold">סוג</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(insightsData?.byCategory ?? []).map((r) => (
                                                        <tr key={r.categoryId} className="border-b">
                                                            <td className="px-3 py-2">{r.categoryTitle}</td>
                                                            <td className="px-3 py-2">{r.systemStep}</td>
                                                            <td className="px-3 py-2">{r.completions}</td>
                                                            <td className="px-3 py-2">{r.distinctUsers}</td>
                                                            <td className="px-3 py-2 font-medium">
                                                                {r.weightedAccuracyPct.toFixed(1)}%
                                                            </td>
                                                            <td className="max-w-[120px] truncate px-3 py-2 text-muted-foreground">
                                                                {r.categoryType}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {(insightsData?.byCategory.length ?? 0) === 0 ?
                                                <div className="py-12 text-center text-muted-foreground">
                                                    אין שורות בתצוגה
                                                </div>
                                            : null}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        : null}
                    </>
                : null}
            </div>
        </div>
    );
}

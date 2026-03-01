"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
} from "chart.js";
import { authenticateBi } from "@/actions/bi-auth";
import {
    getBiInsights,
    type GetBiInsightsResult,
} from "@/actions/bi-insights";
import { DollarSign, ShoppingCart, XCircle, Clock, Loader2 } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    ChartTitle,
    ChartTooltip,
    ChartLegend
);

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("he-IL", {
        style: "currency",
        currency: "ILS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(cents / 100);
}

function defaultDateRange(): { from: string; to: string } {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 30);
    return {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
    };
}

export default function BiPage() {
    const [result, setResult] = useState<GetBiInsightsResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);

    const fetchInsights = useCallback(async (fromDate: string, toDate: string) => {
        setLoading(true);
        const res = await getBiInsights(fromDate, toDate);
        setResult(res);
        setLoading(false);
    }, []);

    useEffect(() => {
        const { from: f, to: t } = defaultDateRange();
        setFrom(f);
        setTo(t);
        fetchInsights(f, t);
    }, [fetchInsights]);

    const handleDateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (from && to) fetchInsights(from, to);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setAuthLoading(true);
        const res = await authenticateBi(password);
        setAuthLoading(false);
        if (res.success) {
            if (from && to) fetchInsights(from, to);
        } else {
            setAuthError(res.error);
        }
    };

    if (loading && result === null) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (result && !result.ok && result.needsAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>BI Dashboard</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Enter password to view purchase insights.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                disabled={authLoading}
                            />
                            {authError && (
                                <p className="text-sm text-destructive">{authError}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={authLoading}>
                                {authLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Enter"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const data = result?.ok ? result.data : null;
    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <h1 className="text-2xl font-bold">Purchase BI</h1>

                <form onSubmit={handleDateSubmit} className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">From</label>
                        <Input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">To</label>
                        <Input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                </form>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <KpiCard
                                title="Revenue (from transactions)"
                                value={formatCurrency(data.summary.totalRevenue)}
                                icon={<DollarSign className="h-4 w-4" />}
                            />
                            <KpiCard
                                title="Paid"
                                value={String(data.summary.paidCount)}
                                icon={<ShoppingCart className="h-4 w-4" />}
                            />
                            <KpiCard
                                title="Failed"
                                value={String(data.summary.failedCount)}
                                icon={<XCircle className="h-4 w-4" />}
                            />
                            <KpiCard
                                title="Pending"
                                value={String(data.summary.createdCount)}
                                icon={<Clock className="h-4 w-4" />}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue & count over time</CardTitle>
                                    <p className="text-sm font-normal text-muted-foreground">
                                        Revenue = sum of payment transaction amounts (total_price), not plan list price.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <Bar
                                        data={{
                                            labels: data.timeSeries.map((p) => p.date),
                                            datasets: [
                                                {
                                                    label: "Revenue (₪)",
                                                    data: data.timeSeries.map((p) => p.revenue / 100),
                                                    backgroundColor: "rgba(56, 189, 248, 0.5)",
                                                },
                                                {
                                                    label: "Count",
                                                    data: data.timeSeries.map((p) => p.count),
                                                    backgroundColor: "rgba(34, 197, 94, 0.5)",
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            scales: {
                                                y: { beginAtZero: true },
                                            },
                                        }}
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>By status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Doughnut
                                        data={{
                                            labels: data.byStatus.map((p) => p.status),
                                            datasets: [
                                                {
                                                    data: data.byStatus.map((p) => p.count),
                                                    backgroundColor: [
                                                        "rgba(34, 197, 94, 0.6)",
                                                        "rgba(239, 68, 68, 0.6)",
                                                        "rgba(156, 163, 175, 0.6)",
                                                        "rgba(249, 115, 22, 0.6)",
                                                        "rgba(59, 130, 246, 0.6)",
                                                    ],
                                                },
                                            ],
                                        }}
                                        options={{ responsive: true }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        {data.byPlan.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue by plan</CardTitle>
                                    <p className="text-sm font-normal text-muted-foreground">
                                        Sum of payment transaction amounts (total_price) per plan. Plan name for reference only.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-left">
                                                    <th className="pb-2 pr-4">Plan</th>
                                                    <th className="pb-2 pr-4">Transactions</th>
                                                    <th className="pb-2">Revenue (from transactions)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.byPlan.map((p) => (
                                                    <tr key={p.planId} className="border-b">
                                                        <td className="py-2 pr-4">{p.planName}</td>
                                                        <td className="py-2 pr-4">{p.count}</td>
                                                        <td className="py-2 font-medium">{formatCurrency(p.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent transactions</CardTitle>
                                <p className="text-sm font-normal text-muted-foreground">
                                    Amount = payment transaction total_price (actual paid). Plan is for reference only.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left">
                                                <th className="pb-2 pr-4">Date</th>
                                                <th className="pb-2 pr-4">Status</th>
                                                <th className="pb-2 pr-4">Plan</th>
                                                <th className="pb-2 pr-4">Amount paid</th>
                                                <th className="pb-2 pr-4">Student</th>
                                                <th className="pb-2 pr-4">Email</th>
                                                <th className="pb-2">Receipt ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentTransactions.map((tx) => (
                                                <tr key={tx.id} className="border-b">
                                                    <td className="py-2 pr-4 text-muted-foreground">
                                                        {tx.createdAt
                                                            ? new Date(tx.createdAt).toLocaleString()
                                                            : "—"}
                                                    </td>
                                                    <td className="py-2 pr-4">{tx.status}</td>
                                                    <td className="py-2 pr-4">{tx.planName}</td>
                                                    <td className="py-2 pr-4 font-medium">
                                                        {formatCurrency(tx.totalPrice)}
                                                    </td>
                                                    <td className="py-2 pr-4">{tx.studentName ?? "—"}</td>
                                                    <td className="py-2 pr-4">{tx.email ?? "—"}</td>
                                                    <td className="py-2 font-mono text-muted-foreground">
                                                        {tx.receiptId ?? "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}

function KpiCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <span className="text-2xl font-bold">{value}</span>
            </CardContent>
        </Card>
    );
}

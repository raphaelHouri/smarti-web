"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Award, BookOpen, Target, Activity, BarChart3, Home, Ticket } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCouponSummary } from '@/actions/get-coupon-summary';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    type ChartData,
    type ChartOptions,
    type ChartDataset,
} from 'chart.js';

// Register Chart.js components once at module scope
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTitle, ChartTooltip, ChartLegend);

interface YearAnalytics {
    yearId: string;
    year: number;
    totalLessons: number;
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    totalUsers: number;
    activeUsers: number;
}

interface OrganizationAnalytics {
    organizationId: string;
    organizationName: string;
    contactEmail: string | null;
    city: string | null;
    totalUsers: number;
    averageExperience: number;
    averageGeniusScore: number;
    years: YearAnalytics[];
}

interface ManagedOrganization {
    id: string;
    name: string;
    contactEmail: string | null;
    city: string | null;
}

interface AnalyticsResponse {
    managedOrganizations: ManagedOrganization[];
    analytics: OrganizationAnalytics[];
}

interface UserPerformance {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    experience: number;
    geniusScore: number;
    totalLessons: number;
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
}

interface CouponUser {
    email: string;
    name: string;
    saveDate: string;
    redeemDate: string | null;
}

interface CouponsSummary {
    couponCode: string;
    expiryDate: string;
    couponType: string;
    maxCoupons: number;
    savedCoupons: number;
    redeemedCoupons: number;
    notRedeemedCoupons: number;
    users: CouponUser[];
}

// DEPRECATED: Mock coupons data generator - no longer used, replaced with real API data
// Kept for reference only
/* const getMockCouponsForYear = (yearId: string): CouponsSummary => {
    // Use yearId hash to generate consistent mock data per organization year
    const hash = yearId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = [
        {
            couponCode: 'SUMMER2024',
            expiryDate: '2024-12-31',
            couponType: 'הנחה אחוזית',
            maxCoupons: 100,
            savedCoupons: 75,
            redeemedCoupons: 45,
            notRedeemedCoupons: 30,
            users: [
                { email: 'user1@example.com', name: 'יוסי כהן', saveDate: '2024-06-15', redeemDate: '2024-07-20' },
                { email: 'user2@example.com', name: 'שרה לוי', saveDate: '2024-06-18', redeemDate: null },
                { email: 'user3@example.com', name: 'דוד אברהם', saveDate: '2024-07-01', redeemDate: '2024-07-15' },
            ],
        },
        {
            couponCode: 'WINTER2024',
            expiryDate: '2025-03-31',
            couponType: 'הנחה קבועה',
            maxCoupons: 50,
            savedCoupons: 42,
            redeemedCoupons: 28,
            notRedeemedCoupons: 14,
            users: [
                { email: 'user4@example.com', name: 'מיכל דוד', saveDate: '2024-08-10', redeemDate: '2024-08-25' },
                { email: 'user5@example.com', name: 'אלון ישראלי', saveDate: '2024-08-15', redeemDate: null },
            ],
        },
        {
            couponCode: 'SPRING2024',
            expiryDate: '2024-11-30',
            couponType: 'הנחה אחוזית',
            maxCoupons: 80,
            savedCoupons: 60,
            redeemedCoupons: 40,
            notRedeemedCoupons: 20,
            users: [
                { email: 'user6@example.com', name: 'רותם כהן', saveDate: '2024-05-10', redeemDate: '2024-06-05' },
                { email: 'user7@example.com', name: 'עמית לוי', saveDate: '2024-05-15', redeemDate: null },
                { email: 'user8@example.com', name: 'נועה ישראלי', saveDate: '2024-05-20', redeemDate: '2024-06-10' },
            ],
        },
    ];
    return variants[hash % variants.length];
}; */

export default function OrganizationAnalyticsPage() {
    const [managedOrganizations, setManagedOrganizations] = useState<ManagedOrganization[]>([]);
    const [analytics, setAnalytics] = useState<OrganizationAnalytics[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [organizationUsers, setOrganizationUsers] = useState<UserPerformance[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserPerformance | null>(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedCouponYear, setSelectedCouponYear] = useState<{ yearId: string, year: number, orgName: string, organizationId: string } | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/organization-analytics');
            if (response.ok) {
                const data: AnalyticsResponse = await response.json();
                setManagedOrganizations(data.managedOrganizations);
                setAnalytics(data.analytics);

                // If only one organization, auto-select it
                if (data.managedOrganizations.length === 1) {
                    setSelectedOrg(data.managedOrganizations[0].id);
                } else if (data.managedOrganizations.length > 1 && selectedOrg === 'all') {
                    // Default to first organization if multiple exist and none selected
                    setSelectedOrg(data.managedOrganizations[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data based on selections
    const filteredAnalytics = analytics.filter(org =>
        selectedOrg === 'all' || org.organizationId === selectedOrg
    );

    const allYears = Array.from(new Set(
        analytics.flatMap(org => (org.years || []).map(y => y.year))
    )).sort((a, b) => b - a);

    // Build year select options based on current org selection
    const availableYearOptions = (
        selectedOrg === 'all'
            ? analytics.flatMap(org => (org.years || []).map(y => ({ id: y.yearId, year: y.year })))
            : (analytics.find(org => org.organizationId === selectedOrg)?.years || []).map(y => ({ id: y.yearId, year: y.year }))
    )
        // unique by id
        .reduce((acc: { id: string; year: number }[], cur) => {
            if (!acc.some(a => a.id === cur.id)) acc.push(cur);
            return acc;
        }, [])
        .sort((a, b) => b.year - a.year);

    const selectedOrgData = analytics.find(org => org.organizationId === selectedOrg);
    const filteredYears = selectedOrg === 'all'
        ? allYears
        : (selectedOrgData?.years || []).map(y => y.year);

    // Helper to filter years per org based on selectedYear (by yearId)
    const getOrgYears = (org: OrganizationAnalytics) => (
        selectedYear === 'all' ? (org.years || []) : (org.years || []).filter(y => y.yearId === selectedYear)
    );

    const fetchOrganizationUsers = async () => {
        if (selectedOrg === 'all' || !selectedOrg) return;

        setLoadingUsers(true);
        try {
            const response = await fetch(`/api/organization-analytics/${selectedOrg}/users`);
            if (response.ok) {
                const data = await response.json();
                setOrganizationUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch organization users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (selectedOrg && selectedOrg !== 'all') {
            fetchOrganizationUsers();
        }
    }, [selectedOrg]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
                <div className="container mx-auto p-8">
                    <div className="flex items-center justify-center py-32">
                        <div className="text-center space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 flex items-center justify-center mx-auto">
                                    <BarChart3 className="h-8 w-8 text-white animate-pulse" />
                                </div>
                                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">טוען נתונים...</p>
                                <p className="text-sm text-slate-500">אנא המתן בזמן שאנו מעבדים את המידע</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="container mx-auto px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/learn">
                            <Button
                                variant="primaryOutline"
                                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                            >
                                <Home className="h-4 w-4" />
                                <span className="font-medium">חזרה לדף הבית</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md shadow-blue-500/20">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">דשבורד מנהלים</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-8 space-y-8">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start flex-wrap gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                                        <BarChart3 className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">ניתוח ארגונים</h1>
                                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                                            תובנות ביצועים מקיפות ומדדים מפורטים
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">

                                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                    <SelectTrigger className="w-[220px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                        <SelectValue placeholder="בחר ארגון" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managedOrganizations.length > 1 && (
                                            <SelectItem value="all">כל הארגונים</SelectItem>
                                        )}
                                        {managedOrganizations.map(org => (
                                            <SelectItem key={org.id} value={org.id}>
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[160px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                        <SelectValue placeholder="כל השנים" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">כל השנים</SelectItem>
                                        {availableYearOptions.map(opt => (
                                            <SelectItem key={opt.id} value={opt.id}>{opt.year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-8" dir="rtl">
                    <TabsList className="bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 w-full flex-row justify-end h-auto rounded-xl shadow-sm gap-1">
                        <TabsTrigger value="overview" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">סקירה כללית</TabsTrigger>
                        <TabsTrigger value="trends" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">ניהול קופונים</TabsTrigger>
                        <TabsTrigger value="detailed" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">תצוגה מפורטת</TabsTrigger>
                        <TabsTrigger value="mistakes" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">טעויות</TabsTrigger>
                        <TabsTrigger value="users" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">משתמשים</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="group relative overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-slate-900 rounded-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/60 to-transparent dark:from-blue-900/20 rounded-bl-full"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">סה״כ משתמשים</CardTitle>
                                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                                        <Users className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        {filteredAnalytics.reduce((sum, org) => sum + org.totalUsers, 0)}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        על פני {filteredAnalytics.length} {filteredAnalytics.length === 1 ? 'ארגון' : 'ארגונים'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-slate-900 rounded-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-100/60 to-transparent dark:from-cyan-900/20 rounded-bl-full"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">ממוצע ניסיון</CardTitle>
                                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/30">
                                        <Target className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                        {filteredAnalytics.length > 0
                                            ? Math.round(
                                                filteredAnalytics.reduce((sum, org) => sum + org.averageExperience, 0) /
                                                filteredAnalytics.length
                                            )
                                            : 0}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        ממוצע על כל המשתמשים
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-slate-900 rounded-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/60 to-transparent dark:from-blue-900/20 rounded-bl-full"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">ממוצע ניקוד גאונות</CardTitle>
                                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30">
                                        <Award className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                        {filteredAnalytics.length > 0
                                            ? Math.round(
                                                filteredAnalytics.reduce((sum, org) => sum + org.averageGeniusScore, 0) /
                                                filteredAnalytics.length
                                            )
                                            : 0}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        ממוצע ציון אינטליגנציה
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-slate-900 rounded-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-100/60 to-transparent dark:from-cyan-900/20 rounded-bl-full"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">פעילים החודש</CardTitle>
                                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30">
                                        <Activity className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                        {filteredAnalytics.reduce((sum, org) =>
                                            sum + getOrgYears(org).reduce((yearSum, year) => yearSum + year.activeUsers, 0), 0
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        משתמשים שהשלימו שיעורים
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Organization Cards */}
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAnalytics.map(org => (
                                <Card key={org.organizationId} className="group hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-xl">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1.5">
                                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{org.organizationName}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 text-slate-500 text-sm">
                                                    {org.city ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></span>
                                                            {org.city}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">מיקום לא צוין</span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                                <Users className="h-4 w-4 text-blue-500" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="text-center p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">משתמשים</p>
                                                <p className="font-bold text-blue-600 dark:text-blue-400 text-xl">{org.totalUsers}</p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">ניסיון</p>
                                                <p className="font-bold text-cyan-600 dark:text-cyan-400 text-xl">{org.averageExperience}</p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">גאונות</p>
                                                <p className="font-bold text-blue-600 dark:text-blue-400 text-xl">{org.averageGeniusScore}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-2">קופונים לפי שנה</p>
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                {getOrgYears(org).map(year => (
                                                    <Button
                                                        key={year.yearId}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-auto px-2.5 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-200 dark:hover:border-blue-700 transition-all"
                                                        onClick={() => setSelectedCouponYear({ yearId: year.yearId, year: year.year, orgName: org.organizationName, organizationId: org.organizationId })}
                                                        title={`צפה בקופונים לשנה ${year.year}`}
                                                    >
                                                        <span className="text-xs font-medium mr-1.5">{year.year}</span>
                                                        <Ticket className="h-3 w-3" />
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        {filteredAnalytics.map(org => (
                            <Card key={org.organizationId} className="border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden rounded-xl bg-white dark:bg-slate-900">
                                <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md shadow-blue-500/20">
                                            <BarChart3 className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{org.organizationName}</CardTitle>
                                            <CardDescription className="text-slate-500">מדדים מפורטים על כל השנים הפעילות</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-5">
                                        {getOrgYears(org).map(year => (
                                            <div key={year.yearId} className="rounded-xl p-5 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200/60 dark:border-slate-700">
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span>
                                                        שנה {year.year}
                                                    </h3>
                                                    <span className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 shadow-sm">
                                                        {year.totalUsers} משתמשים
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm">
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">ממוצע ציון</p>
                                                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                                            {year.averageScore.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm">
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">סה״כ שיעורים</p>
                                                        <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
                                                            {year.totalLessons}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm">
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">שאלות שנענו</p>
                                                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                                                            {year.totalQuestions}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm">
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">משתמשים פעילים</p>
                                                        <p className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                                            {year.activeUsers}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-6">
                        <CouponsManagementPanel
                            selectedOrgId={selectedOrg}
                            selectedYearId={selectedYear}
                            analytics={analytics}
                        />
                    </TabsContent>

                    <TabsContent value="detailed" className="space-y-6">
                        {filteredAnalytics.map(org => (
                            <Card key={org.organizationId} className="border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden rounded-xl bg-white dark:bg-slate-900">
                                <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md shadow-blue-500/20">
                                            <BookOpen className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{org.organizationName}</CardTitle>
                                            <CardDescription className="text-slate-500">
                                                {org.contactEmail} • {org.city}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Tabs defaultValue={org.years?.length > 0 ? `year-${org.years[0].yearId}` : undefined} dir="rtl">
                                        <TabsList className="mb-6 bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700 flex-row-reverse justify-end">
                                            {(org.years || []).map(year => (
                                                <TabsTrigger key={year.yearId} value={`year-${year.yearId}`} className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                                                    {year.year}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        {(org.years || []).map(year => (
                                            <TabsContent key={year.yearId} value={`year-${year.yearId}`}>
                                                <div className="grid gap-5 md:grid-cols-2">
                                                    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                                                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                                                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-blue-500" />
                                                                מדדי מעורבות
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-2 pt-4">
                                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">סה״כ משתמשים:</span>
                                                                <span className="font-bold text-lg text-slate-900 dark:text-white">{year.totalUsers}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">משתמשים פעילים:</span>
                                                                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{year.activeUsers}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">שיעור מעורבות:</span>
                                                                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                                                    {year.totalUsers > 0
                                                                        ? ((year.activeUsers / year.totalUsers) * 100).toFixed(1)
                                                                        : 0}%
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                                                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                                                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                                <Target className="h-4 w-4 text-cyan-500" />
                                                                מדדי ביצועים
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-2 pt-4">
                                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">ממוצע ציון:</span>
                                                                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{year.averageScore.toFixed(1)}%</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">סה״כ שיעורים:</span>
                                                                <span className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{year.totalLessons}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">שאלות שנענו:</span>
                                                                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{year.totalQuestions}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">תשובות נכונות:</span>
                                                                <span className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{year.correctAnswers}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        {selectedOrg === 'all' ? (
                            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                                        <Users className="h-12 w-12 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">אנא בחר ארגון ספציפי כדי לצפות במשתמשים</p>
                                </CardContent>
                            </Card>
                        ) : loadingUsers ? (
                            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                                <CardContent className="flex items-center justify-center py-20">
                                    <div className="text-center space-y-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                                        <p className="text-base text-slate-500">טוען משתמשים...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : organizationUsers.length === 0 ? (
                            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                                        <Users className="h-12 w-12 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">לא נמצאו משתמשים בארגון זה</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden rounded-xl bg-white dark:bg-slate-900">
                                    <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md shadow-blue-500/20">
                                                <Users className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                                    {selectedOrgData?.organizationName} - משתמשים ({organizationUsers.length})
                                                </CardTitle>
                                                <CardDescription className="text-slate-500">
                                                    מדדי ביצועים ומעורבות של משתמשים בודדים
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-right" dir="rtl">
                                                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">משתמש</th>
                                                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">אימייל</th>
                                                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">ניסיון</th>
                                                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">ניקוד גאונות</th>
                                                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">שיעורים</th>
                                                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">שאלות</th>
                                                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">ממוצע ציון</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {organizationUsers.map((user, idx) => (
                                                        <tr
                                                            key={user.id}
                                                            className={`border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-all duration-150 group ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                                                                        {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                            {user.firstName} {user.lastName}
                                                                        </div>
                                                                        <div className="text-sm text-slate-500">
                                                                            @{user.username}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-sm text-slate-500 text-right">{user.email}</td>
                                                            <td className="p-4 text-right font-semibold text-slate-700 dark:text-slate-300">{user.experience}</td>
                                                            <td className="p-4 text-right font-semibold text-blue-600 dark:text-blue-400">{user.geniusScore}</td>
                                                            <td className="p-4 text-right font-semibold text-cyan-600 dark:text-cyan-400">{user.totalLessons}</td>
                                                            <td className="p-4 text-right font-semibold text-blue-600 dark:text-blue-400">{user.totalQuestions}</td>
                                                            <td className="p-4 text-right">
                                                                <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${user.averageScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                                                    user.averageScore >= 60 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                                    }`}>
                                                                    {user.averageScore.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                                {selectedUser && (
                                    <UserMistakesModal
                                        user={selectedUser}
                                        onClose={() => setSelectedUser(null)}
                                        organizationId={selectedOrg}
                                        selectedYearId={selectedYear}
                                    />
                                )}
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="mistakes" className="space-y-6">
                        {selectedOrg === 'all' ? (
                            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                                        <Target className="h-12 w-12 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">אנא בחר ארגון ספציפי כדי לצפות בניתוח טעויות</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <MistakesPanel organizationId={selectedOrg} selectedYearId={selectedYear} />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            {selectedCouponYear && (
                <CouponsModal
                    yearId={selectedCouponYear.yearId}
                    year={selectedCouponYear.year}
                    organizationName={selectedCouponYear.orgName}
                    organizationId={selectedCouponYear.organizationId}
                    onClose={() => setSelectedCouponYear(null)}
                />
            )}
        </div>
    );
}

function CouponsManagementPanel({
    selectedOrgId,
    selectedYearId,
    analytics,
}: {
    selectedOrgId: string;
    selectedYearId: string;
    analytics: OrganizationAnalytics[];
}) {
    const org = analytics.find(o => o.organizationId === selectedOrgId);

    const [activeYearId, setActiveYearId] = useState<string | null>(null);
    const [coupons, setCoupons] = useState<CouponsSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine default active year based on main page selection or latest year
    useEffect(() => {
        if (!org || !org.years || org.years.length === 0) {
            setActiveYearId(null);
            return;
        }

        const yearsSorted = [...org.years].sort((a, b) => b.year - a.year);

        if (selectedYearId && selectedYearId !== 'all') {
            const match = yearsSorted.find(y => y.yearId === selectedYearId);
            setActiveYearId(match ? match.yearId : yearsSorted[0]?.yearId ?? null);
        } else {
            setActiveYearId(yearsSorted[0]?.yearId ?? null);
        }
    }, [org, selectedYearId]);

    // Fetch coupons when active year changes
    useEffect(() => {
        if (!org || !activeYearId) {
            return;
        }

        const fetchCoupons = async () => {
            setLoading(true);
            setError(null);
            setCoupons(null);

            try {
                const result = await getCouponSummary(org.organizationId, activeYearId);
                if (result.error) {
                    if (result.error === "No coupon found for this organization year") {
                        setError("לא נמצא קופון לשנה זו");
                    } else if (result.error === "Unauthorized" || result.error === "Forbidden") {
                        setError("אין הרשאה לצפות בנתונים");
                    } else {
                        setError("שגיאה בטעינת נתוני הקופונים");
                    }
                    setCoupons(null);
                } else {
                    setCoupons(result.couponSummary);
                }
            } catch (err) {
                console.error("Failed to fetch coupons:", err);
                setError("שגיאה בטעינת נתוני הקופונים");
                setCoupons(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [org, activeYearId]);

    // If no specific organization selected
    if (!selectedOrgId || selectedOrgId === "all") {
        return (
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="flex flex-col items-center justify-center py-20">
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                        <Ticket className="h-12 w-12 text-blue-500" />
                    </div>
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                        אנא בחר ארגון ספציפי כדי לנהל קופונים
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (!org) {
        return (
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                <CardContent className="flex flex-col items-center justify-center py-20">
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                        לא נמצאו נתונים עבור ארגון זה
                    </p>
                </CardContent>
            </Card>
        );
    }

    const years = (org.years || []).slice().sort((a, b) => b.year - a.year);
    const activeYear = years.find(y => y.yearId === activeYearId) ?? years[0];

    return (
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md shadow-blue-500/20">
                            <Ticket className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                ניהול קופונים - {org.organizationName}
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                צפייה והבנה של שימוש בקופונים לפי שנה
                            </CardDescription>
                        </div>
                    </div>
                    {years.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">בחר שנה:</span>
                            <Select
                                value={activeYearId ?? undefined}
                                onValueChange={setActiveYearId}
                            >
                                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                    <SelectValue placeholder="בחר שנה" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y.yearId} value={y.yearId}>
                                            {y.year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                            <p className="text-base text-slate-500">טוען נתוני קופונים...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                            <Ticket className="h-12 w-12 text-blue-500" />
                        </div>
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                            {error}
                        </p>
                    </div>
                ) : coupons ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                שנה נבחרת:{" "}
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {activeYear?.year}
                                </span>
                            </p>
                        </div>
                        <CouponsSection coupons={coupons} />
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        אין נתוני קופונים לשנה שנבחרה.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function CouponsSection({ coupons }: { coupons: CouponsSummary }) {
    // Filter users to only show redeemed ones
    const redeemedUsers = coupons.users.filter(user => user.redeemDate !== null);

    const chartData: ChartData<'doughnut'> = {
        labels: ['קופונים שמומשו', 'קופונים שלא מומשו'],
        datasets: [
            {
                data: [
                    coupons.redeemedCoupons,
                    coupons.notRedeemedCoupons,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.7)',    // green-500
                    'rgba(148, 163, 184, 0.7)', // slate-400
                ],
                borderColor: [
                    'rgb(34, 197, 94)',   // green-500
                    'rgb(148, 163, 184)', // slate-400
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                rtl: true,
                textDirection: 'rtl',
            },
        },
    };

    return (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800" dir="rtl">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">קופונים</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">סיכום מצב הקופונים לארגון</p>
                </div>

                {/* Coupon Details */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">פרטי הקופון</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">קוד הקופון:</span>
                            <span className="font-semibold text-slate-900 dark:text-white mr-1">{coupons.couponCode}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">תוקף הקופון:</span>
                            <span className="font-semibold text-slate-900 dark:text-white mr-1">{coupons.expiryDate}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">סוג הקופון:</span>
                            <span className="font-semibold text-slate-900 dark:text-white mr-1">{coupons.couponType}</span>
                        </div>
                    </div>
                </div>

                {/* Status Metrics with Chart */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">סטטוס קופונים</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">סך הכל שימושים אפשריים: {coupons.maxCoupons}</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-600 dark:text-slate-400">קופונים שמומשו</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{coupons.redeemedCoupons}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-600 dark:text-slate-400">קופונים שלא מומשו</span>
                                <span className="font-bold text-slate-600 dark:text-slate-400">{coupons.notRedeemedCoupons}</span>
                            </div>
                        </div>
                        <div className="w-24 h-24">
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {redeemedUsers.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">טבלת משתמשים שמומשו את הקופון</p>
                        <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                            <table className="w-full text-right text-xs" dir="rtl">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-right p-2 font-semibold text-slate-700 dark:text-slate-300">אימייל</th>
                                        <th className="text-right p-2 font-semibold text-slate-700 dark:text-slate-300">שם</th>
                                        <th className="text-right p-2 font-semibold text-slate-700 dark:text-slate-300">תאריך מימוש</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {redeemedUsers.map((user, idx) => (
                                        <tr
                                            key={idx}
                                            className={`border-b border-slate-100 dark:border-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'
                                                }`}
                                        >
                                            <td className="p-2 text-slate-600 dark:text-slate-400">{user.email}</td>
                                            <td className="p-2 font-medium text-slate-900 dark:text-white">{user.name}</td>
                                            <td className="p-2 text-slate-600 dark:text-slate-400">{user.redeemDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Explanations Block */}
                <div className="p-3 bg-slate-50/30 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">הסברים</p>
                    <ul className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400 list-disc list-inside">
                        <li><strong>תוקף הקופון:</strong> התאריך האחרון שבו ניתן להשתמש בקופון</li>
                        <li><strong>סוג הקופון:</strong> סוג ההנחה שהקופון מספק (אחוזית או קבועה)</li>
                        <li><strong>קופונים מקסימלי:</strong> המספר המקסימלי של קופונים שניתן לחלק</li>
                        <li><strong>קופונים שמומשו:</strong> מספר הקופונים שנוצלו בפועל</li>
                        <li><strong>קופונים שלא מומשו:</strong> קופונים שנשמרו אך עדיין לא נוצלו</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}


function CouponsModal({
    yearId,
    year,
    organizationName,
    organizationId,
    onClose,
}: {
    yearId: string;
    year: number;
    organizationName: string;
    organizationId: string;
    onClose: () => void;
}) {
    const [coupons, setCoupons] = useState<CouponsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getCouponSummary(organizationId, yearId);
                if (result.error) {
                    if (result.error === "No coupon found for this organization year") {
                        setError("לא נמצא קופון לשנה זו");
                    } else if (result.error === "Unauthorized" || result.error === "Forbidden") {
                        setError("אין הרשאה לצפות בנתונים");
                    } else {
                        setError("שגיאה בטעינת נתוני הקופונים");
                    }
                    setCoupons(null);
                } else {
                    setCoupons(result.couponSummary);
                }
            } catch (err) {
                console.error('Failed to fetch coupons:', err);
                setError("שגיאה בטעינת נתוני הקופונים");
                setCoupons(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [yearId, organizationId]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5 bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
                            <Ticket className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">{organizationName}</div>
                            <div className="text-sm text-slate-500">שנה {year} - קופונים</div>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        onClick={onClose}
                    >
                        סגור
                    </button>
                </div>
                <div className="px-6 py-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                                <p className="text-base text-slate-500">טוען נתוני קופונים...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                                <Ticket className="h-12 w-12 text-blue-500" />
                            </div>
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{error}</p>
                        </div>
                    ) : coupons ? (
                        <CouponsSection coupons={coupons} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MistakesPanel({ organizationId, selectedYearId }: { organizationId: string; selectedYearId: string }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ categoryId: string | null; categoryType: string | null; topicType: string; wrongCount: number }[]>([]);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedYearId && selectedYearId !== 'all') params.append('organizationYearId', selectedYearId);
                const res = await fetch(`/api/organization-analytics/${organizationId}/mistakes?${params.toString()}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data || []);
                } else {
                    setData([]);
                }
            } catch {
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [organizationId, selectedYearId]);

    if (loading) return (
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
            <CardContent className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-base text-slate-500">טוען נתוני טעויות...</p>
                </div>
            </CardContent>
        </Card>
    );

    if (!data.length) return (
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                    <Target className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400">אין נתוני טעויות</p>
            </CardContent>
        </Card>
    );

    // Group by categoryId then topicType
    const byCategory = data.reduce((acc: Record<string, { topicType: string; wrongCount: number }[]>, row) => {
        const key = row.categoryId ?? 'uncategorized';
        if (!acc[key]) acc[key] = [];
        acc[key].push({ topicType: row.topicType, wrongCount: row.wrongCount });
        return acc;
    }, {});

    return (
        <div className="space-y-5">
            {Object.entries(byCategory)
                .filter(([categoryId]) => categoryId !== 'uncategorized')
                .map(([categoryId, items]) => {
                    const title = (
                        data.find(d => (d.categoryId ?? 'uncategorized') === categoryId)?.categoryType
                    ) || (categoryId === 'uncategorized' ? 'ללא קטגוריה' : categoryId);
                    const topItems = [...items].sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 12);
                    const labels: string[] = Array.from(topItems.map(i => i.topicType));
                    const values: number[] = Array.from(topItems.map(i => i.wrongCount));
                    // Blue/Cyan gradient palette
                    const backgroundPalette = [
                        'rgba(59, 130, 246, 0.7)',   // blue-500
                        'rgba(6, 182, 212, 0.7)',    // cyan-500
                        'rgba(99, 102, 241, 0.7)',   // indigo-500
                        'rgba(14, 165, 233, 0.7)',   // sky-500
                        'rgba(37, 99, 235, 0.7)',    // blue-600
                        'rgba(8, 145, 178, 0.7)',    // cyan-600
                        'rgba(79, 70, 229, 0.7)',    // indigo-600
                        'rgba(2, 132, 199, 0.7)',    // sky-600
                        'rgba(96, 165, 250, 0.7)',   // blue-400
                        'rgba(34, 211, 238, 0.7)',   // cyan-400
                        'rgba(129, 140, 248, 0.7)', // indigo-400
                        'rgba(56, 189, 248, 0.7)',   // sky-400
                    ];
                    const borderPalette = [
                        'rgb(59, 130, 246)',
                        'rgb(6, 182, 212)',
                        'rgb(99, 102, 241)',
                        'rgb(14, 165, 233)',
                        'rgb(37, 99, 235)',
                        'rgb(8, 145, 178)',
                        'rgb(79, 70, 229)',
                        'rgb(2, 132, 199)',
                        'rgb(96, 165, 250)',
                        'rgb(34, 211, 238)',
                        'rgb(129, 140, 248)',
                        'rgb(56, 189, 248)',
                    ];
                    const backgroundColor = values.map((_, i) => backgroundPalette[i % backgroundPalette.length]);
                    const borderColor = values.map((_, i) => borderPalette[i % borderPalette.length]);
                    const datasets: ChartDataset<'bar'>[] = [
                        {
                            label: 'תשובות שגויות',
                            data: values,
                            backgroundColor,
                            borderColor,
                            borderWidth: 1,
                            borderRadius: 6,
                        },
                    ];
                    const chartData: ChartData<'bar'> = { labels, datasets };
                    const chartOptions: ChartOptions<'bar'> = {
                        indexAxis: 'x',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: { display: false },
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: { precision: 0 },
                                grid: { display: false },
                            },
                            y: {
                                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                            },
                        },
                    };

                    return (
                        <Card key={categoryId} className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm shadow-blue-500/20">
                                        <Target className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">טעויות - {title}</CardTitle>
                                        <CardDescription className="text-slate-500 text-sm">נושאי טעויות נפוצים בקטגוריה זו</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="h-56">
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
        </div>
    );
}

function UserMistakesModal({
    user,
    onClose,
    organizationId,
    selectedYearId,
}: {
    user: { id: string; firstName: string; lastName: string; username: string };
    onClose: () => void;
    organizationId: string;
    selectedYearId: string;
}) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ categoryId: string | null; categoryType: string | null; topicType: string; wrongCount: number }[]>([]);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedYearId && selectedYearId !== 'all') params.append('organizationYearId', selectedYearId);
                const res = await fetch(`/api/organization-analytics/${organizationId}/users/${user.id}/mistakes?${params.toString()}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data || []);
                } else {
                    setData([]);
                }
            } catch {
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [organizationId, user.id, selectedYearId]);

    const grouped = data.reduce((acc: Record<string, { topicType: string; wrongCount: number }[]>, row) => {
        const key = row.categoryId ?? 'uncategorized';
        if (!acc[key]) acc[key] = [];
        acc[key].push({ topicType: row.topicType, wrongCount: row.wrongCount });
        return acc;
    }, {});

    const entries = Object.entries(grouped);

    // Blue/Cyan palette for charts
    const backgroundPalette = [
        'rgba(59, 130, 246, 0.7)',
        'rgba(6, 182, 212, 0.7)',
        'rgba(99, 102, 241, 0.7)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(37, 99, 235, 0.7)',
        'rgba(8, 145, 178, 0.7)',
        'rgba(79, 70, 229, 0.7)',
    ];
    const borderPalette = [
        'rgb(59, 130, 246)',
        'rgb(6, 182, 212)',
        'rgb(99, 102, 241)',
        'rgb(14, 165, 233)',
        'rgb(37, 99, 235)',
        'rgb(8, 145, 178)',
        'rgb(79, 70, 229)',
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5 bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
                            {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                        </div>
                        <div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-slate-500">@{user.username}</div>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        onClick={onClose}
                    >
                        סגור
                    </button>
                </div>
                <div className="px-6 py-5">
                    <Tabs defaultValue="overview" key={user.id} dir="rtl">
                        <TabsList className="mb-5 bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700 flex-row justify-end">
                            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">סקירה כללית</TabsTrigger>
                            <TabsTrigger value="details" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">פרטים</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="text-center space-y-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                                        <p className="text-base text-slate-500">טוען...</p>
                                    </div>
                                </div>
                            ) : entries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                                        <Target className="h-12 w-12 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">אין טעויות</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {(() => {
                                        const aggregate = data.reduce((acc: Record<string, number>, row) => {
                                            acc[row.topicType] = (acc[row.topicType] || 0) + row.wrongCount;
                                            return acc;
                                        }, {});
                                        const combined = Object.entries(aggregate)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 12);
                                        const labels: string[] = combined.map(([topic]) => topic);
                                        const values: number[] = combined.map(([, count]) => count);
                                        const backgroundColor = values.map((_, i) => backgroundPalette[i % backgroundPalette.length]);
                                        const borderColor = values.map((_, i) => borderPalette[i % borderPalette.length]);
                                        const datasets: ChartDataset<'bar'>[] = [{
                                            label: 'תשובות שגויות',
                                            data: values,
                                            backgroundColor,
                                            borderColor,
                                            borderWidth: 1,
                                            borderRadius: 6,
                                        }];
                                        const chartData: ChartData<'bar'> = { labels, datasets };
                                        const chartOptions: ChartOptions<'bar'> = {
                                            indexAxis: 'x',
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false }, title: { display: false } },
                                            scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { display: false } }, y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } } },
                                        };
                                        return (
                                            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                                                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Target className="h-4 w-4 text-blue-500" />
                                                        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">נושאי טעויות נפוצים</CardTitle>
                                                    </div>
                                                    <CardDescription className="text-slate-500 text-sm">סה״כ תשובות שגויות: {data.reduce((s, r) => s + r.wrongCount, 0)}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-5">
                                                    <div className="h-48">
                                                        <Bar data={chartData} options={chartOptions} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })()}
                                    {entries
                                        .filter(([categoryId]) => categoryId !== 'uncategorized')
                                        .map(([categoryId, items]) => {
                                            const title = (
                                                data.find(d => (d.categoryId ?? 'uncategorized') === categoryId)?.categoryType
                                            ) || (categoryId === 'uncategorized' ? 'ללא קטגוריה' : categoryId);
                                            const topItems = [...items].sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 10);
                                            const labels: string[] = Array.from(topItems.map(i => i.topicType));
                                            const values: number[] = Array.from(topItems.map(i => i.wrongCount));
                                            const backgroundColor = values.map((_, i) => backgroundPalette[i % backgroundPalette.length]);
                                            const borderColor = values.map((_, i) => borderPalette[i % borderPalette.length]);
                                            const datasets: ChartDataset<'bar'>[] = [{
                                                label: 'תשובות שגויות',
                                                data: values,
                                                backgroundColor,
                                                borderColor,
                                                borderWidth: 1,
                                                borderRadius: 6,
                                            }];
                                            const chartData: ChartData<'bar'> = { labels, datasets };
                                            const chartOptions: ChartOptions<'bar'> = {
                                                indexAxis: 'x',
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false }, title: { display: false } },
                                                scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { display: false } }, y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } } },
                                            };
                                            return (
                                                <Card key={categoryId} className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                                                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                                                        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">טעויות - {title}</CardTitle>
                                                        <CardDescription className="text-slate-500 text-sm">נושאים נפוצים בקטגוריה זו</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="p-5">
                                                        <div className="h-40">
                                                            <Bar data={chartData} options={chartOptions} />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="details">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="text-center space-y-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                                        <p className="text-base text-slate-500">טוען...</p>
                                    </div>
                                </div>
                            ) : data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                                        <Target className="h-12 w-12 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">אין טעויות</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-right" dir="rtl">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">קטגוריה</th>
                                                <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">נושא</th>
                                                <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">שגויות</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data
                                                .sort((a, b) => b.wrongCount - a.wrongCount)
                                                .map((row, idx) => (
                                                    <tr key={idx} className={`border-b border-slate-100 dark:border-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}>
                                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 text-right">{row.categoryType || row.categoryId || 'ללא קטגוריה'}</td>
                                                        <td className="p-4 text-sm text-slate-900 dark:text-slate-200 font-medium text-right">{row.topicType}</td>
                                                        <td className="p-4 text-right">
                                                            <span className="font-bold text-blue-600 dark:text-blue-400">{row.wrongCount}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

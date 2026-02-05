"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Award, BookOpen, Target, Activity, BarChart3, Home, ChevronLeft } from 'lucide-react';
import { useUser, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Link from "next/link";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    type ChartData,
    type ChartOptions,
    type ChartDataset,
} from 'chart.js';

// Register Chart.js components once at module scope
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, ChartTooltip, ChartLegend);

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

export default function OrganizationAnalyticsPage() {
    const [managedOrganizations, setManagedOrganizations] = useState<ManagedOrganization[]>([]);
    const [analytics, setAnalytics] = useState<OrganizationAnalytics[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [organizationUsers, setOrganizationUsers] = useState<UserPerformance[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserPerformance | null>(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const { user } = useUser();

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
        analytics.flatMap(org => org.years.map(y => y.year))
    )).sort((a, b) => b - a);

    // Build year select options based on current org selection
    const availableYearOptions = (
        selectedOrg === 'all'
            ? analytics.flatMap(org => org.years.map(y => ({ id: y.yearId, year: y.year })))
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
        : selectedOrgData?.years.map(y => y.year) || [];

    // Helper to filter years per org based on selectedYear (by yearId)
    const getOrgYears = (org: OrganizationAnalytics) => (
        selectedYear === 'all' ? org.years : org.years.filter(y => y.yearId === selectedYear)
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
            <div className="container mx-auto p-8 space-y-8">
                {/* Top Bar with User Info */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                    >
                        <Home className="h-4 w-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">חזרה לדף הבית</span>
                        <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </Link>

                    <ClerkLoading>
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                            <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                            <span className="text-sm text-slate-500">טוען...</span>
                        </div>
                    </ClerkLoading>
                    <ClerkLoaded>
                        {user && (
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                                    {(user.firstName && user.firstName[0]) || (user.emailAddresses && user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase()) || '?'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {user.firstName || ''} {user.lastName || ''}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {user.emailAddresses && user.emailAddresses[0]?.emailAddress}
                                    </span>
                                </div>
                            </div>
                        )}
                    </ClerkLoaded>
                </div>

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

                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 w-full justify-start h-auto rounded-xl shadow-sm gap-1">
                        <TabsTrigger value="overview" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">סקירה כללית</TabsTrigger>
                        <TabsTrigger value="performance" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">ביצועים</TabsTrigger>
                        <TabsTrigger value="trends" className="rounded-lg px-4 py-2.5 text-slate-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">מגמות</TabsTrigger>
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
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-2">שנים פעילות</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {getOrgYears(org).map(year => (
                                                    <span key={year.yearId} className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-md text-xs font-medium">
                                                        {year.year}
                                                    </span>
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
                        {selectedOrg !== 'all' && selectedOrgData ? (
                            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md shadow-blue-500/20">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">מגמות ביצועים - {selectedOrgData.organizationName}</CardTitle>
                                            <CardDescription className="text-slate-500">מעקב אחר התקדמות וצמיחה לאורך זמן</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {['averageScore', 'totalLessons', 'activeUsers'].map(metric => (
                                            <div key={metric} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                                <h3 className="font-semibold text-sm mb-5 text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wide">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span>
                                                    {metric === 'averageScore' ? 'ממוצע ציון %' :
                                                        metric === 'totalLessons' ? 'סה״כ שיעורים' :
                                                            'משתמשים פעילים'}
                                                </h3>
                                                <div className="flex items-end gap-3 h-44">
                                                    {getOrgYears(selectedOrgData)
                                                        .sort((a, b) => a.year - b.year)
                                                        .map(year => {
                                                            const value = (year as any)[metric];
                                                            const maxValue = Math.max(...selectedOrgData.years.map((y: any) => y[metric]));
                                                            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

                                                            return (
                                                                <div key={year.yearId} className="flex-1 flex flex-col items-center group">
                                                                    <div
                                                                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg flex items-end justify-center transition-all hover:from-blue-600 hover:to-cyan-500 relative shadow-sm shadow-blue-500/20"
                                                                        style={{ height: `${Math.max(height, 8)}%` }}
                                                                    >
                                                                        <span className="absolute -top-7 text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm">{value}</span>
                                                                    </div>
                                                                    <span className="text-xs font-medium text-slate-500 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 w-full text-center">{year.year}</span>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl mb-5">
                                        <TrendingUp className="h-12 w-12 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">אנא בחר ארגון ספציפי כדי לצפות במגמות</p>
                                </CardContent>
                            </Card>
                        )}
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
                                    <Tabs defaultValue={`year-${org.years[0]?.yearId}`}>
                                        <TabsList className="mb-6 bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700">
                                            {org.years.map(year => (
                                                <TabsTrigger key={year.yearId} value={`year-${year.yearId}`} className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                                                    {year.year}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        {org.years.map(year => (
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
                                            <table className="w-full">
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
                                                                        {user.firstName[0]}{user.lastName[0]}
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
                                                            <td className="p-4 text-sm text-slate-500">{user.email}</td>
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
            {Object.entries(byCategory).map(([categoryId, items]) => {
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
                            {user.firstName[0]}{user.lastName[0]}
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
                    <Tabs defaultValue="overview" key={user.id}>
                        <TabsList className="mb-5 bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700">
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
                                    {entries.map(([categoryId, items]) => {
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
                                    <table className="w-full">
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
                                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{row.categoryType || row.categoryId || 'ללא קטגוריה'}</td>
                                                        <td className="p-4 text-sm text-slate-900 dark:text-slate-200 font-medium">{row.topicType}</td>
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

"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Award, BookOpen, Target, Activity } from 'lucide-react';
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
            <div className="container mx-auto p-6">
                <div className="text-center">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Organization Analytics</h1>
                    <p className="text-muted-foreground">Comprehensive performance insights for managed organizations</p>
                </div>
                <div className="flex gap-4">
                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select Organization" />
                        </SelectTrigger>
                        <SelectContent>
                            {managedOrganizations.length > 1 && (
                                <SelectItem value="all">All Organizations</SelectItem>
                            )}
                            {managedOrganizations.map(org => (
                                <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Optional Year Filter */}
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYearOptions.map(opt => (
                                <SelectItem key={opt.id} value={opt.id}>{opt.year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                    <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {filteredAnalytics.reduce((sum, org) => sum + org.totalUsers, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across {filteredAnalytics.length} {filteredAnalytics.length === 1 ? 'organization' : 'organizations'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {filteredAnalytics.length > 0
                                        ? Math.round(
                                            filteredAnalytics.reduce((sum, org) => sum + org.averageExperience, 0) /
                                            filteredAnalytics.length
                                        )
                                        : 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Average across all users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Genius Score</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {filteredAnalytics.length > 0
                                        ? Math.round(
                                            filteredAnalytics.reduce((sum, org) => sum + org.averageGeniusScore, 0) /
                                            filteredAnalytics.length
                                        )
                                        : 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Intelligence score average
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {filteredAnalytics.reduce((sum, org) =>
                                        sum + getOrgYears(org).reduce((yearSum, year) => yearSum + year.activeUsers, 0), 0
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Users who completed lessons
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Organization Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAnalytics.map(org => (
                            <Card key={org.organizationId} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle>{org.organizationName}</CardTitle>
                                    <CardDescription>{org.city || 'Location not specified'}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Users:</span>
                                        <span className="font-medium">{org.totalUsers}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Avg Experience:</span>
                                        <span className="font-medium">{org.averageExperience}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Avg Genius Score:</span>
                                        <span className="font-medium">{org.averageGeniusScore}</span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground mb-2">Years:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {getOrgYears(org).map(year => (
                                                <span key={year.yearId} className="px-2 py-1 bg-secondary rounded text-xs">
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

                <TabsContent value="performance" className="space-y-4">
                    {filteredAnalytics.map(org => (
                        <Card key={org.organizationId}>
                            <CardHeader>
                                <CardTitle>{org.organizationName} - Performance Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {getOrgYears(org).map(year => (
                                        <div key={year.yearId} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold">Year {year.year}</h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {year.totalUsers} users
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Average Score</p>
                                                    <p className="text-2xl font-bold">{year.averageScore.toFixed(1)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Lessons</p>
                                                    <p className="text-2xl font-bold">{year.totalLessons}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                                                    <p className="text-2xl font-bold">{year.totalQuestions}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Active Users</p>
                                                    <p className="text-2xl font-bold">{year.activeUsers}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    {selectedOrg !== 'all' && selectedOrgData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Trends - {selectedOrgData.organizationName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {['averageScore', 'totalLessons', 'activeUsers'].map(metric => (
                                        <div key={metric}>
                                            <h3 className="font-semibold mb-2 capitalize">
                                                {metric === 'averageScore' ? 'Average Score %' :
                                                    metric === 'totalLessons' ? 'Total Lessons' :
                                                        'Active Users'}
                                            </h3>
                                            <div className="flex items-end gap-2 h-40">
                                                {getOrgYears(selectedOrgData)
                                                    .sort((a, b) => a.year - b.year)
                                                    .map(year => {
                                                        const value = (year as any)[metric];
                                                        const maxValue = Math.max(...selectedOrgData.years.map((y: any) => y[metric]));
                                                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

                                                        return (
                                                            <div key={year.yearId} className="flex-1 flex flex-col items-center">
                                                                <div className="w-full bg-muted rounded-t flex items-end justify-center" style={{ height: `${height}%` }}>
                                                                    <span className="text-xs font-semibold mb-1">{value}</span>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground mt-2">{year.year}</span>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {selectedOrg === 'all' && (
                        <div className="text-center text-muted-foreground">
                            Please select a specific organization to view trends
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                    {filteredAnalytics.map(org => (
                        <Card key={org.organizationId}>
                            <CardHeader>
                                <CardTitle>{org.organizationName}</CardTitle>
                                <CardDescription>
                                    {org.contactEmail} • {org.city}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue={`year-${org.years[0]?.yearId}`}>
                                    <TabsList className="mb-4">
                                        {org.years.map(year => (
                                            <TabsTrigger key={year.yearId} value={`year-${year.yearId}`}>
                                                {year.year}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {org.years.map(year => (
                                        <TabsContent key={year.yearId} value={`year-${year.yearId}`}>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-sm">Engagement Metrics</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Total Users:</span>
                                                            <span className="font-medium">{year.totalUsers}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Active Users:</span>
                                                            <span className="font-medium">{year.activeUsers}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Engagement Rate:</span>
                                                            <span className="font-medium">
                                                                {year.totalUsers > 0
                                                                    ? ((year.activeUsers / year.totalUsers) * 100).toFixed(1)
                                                                    : 0}%
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-sm">Performance Metrics</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Average Score:</span>
                                                            <span className="font-medium">{year.averageScore.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Total Lessons:</span>
                                                            <span className="font-medium">{year.totalLessons}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Questions Answered:</span>
                                                            <span className="font-medium">{year.totalQuestions}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Correct Answers:</span>
                                                            <span className="font-medium">{year.correctAnswers}</span>
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

                <TabsContent value="users" className="space-y-4">
                    {selectedOrg === 'all' ? (
                        <div className="text-center text-muted-foreground py-12">
                            Please select a specific organization to view users
                        </div>
                    ) : loadingUsers ? (
                        <div className="text-center py-12">Loading users...</div>
                    ) : organizationUsers.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            No users found in this organization
                        </div>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {selectedOrgData?.organizationName} - Users ({organizationUsers.length})
                                    </CardTitle>
                                    <CardDescription>
                                        Individual user performance metrics for the current month
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">User</th>
                                                    <th className="text-left p-2">Email</th>
                                                    <th className="text-right p-2">Experience</th>
                                                    <th className="text-right p-2">Genius Score</th>
                                                    <th className="text-right p-2">Lessons</th>
                                                    <th className="text-right p-2">Questions</th>
                                                    <th className="text-right p-2">Avg Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {organizationUsers.map((user) => (
                                                    <tr key={user.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                                                        <td className="p-2">
                                                            <div className="font-medium">
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                @{user.username}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-sm">{user.email}</td>
                                                        <td className="p-2 text-right">{user.experience}</td>
                                                        <td className="p-2 text-right">{user.geniusScore}</td>
                                                        <td className="p-2 text-right">{user.totalLessons}</td>
                                                        <td className="p-2 text-right">{user.totalQuestions}</td>
                                                        <td className="p-2 text-right font-medium">
                                                            {user.averageScore.toFixed(1)}%
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

                <TabsContent value="mistakes" className="space-y-4">
                    {selectedOrg === 'all' ? (
                        <div className="text-center text-muted-foreground py-12">
                            Please select a specific organization to view mistakes analysis
                        </div>
                    ) : (
                        <MistakesPanel organizationId={selectedOrg} selectedYearId={selectedYear} />
                    )}
                </TabsContent>
            </Tabs>
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

    if (loading) return <div className="text-center py-12">Loading mistakes...</div>;
    if (!data.length) return <div className="text-center text-muted-foreground py-12">No mistakes data</div>;

    // Group by categoryId then topicType
    const byCategory = data.reduce((acc: Record<string, { topicType: string; wrongCount: number }[]>, row) => {
        const key = row.categoryId ?? 'uncategorized';
        if (!acc[key]) acc[key] = [];
        acc[key].push({ topicType: row.topicType, wrongCount: row.wrongCount });
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(byCategory).map(([categoryId, items]) => {
                const title = (
                    data.find(d => (d.categoryId ?? 'uncategorized') === categoryId)?.categoryType
                ) || (categoryId === 'uncategorized' ? 'Uncategorized' : categoryId);
                const topItems = [...items].sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 12);
                const labels: string[] = Array.from(topItems.map(i => i.topicType));
                const values: number[] = Array.from(topItems.map(i => i.wrongCount));
                const backgroundPalette = [
                    'rgba(239, 68, 68, 0.6)',   // red-500
                    'rgba(245, 158, 11, 0.6)',  // amber-500
                    'rgba(34, 197, 94, 0.6)',   // green-500
                    'rgba(59, 130, 246, 0.6)',  // blue-500
                    'rgba(139, 92, 246, 0.6)',  // violet-500
                    'rgba(236, 72, 153, 0.6)',  // pink-500
                    'rgba(20, 184, 166, 0.6)',  // teal-500
                    'rgba(168, 85, 247, 0.6)',  // purple-500
                    'rgba(34, 211, 238, 0.6)',  // cyan-500
                    'rgba(249, 115, 22, 0.6)',  // orange-500
                    'rgba(132, 204, 22, 0.6)',  // lime-500
                    'rgba(234, 179, 8, 0.6)',   // yellow-500
                ];
                const borderPalette = [
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(20, 184, 166)',
                    'rgb(168, 85, 247)',
                    'rgb(34, 211, 238)',
                    'rgb(249, 115, 22)',
                    'rgb(132, 204, 22)',
                    'rgb(234, 179, 8)',
                ];
                const backgroundColor = values.map((_, i) => backgroundPalette[i % backgroundPalette.length]);
                const borderColor = values.map((_, i) => borderPalette[i % borderPalette.length]);
                const datasets: ChartDataset<'bar'>[] = [
                    {
                        label: 'Wrong answers',
                        data: values,
                        backgroundColor,
                        borderColor,
                        borderWidth: 1,
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
                            grid: { display: false },
                        },
                    },
                };

                return (
                    <Card key={categoryId}>
                        <CardHeader>
                            <CardTitle>Mistakes - {title}</CardTitle>
                            <CardDescription>Top mistake topics in this category</CardDescription>
                        </CardHeader>
                        <CardContent>
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

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-4xl bg-background rounded-lg shadow-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <div className="text-lg font-semibold">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                    </div>
                    <button className="text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>Close</button>
                </div>
                <div className="px-6 py-4">
                    <Tabs defaultValue="overview" key={user.id}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            {loading ? (
                                <div className="text-center py-12">Loading...</div>
                            ) : entries.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12">No mistakes</div>
                            ) : (
                                <div className="space-y-6">
                                    {(() => {
                                        // Combined top mistaken topics across all categories
                                        const aggregate = data.reduce((acc: Record<string, number>, row) => {
                                            acc[row.topicType] = (acc[row.topicType] || 0) + row.wrongCount;
                                            return acc;
                                        }, {});
                                        const combined = Object.entries(aggregate)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 12);
                                        const labels: string[] = combined.map(([topic]) => topic);
                                        const values: number[] = combined.map(([, count]) => count);
                                        const backgroundPalette = [
                                            'rgba(59, 130, 246, 0.6)',
                                            'rgba(34, 197, 94, 0.6)',
                                            'rgba(245, 158, 11, 0.6)',
                                            'rgba(139, 92, 246, 0.6)',
                                            'rgba(236, 72, 153, 0.6)',
                                            'rgba(20, 184, 166, 0.6)',
                                            'rgba(239, 68, 68, 0.6)',
                                        ];
                                        const borderPalette = [
                                            'rgb(59, 130, 246)',
                                            'rgb(34, 197, 94)',
                                            'rgb(245, 158, 11)',
                                            'rgb(139, 92, 246)',
                                            'rgb(236, 72, 153)',
                                            'rgb(20, 184, 166)',
                                            'rgb(239, 68, 68)',
                                        ];
                                        const backgroundColor = values.map((_, i) => backgroundPalette[i % backgroundPalette.length]);
                                        const borderColor = values.map((_, i) => borderPalette[i % borderPalette.length]);
                                        const datasets: ChartDataset<'bar'>[] = [{
                                            label: 'Wrong answers',
                                            data: values,
                                            backgroundColor,
                                            borderColor,
                                            borderWidth: 1,
                                        }];
                                        const chartData: ChartData<'bar'> = { labels, datasets };
                                        const chartOptions: ChartOptions<'bar'> = {
                                            indexAxis: 'x',
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false }, title: { display: false } },
                                            scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { display: false } }, y: { grid: { display: false } } },
                                        };
                                        return (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Top Mistaken Topics</CardTitle>
                                                    <CardDescription>Total wrong answers: {data.reduce((s, r) => s + r.wrongCount, 0)}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
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
                                        ) || (categoryId === 'uncategorized' ? 'Uncategorized' : categoryId);
                                        const topItems = [...items].sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 10);
                                        const labels: string[] = Array.from(topItems.map(i => i.topicType));
                                        const values: number[] = Array.from(topItems.map(i => i.wrongCount));
                                        const backgroundPalette = [
                                            'rgba(59, 130, 246, 0.6)',
                                            'rgba(34, 197, 94, 0.6)',
                                            'rgba(245, 158, 11, 0.6)',
                                            'rgba(139, 92, 246, 0.6)',
                                            'rgba(236, 72, 153, 0.6)',
                                            'rgba(20, 184, 166, 0.6)',
                                        ];
                                        const borderPalette = [
                                            'rgb(59, 130, 246)',
                                            'rgb(34, 197, 94)',
                                            'rgb(245, 158, 11)',
                                            'rgb(139, 92, 246)',
                                            'rgb(236, 72, 153)',
                                            'rgb(20, 184, 166)',
                                        ];
                                        const backgroundColor = values.map((_, i) => backgroundPalette[i % backgroundPalette.length]);
                                        const borderColor = values.map((_, i) => borderPalette[i % borderPalette.length]);
                                        const datasets: ChartDataset<'bar'>[] = [{
                                            label: 'Wrong answers',
                                            data: values,
                                            backgroundColor,
                                            borderColor,
                                            borderWidth: 1,
                                        }];
                                        const chartData: ChartData<'bar'> = { labels, datasets };
                                        const chartOptions: ChartOptions<'bar'> = {
                                            indexAxis: 'x',
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false }, title: { display: false } },
                                            scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { display: false } }, y: { grid: { display: false } } },
                                        };
                                        return (
                                            <Card key={categoryId}>
                                                <CardHeader>
                                                    <CardTitle>Mistakes - {title}</CardTitle>
                                                    <CardDescription>Top topics for this category</CardDescription>
                                                </CardHeader>
                                                <CardContent>
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
                                <div className="text-center py-12">Loading...</div>
                            ) : data.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12">No mistakes</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2">Category</th>
                                                <th className="text-left p-2">Topic</th>
                                                <th className="text-right p-2">Wrong</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data
                                                .sort((a, b) => b.wrongCount - a.wrongCount)
                                                .map((row, idx) => (
                                                    <tr key={idx} className="border-b">
                                                        <td className="p-2 text-sm">{row.categoryType || row.categoryId || 'Uncategorized'}</td>
                                                        <td className="p-2 text-sm">{row.topicType}</td>
                                                        <td className="p-2 text-right font-medium">{row.wrongCount}</td>
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

"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Award, BookOpen, Target, Activity } from 'lucide-react';

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

    const selectedOrgData = analytics.find(org => org.organizationId === selectedOrg);
    const filteredYears = selectedOrg === 'all'
        ? allYears
        : selectedOrgData?.years.map(y => y.year) || [];

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
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed View</TabsTrigger>
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
                                        sum + (org.years.reduce((yearSum, year) => yearSum + year.activeUsers, 0)), 0
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
                                            {org.years.map(year => (
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
                                    {org.years.map(year => (
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
                                                {selectedOrgData.years
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
                                                <tr key={user.id} className="border-b hover:bg-muted/50">
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
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

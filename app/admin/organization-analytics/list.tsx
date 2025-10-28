import { List, Datagrid, TextField, NumberField, FunctionField } from 'react-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, BookOpen, Target, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { RaRecord } from 'react-admin';

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

const AnalyticsCard = ({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const OrganizationDetails = ({ record }: { record: RaRecord }) => {
    const [detailedData, setDetailedData] = useState<{ users: UserPerformance[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYearId, setSelectedYearId] = useState<string>('all');

    useEffect(() => {
        if (record?.organizationId) {
            fetch(`/api/organization-analytics/${record.organizationId}/users`)
                .then(res => res.json())
                .then(data => {
                    setDetailedData(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [record?.organizationId]);

    if (!record) return null;

    const years = (record.years as any[]) || [];
    const yearsToShow = selectedYearId === 'all' ? years : years.filter((y) => y.yearId === selectedYearId);

    return (
        <div className="space-y-4 p-6">
            <h3 className="text-xl font-bold mb-4">Organization Analytics</h3>

            <div className="grid gap-4 md:grid-cols-3">
                <AnalyticsCard label="Total Users" value={record.totalUsers} icon={Users} />
                <AnalyticsCard label="Avg Experience" value={record.averageExperience} icon={Target} />
                <AnalyticsCard label="Avg Genius Score" value={record.averageGeniusScore} icon={Target} />
            </div>

            {years && years.length > 0 && (
                <div className="mt-4 flex items-center gap-4">
                    <div className="w-64">
                        <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All years" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All years</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year.yearId} value={year.yearId}>
                                        Year {year.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {yearsToShow && yearsToShow.length > 0 && (
                <Tabs defaultValue={`year-${yearsToShow[0]?.yearId}`} className="mt-6">
                    <TabsList>
                        {yearsToShow.map((year: any) => (
                            <TabsTrigger key={year.yearId} value={`year-${year.yearId}`}>
                                Year {year.year}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {yearsToShow.map((year: any) => (
                        <TabsContent key={year.yearId} value={`year-${year.yearId}`} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <AnalyticsCard label="Lessons" value={year.totalLessons} icon={BookOpen} />
                                <AnalyticsCard label="Questions" value={year.totalQuestions} icon={Activity} />
                                <AnalyticsCard label="Avg Score" value={`${year.averageScore.toFixed(1)}%`} icon={Target} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <AnalyticsCard label="Total Users" value={year.totalUsers} icon={Users} />
                                <AnalyticsCard label="Active Users" value={year.activeUsers} icon={Activity} />
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            {loading ? (
                <div className="text-center py-12">Loading user details...</div>
            ) : detailedData?.users && detailedData.users.length > 0 ? (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Individual User Performance ({detailedData.users.length})</CardTitle>
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
                                    {detailedData.users.map((user) => (
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
            ) : null}
        </div>
    );
};

export const OrganizationAnalyticsList = () => (
    <List
        resource="organizationAnalytics"
        queryOptions={{ staleTime: 300000 }}
    >
        <Datagrid rowClick="expand" expand={OrganizationDetails}>
            <TextField source="organizationName" label="Organization" />
            <TextField source="city" label="City" />
            <NumberField source="totalUsers" label="Total Users" />
            <NumberField
                source="averageExperience"
                label="Avg Experience"
                options={{ maximumFractionDigits: 0 }}
            />
            <NumberField
                source="averageGeniusScore"
                label="Avg Genius Score"
                options={{ maximumFractionDigits: 0 }}
            />
            <FunctionField
                label="Active Users"
                render={(record: RaRecord) => {
                    if (!record.years || record.years.length === 0) return 0;
                    return record.years.reduce((sum: number, year: any) => sum + (year.activeUsers || 0), 0);
                }}
            />
        </Datagrid>
    </List>
);


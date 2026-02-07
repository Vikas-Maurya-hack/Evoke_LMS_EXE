import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Users, DollarSign, BookOpen, ArrowUp, ArrowDown, RefreshCw, CreditCard, Wallet, Banknote, Building2 } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MonthlyData {
    month: string;
    revenue: number;
    students: number;
}

interface CourseData {
    course: string;
    enrollments: number;
}

interface AnalyticsStats {
    totalRevenue: number;
    activeStudents: number;
    totalStudents: number;
    coursesCount: number;
    pendingFees: number;
    completionRate: number;
}

interface PaymentModeData {
    mode: string;
    count: number;
    amount: number;
    percentage: number;
}

const PAYMENT_MODE_COLORS = ['#8b5cf6', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4'];

const Analytics = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<AnalyticsStats>({
        totalRevenue: 0,
        activeStudents: 0,
        totalStudents: 0,
        coursesCount: 0,
        pendingFees: 0,
        completionRate: 0
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [courseData, setCourseData] = useState<CourseData[]>([]);
    const [paymentModeData, setPaymentModeData] = useState<PaymentModeData[]>([]);

    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 500);
            }
        }
    }, [location]);

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch students
            const studentsRes = await fetch('http://localhost:5000/api/students');
            const students = studentsRes.ok ? await studentsRes.json() : [];

            // Fetch transactions - API returns { transactions: [...], ... }
            const transactionsRes = await fetch('http://localhost:5000/api/transactions?limit=1000');
            const transactionsResult = transactionsRes.ok ? await transactionsRes.json() : { transactions: [] };
            const transactions = Array.isArray(transactionsResult) ? transactionsResult : (transactionsResult.transactions || []);

            // Fetch payment mode analytics
            const paymentModesRes = await fetch('http://localhost:5000/api/analytics/payment-modes');
            if (paymentModesRes.ok) {
                const paymentModesData = await paymentModesRes.json();
                setPaymentModeData(paymentModesData.modes || []);
            }

            // Calculate stats
            const totalStudents = students.length;
            const activeStudents = students.filter((s: any) => s.status === 'Active').length;

            const totalRevenue = transactions
                .filter((t: any) => t.status === 'Completed' && t.type === 'Credit')
                .reduce((sum: number, t: any) => sum + t.amount, 0);

            const pendingFees = students.reduce((sum: number, s: any) => {
                const fee = s.feeOffered || 0;
                const paid = s.feesPaid || 0;
                return sum + Math.max(0, fee - paid);
            }, 0);

            // Get unique courses
            const coursesMap = new Map<string, number>();
            students.forEach((s: any) => {
                const count = coursesMap.get(s.course) || 0;
                coursesMap.set(s.course, count + 1);
            });

            const courseDataArray: CourseData[] = Array.from(coursesMap.entries())
                .map(([course, enrollments]) => ({ course, enrollments }))
                .sort((a, b) => b.enrollments - a.enrollments)
                .slice(0, 6);

            setCourseData(courseDataArray);

            // Calculate completion rate (students who paid 100% fees)
            const completedPayments = students.filter((s: any) => {
                const fee = s.feeOffered || 0;
                const paid = s.feesPaid || 0;
                return fee > 0 && paid >= fee;
            }).length;
            const completionRate = totalStudents > 0 ? (completedPayments / totalStudents) * 100 : 0;

            // Calculate monthly data from transactions
            const monthlyMap = new Map<string, { revenue: number; students: Set<string> }>();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Initialize last 6 months
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                monthlyMap.set(key, { revenue: 0, students: new Set() });
            }

            // Fill in transaction data
            transactions.forEach((t: any) => {
                const date = new Date(t.date);
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                if (monthlyMap.has(key) && t.status === 'Completed' && t.type === 'Credit') {
                    const data = monthlyMap.get(key)!;
                    data.revenue += t.amount;
                    data.students.add(t.studentId);
                }
            });

            // Convert to array for chart
            const monthlyDataArray: MonthlyData[] = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                const data = monthlyMap.get(key);
                monthlyDataArray.push({
                    month: monthNames[date.getMonth()],
                    revenue: data?.revenue || 0,
                    students: data?.students.size || 0
                });
            }

            setMonthlyData(monthlyDataArray);

            setStats({
                totalRevenue,
                activeStudents,
                totalStudents,
                coursesCount: coursesMap.size,
                pendingFees,
                completionRate
            });
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const metrics = [
        {
            label: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            change: `${stats.totalRevenue > 0 ? '+' : ''}${((stats.totalRevenue / Math.max(1, stats.totalRevenue + stats.pendingFees)) * 100).toFixed(0)}%`,
            isPositive: true,
            icon: DollarSign
        },
        {
            label: "Active Students",
            value: stats.activeStudents.toString(),
            change: `${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%`,
            isPositive: true,
            icon: Users
        },
        {
            label: "Pending Fees",
            value: formatCurrency(stats.pendingFees),
            change: `${stats.coursesCount} courses`,
            isPositive: false,
            icon: BookOpen
        },
        {
            label: "Fee Collection",
            value: `${stats.completionRate.toFixed(0)}%`,
            change: `${Math.round(stats.completionRate)}% fully paid`,
            isPositive: stats.completionRate > 50,
            icon: TrendingUp
        },
    ];

    if (isLoading) {
        return (
            <div className="h-screen bg-background flex overflow-hidden">
                <DashboardSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading analytics...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            <DashboardSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 lg:px-8 lg:pt-6 lg:pb-4">
                    <DashboardHeader />
                </div>

                <div className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-hide">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                                    <p className="text-muted-foreground">Real-time performance and growth metrics</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="gap-2 rounded-xl"
                                onClick={fetchAnalytics}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {metrics.map((metric, index) => (
                            <div
                                key={metric.label}
                                className="bg-card rounded-2xl p-6 border border-border/30"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <metric.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${metric.isPositive ? "text-green-600" : "text-orange-500"}`}>
                                        {metric.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        {metric.change}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
                                <p className="text-sm text-muted-foreground">{metric.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <div
                            id="revenue-chart"
                            className="bg-card rounded-2xl p-6 border border-border/30"
                        >
                            <h3 className="text-lg font-semibold mb-4">Revenue Overview (Last 6 Months)</h3>
                            {monthlyData.some(d => d.revenue > 0) ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="hsl(var(--primary))"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                    <div className="text-center">
                                        <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No revenue data yet</p>
                                        <p className="text-sm">Record payments to see analytics</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Course Enrollments */}
                        <div className="bg-card rounded-2xl p-6 border border-border/30">
                            <h3 className="text-lg font-semibold mb-4">Students by Course</h3>
                            {courseData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={courseData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis dataKey="course" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                    <div className="text-center">
                                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No course data yet</p>
                                        <p className="text-sm">Add students to see enrollment data</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Modes Pie Chart */}
                        <div className="bg-card rounded-2xl p-6 border border-border/30 lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
                            {paymentModeData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={paymentModeData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="amount"
                                                nameKey="mode"
                                            >
                                                {paymentModeData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={PAYMENT_MODE_COLORS[index % PAYMENT_MODE_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "8px",
                                                }}
                                                formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-col justify-center space-y-3">
                                        {paymentModeData.map((mode, index) => (
                                            <div key={mode.mode} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: PAYMENT_MODE_COLORS[index % PAYMENT_MODE_COLORS.length] }}
                                                    />
                                                    <span className="font-medium">{mode.mode}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{mode.amount.toLocaleString('en-IN')}</p>
                                                    <p className="text-xs text-muted-foreground">{mode.count} transactions • {mode.percentage}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                                    <div className="text-center">
                                        <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No payment data yet</p>
                                        <p className="text-sm">Record payments to see distribution</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Activity */}
                        <div
                            id="student-growth-chart"
                            className="bg-card rounded-2xl p-6 border border-border/30 lg:col-span-2"
                        >
                            <h3 className="text-lg font-semibold mb-4">Payment Activity Trend</h3>
                            {monthlyData.some(d => d.students > 0) ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                            formatter={(value: number) => [value, 'Students with Payments']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="students"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            dot={{ fill: "hsl(var(--primary))", r: 6 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No payment activity yet</p>
                                        <p className="text-sm">Record payments to track trends</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, BookOpen, ArrowUp, ArrowDown } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
    { month: "Jan", revenue: 45000, students: 120 },
    { month: "Feb", revenue: 52000, students: 145 },
    { month: "Mar", revenue: 48000, students: 135 },
    { month: "Apr", revenue: 61000, students: 168 },
    { month: "May", revenue: 72000, students: 195 },
    { month: "Jun", revenue: 68000, students: 182 },
];

const courseEnrollments = [
    { course: "Web Dev", enrollments: 245 },
    { course: "Data Science", enrollments: 189 },
    { course: "Mobile Dev", enrollments: 156 },
    { course: "UI/UX", enrollments: 134 },
    { course: "DevOps", enrollments: 98 },
];

const Analytics = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 500); // Delay to allow processed render/animations
            }
        }
    }, [location]);

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            <DashboardSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 lg:px-8 lg:pt-6 lg:pb-4">
                    <DashboardHeader />
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-custom"
                >
                    <motion.div variants={fadeInUp} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <motion.div
                                className="p-2 rounded-xl bg-primary/10"
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                        </div>
                        <p className="text-muted-foreground">Track your performance and growth metrics</p>
                    </motion.div>

                    {/* Key Metrics */}
                    <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Total Revenue", value: "₹2.9Cr", change: "+23.5%", isPositive: true, icon: DollarSign },
                            { label: "Active Students", value: "1,245", change: "+12.3%", isPositive: true, icon: Users },
                            { label: "Course Completion", value: "87%", change: "+5.2%", isPositive: true, icon: BookOpen },
                            { label: "Avg. Rating", value: "4.8", change: "-0.1", isPositive: false, icon: TrendingUp },
                        ].map((metric, index) => (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="bg-card rounded-2xl p-6 border border-border/30"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <metric.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${metric.isPositive ? "text-success" : "text-destructive"}`}>
                                        {metric.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        {metric.change}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
                                <p className="text-sm text-muted-foreground">{metric.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <motion.div
                            id="revenue-chart"
                            variants={fadeInUp}
                            className="bg-card rounded-2xl p-6 border border-border/30"
                        >
                            <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
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
                        </motion.div>

                        {/* Course Enrollments */}
                        <motion.div
                            variants={fadeInUp}
                            className="bg-card rounded-2xl p-6 border border-border/30"
                        >
                            <h3 className="text-lg font-semibold mb-4">Course Enrollments</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={courseEnrollments}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="course" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Student Growth */}
                        <motion.div
                            id="student-growth-chart"
                            variants={fadeInUp}
                            className="bg-card rounded-2xl p-6 border border-border/30 lg:col-span-2"
                        >
                            <h3 className="text-lg font-semibold mb-4">Student Growth Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
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
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Analytics;

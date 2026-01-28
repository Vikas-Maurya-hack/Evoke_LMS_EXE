import { motion } from "framer-motion";
import { CreditCard, DollarSign, Download, Filter, Search } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const transactions = [
    { id: "TXN001", student: "Sarah Johnson", course: "Web Development Pro", amount: 499, date: "2024-01-20", status: "completed" },
    { id: "TXN002", student: "Michael Chen", course: "Data Science Fundamentals", amount: 599, date: "2024-01-19", status: "completed" },
    { id: "TXN003", student: "Emma Davis", course: "Mobile App Development", amount: 549, date: "2024-01-18", status: "pending" },
    { id: "TXN004", student: "James Wilson", course: "UI/UX Design Mastery", amount: 449, date: "2024-01-17", status: "completed" },
    { id: "TXN005", student: "Olivia Brown", course: "DevOps Engineering", amount: 649, date: "2024-01-16", status: "failed" },
    { id: "TXN006", student: "William Taylor", course: "Cloud Architecture", amount: 699, date: "2024-01-15", status: "completed" },
];

const Payments = () => {
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.status === "completed" ? t.amount : 0), 0);
    const pendingAmount = transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0);

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
                                <CreditCard className="w-5 h-5 text-primary" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-foreground">Payments</h1>
                        </div>
                        <p className="text-muted-foreground">Manage transactions and payment history</p>
                    </motion.div>

                    {/* Summary Cards */}
                    <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <motion.div
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-8 h-8" />
                                <p className="text-sm opacity-90">Total Revenue</p>
                            </div>
                            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="bg-card rounded-2xl p-6 border border-border/30"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-8 h-8 text-warning" />
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                            <p className="text-3xl font-bold text-foreground">₹{pendingAmount.toLocaleString('en-IN')}</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="bg-card rounded-2xl p-6 border border-border/30"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="w-8 h-8 text-success" />
                                <p className="text-sm text-muted-foreground">Transactions</p>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{transactions.length}</p>
                        </motion.div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input placeholder="Search transactions..." className="pl-10" />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </motion.div>

                    {/* Transactions Table */}
                    <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Transaction ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Course</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction, index) => (
                                        <motion.tr
                                            key={transaction.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                                            className="border-t border-border/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{transaction.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">{transaction.student}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{transaction.course}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-foreground">₹{transaction.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{transaction.date}</td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        transaction.status === "completed"
                                                            ? "default"
                                                            : transaction.status === "pending"
                                                                ? "secondary"
                                                                : "destructive"
                                                    }
                                                    className="capitalize"
                                                >
                                                    {transaction.status}
                                                </Badge>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default Payments;

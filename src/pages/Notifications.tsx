import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, AlertTriangle, Clock, CalendarClock, RefreshCw, DollarSign, User } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface EMIAlert {
    studentId: string;
    studentName: string;
    overdueCount?: number;
    nextDue?: {
        installmentNumber: number;
        amount: number;
        dueDate: string;
        status: string;
    };
}

interface EMIData {
    totalPlans: number;
    overdueCount: number;
    upcomingDueCount: number;
    overdueAlerts: EMIAlert[];
    upcomingDues: EMIAlert[];
}

interface RecentTransaction {
    _id: string;
    studentName: string;
    amount: number;
    date: string;
    type: string;
    status: string;
    description: string;
}

const Notifications = () => {
    const [emiData, setEmiData] = useState<EMIData | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [emiRes, transRes] = await Promise.all([
                fetch('/api/emi-plans'),
                fetch('/api/transactions/recent')
            ]);

            if (emiRes.ok) {
                const emiResult = await emiRes.json();
                setEmiData(emiResult);
            }

            if (transRes.ok) {
                const transResult = await transRes.json();
                setRecentTransactions(transResult);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDate(dateString);
    };

    const getDaysUntilDue = (dueDate: string) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getDueLabel = (dueDate: string) => {
        const days = getDaysUntilDue(dueDate);
        if (days < 0) return { text: `${Math.abs(days)} days overdue`, urgent: true };
        if (days === 0) return { text: 'Due today', urgent: true };
        if (days === 1) return { text: 'Due tomorrow', urgent: true };
        if (days <= 3) return { text: `Due in ${days} days`, urgent: true };
        if (days <= 7) return { text: `Due in ${days} days`, urgent: false };
        return { text: formatDate(dueDate), urgent: false };
    };

    // Combine all notifications
    const allNotifications = [
        // Overdue EMIs (highest priority)
        ...(emiData?.overdueAlerts || []).map(alert => ({
            id: `overdue-${alert.studentId}`,
            type: 'overdue' as const,
            priority: 1,
            studentName: alert.studentName,
            studentId: alert.studentId,
            overdueCount: alert.overdueCount,
            nextDue: alert.nextDue,
            date: alert.nextDue?.dueDate || new Date().toISOString()
        })),
        // Upcoming EMIs
        ...(emiData?.upcomingDues || []).map(alert => ({
            id: `upcoming-${alert.studentId}`,
            type: 'upcoming' as const,
            priority: 2,
            studentName: alert.studentName,
            studentId: alert.studentId,
            nextDue: alert.nextDue,
            date: alert.nextDue?.dueDate || new Date().toISOString()
        })),
        // Recent transactions
        ...recentTransactions.map(tx => ({
            id: `tx-${tx._id}`,
            type: 'transaction' as const,
            priority: 3,
            studentName: tx.studentName,
            amount: tx.amount,
            description: tx.description,
            status: tx.status,
            date: tx.date
        }))
    ].sort((a, b) => {
        // Sort by priority first, then by date
        if (a.priority !== b.priority) return a.priority - b.priority;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const overdueNotifications = allNotifications.filter(n => n.type === 'overdue');
    const upcomingNotifications = allNotifications.filter(n => n.type === 'upcoming');
    const transactionNotifications = allNotifications.filter(n => n.type === 'transaction');

    const getIcon = (type: string) => {
        switch (type) {
            case 'overdue':
                return <AlertTriangle className="w-5 h-5" />;
            case 'upcoming':
                return <Clock className="w-5 h-5" />;
            case 'transaction':
                return <DollarSign className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'overdue':
                return "bg-destructive/10 text-destructive";
            case 'upcoming':
                return "bg-warning/10 text-warning";
            case 'transaction':
                return "bg-success/10 text-success";
            default:
                return "bg-primary/10 text-primary";
        }
    };

    const renderNotification = (notification: typeof allNotifications[0], index: number) => {
        const isEMI = notification.type === 'overdue' || notification.type === 'upcoming';

        return (
            <motion.div
                key={notification.id}
                variants={fadeInUp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className={cn(
                    "bg-card rounded-2xl p-5 border transition-all cursor-pointer",
                    notification.type === 'overdue'
                        ? "border-destructive/30 bg-destructive/5"
                        : notification.type === 'upcoming'
                            ? "border-warning/30 bg-warning/5"
                            : "border-border/30"
                )}
            >
                <div className="flex items-start gap-4">
                    <motion.div
                        className={`p-3 rounded-xl ${getColor(notification.type)}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        {getIcon(notification.type)}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                            <h3 className="font-semibold text-foreground">
                                {notification.type === 'overdue' && 'EMI Payment Overdue'}
                                {notification.type === 'upcoming' && 'EMI Payment Due Soon'}
                                {notification.type === 'transaction' && 'Payment Received'}
                            </h3>
                            {notification.type === 'overdue' && (
                                <Badge variant="destructive" className="flex-shrink-0">
                                    Urgent
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {notification.studentName}
                            </span>
                        </div>

                        {isEMI && notification.nextDue && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span>EMI #{notification.nextDue.installmentNumber}</span>
                                <span className="font-semibold text-foreground">
                                    ₹{notification.nextDue.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}

                        {notification.type === 'transaction' && (
                            <p className="text-sm text-muted-foreground mb-2">
                                {notification.description} • <span className="font-semibold text-success">+₹{notification.amount?.toLocaleString('en-IN')}</span>
                            </p>
                        )}

                        <div className="flex items-center gap-2">
                            <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className={cn(
                                "text-xs",
                                notification.type === 'overdue' ? "text-destructive font-medium" :
                                    notification.type === 'upcoming' ? "text-warning font-medium" :
                                        "text-muted-foreground"
                            )}>
                                {isEMI && notification.nextDue
                                    ? getDueLabel(notification.nextDue.dueDate).text
                                    : getTimeAgo(notification.date)
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

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
                    className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-hide"
                >
                    <motion.div variants={fadeInUp} className="mb-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <motion.div
                                    className="p-2 rounded-xl bg-primary/10"
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    <Bell className="w-5 h-5 text-primary" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                            </div>
                            <p className="text-muted-foreground">EMI schedules and payment updates</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {emiData && emiData.overdueCount > 0 && (
                                <Badge variant="destructive" className="gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {emiData.overdueCount} Overdue
                                </Badge>
                            )}
                            <Button
                                variant="outline"
                                onClick={fetchData}
                                disabled={isRefreshing}
                                className="gap-2"
                            >
                                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                                Refresh
                            </Button>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Tabs defaultValue="all" className="space-y-4">
                            <TabsList className="grid w-full max-w-md grid-cols-4">
                                <TabsTrigger value="all" className="gap-1">
                                    All
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                        {allNotifications.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="overdue" className="gap-1">
                                    Overdue
                                    {overdueNotifications.length > 0 && (
                                        <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                                            {overdueNotifications.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="upcoming" className="gap-1">
                                    Upcoming
                                    {upcomingNotifications.length > 0 && (
                                        <Badge className="ml-1 h-5 px-1.5 bg-warning/20 text-warning">
                                            {upcomingNotifications.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="payments">Payments</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-3">
                                {allNotifications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                        <p className="text-muted-foreground">No notifications</p>
                                    </div>
                                ) : (
                                    allNotifications.map((notification, index) =>
                                        renderNotification(notification, index)
                                    )
                                )}
                            </TabsContent>

                            <TabsContent value="overdue" className="space-y-3">
                                {overdueNotifications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Check className="w-12 h-12 mx-auto mb-4 text-success/50" />
                                        <p className="text-muted-foreground">No overdue payments</p>
                                    </div>
                                ) : (
                                    overdueNotifications.map((notification, index) =>
                                        renderNotification(notification, index)
                                    )
                                )}
                            </TabsContent>

                            <TabsContent value="upcoming" className="space-y-3">
                                {upcomingNotifications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CalendarClock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                        <p className="text-muted-foreground">No upcoming EMI payments this week</p>
                                    </div>
                                ) : (
                                    upcomingNotifications.map((notification, index) =>
                                        renderNotification(notification, index)
                                    )
                                )}
                            </TabsContent>

                            <TabsContent value="payments" className="space-y-3">
                                {transactionNotifications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                        <p className="text-muted-foreground">No recent transactions</p>
                                    </div>
                                ) : (
                                    transactionNotifications.map((notification, index) =>
                                        renderNotification(notification, index)
                                    )
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default Notifications;

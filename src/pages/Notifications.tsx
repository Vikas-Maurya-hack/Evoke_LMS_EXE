import { motion } from "framer-motion";
import { Bell, Check, X, Info, AlertCircle } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const notifications = [
    {
        id: 1,
        type: "success",
        title: "New Student Enrollment",
        message: "Sarah Johnson has enrolled in Web Development Pro",
        time: "5 minutes ago",
        read: false,
    },
    {
        id: 2,
        type: "info",
        title: "Course Update",
        message: "Data Science Fundamentals curriculum has been updated",
        time: "1 hour ago",
        read: false,
    },
    {
        id: 3,
        type: "warning",
        title: "Payment Pending",
        message: "Payment from Michael Chen is pending verification",
        time: "2 hours ago",
        read: true,
    },
    {
        id: 4,
        type: "success",
        title: "Course Completed",
        message: "Emma Davis completed Mobile App Development",
        time: "3 hours ago",
        read: true,
    },
    {
        id: 5,
        type: "error",
        title: "Payment Failed",
        message: "Transaction #TXN005 failed - please review",
        time: "5 hours ago",
        read: true,
    },
];

const Notifications = () => {
    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <Check className="w-5 h-5" />;
            case "error":
                return <X className="w-5 h-5" />;
            case "warning":
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case "success":
                return "bg-success/10 text-success";
            case "error":
                return "bg-destructive/10 text-destructive";
            case "warning":
                return "bg-warning/10 text-warning";
            default:
                return "bg-primary/10 text-primary";
        }
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
                    className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-custom"
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
                            <p className="text-muted-foreground">Stay updated with your latest activities</p>
                        </div>
                        <Button variant="outline">Mark all as read</Button>
                    </motion.div>

                    <div className="space-y-3">
                        {notifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                variants={fadeInUp}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.01, x: 4 }}
                                className={`bg-card rounded-2xl p-6 border transition-all ${notification.read ? "border-border/30" : "border-primary/30 bg-primary/5"
                                    }`}
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
                                            <h3 className="font-semibold text-foreground">{notification.title}</h3>
                                            {!notification.read && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5"
                                                />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Notifications;

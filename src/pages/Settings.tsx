import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Moon, Sun, Bell, Database, Server, CheckCircle2, XCircle, RefreshCw, Palette, Shield, AlertTriangle, Activity } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Settings = () => {
    // Initialize dark mode from localStorage only, default to light mode
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(true);

    // Database connection status
    interface SystemStatus {
        database: {
            status: string;
            connected: boolean;
            host: string | null;
            name: string | null;
            timestamp: string;
        };
        server: {
            status: string;
            port: number;
            uptime: number;
        };
    }

    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Data Integrity State
    interface DataIntegrityStatus {
        healthy: boolean;
        message: string;
        summary: {
            studentsChecked: number;
            issuesFound: number;
        };
        issues: Array<{
            studentId: string;
            studentName: string;
            feesPaidInStudent: number;
            totalFromTransactions: number;
            difference: number;
        }>;
        timestamp: string;
    }

    const [dataIntegrity, setDataIntegrity] = useState<DataIntegrityStatus | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const checkDatabaseStatus = async () => {
        setIsCheckingStatus(true);
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const data = await response.json();
                setSystemStatus(data);
            } else {
                setSystemStatus({
                    database: { status: 'error', connected: false, host: null, name: null, timestamp: new Date().toISOString() },
                    server: { status: 'unreachable', port: 5000, uptime: 0 }
                });
            }
        } catch (error) {
            setSystemStatus({
                database: { status: 'error', connected: false, host: null, name: null, timestamp: new Date().toISOString() },
                server: { status: 'offline', port: 5000, uptime: 0 }
            });
        } finally {
            setIsCheckingStatus(false);
        }
    };

    // Verify data integrity
    const verifyDataIntegrity = async () => {
        setIsVerifying(true);
        try {
            const response = await fetch('/api/payments/verify');
            if (response.ok) {
                const data = await response.json();
                setDataIntegrity(data);
            }
        } catch (error) {
            console.error('Failed to verify data integrity:', error);
        } finally {
            setIsVerifying(false);
        }
    };

    // Sync payments (fix inconsistencies)
    const syncPayments = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/students/sync-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                // After sync, verify again
                await verifyDataIntegrity();
            }
        } catch (error) {
            console.error('Failed to sync payments:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Check database status on mount
    useEffect(() => {
        checkDatabaseStatus();
        verifyDataIntegrity();
    }, []);

    // Apply dark mode whenever it changes
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

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
                    <motion.div variants={fadeInUp} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <motion.div
                                className="p-2 rounded-xl bg-primary/10"
                                whileHover={{ rotate: 180, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <SettingsIcon className="w-5 h-5 text-primary" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        </div>
                        <p className="text-muted-foreground">Manage your account settings and preferences</p>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <Tabs defaultValue="appearance" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="appearance" className="gap-2">
                                    <Palette className="w-4 h-4" />
                                    Appearance
                                </TabsTrigger>
                                <TabsTrigger value="notifications" className="gap-2">
                                    <Bell className="w-4 h-4" />
                                    Notifications
                                </TabsTrigger>
                                <TabsTrigger value="system" className="gap-2">
                                    <Database className="w-4 h-4" />
                                    System
                                </TabsTrigger>
                            </TabsList>

                            <AnimatePresence mode="wait">
                                <TabsContent value="appearance" className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-card rounded-2xl p-6 border border-border/30"
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Theme</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {darkMode ? (
                                                    <Moon className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Sun className="w-5 h-5 text-primary" />
                                                )}
                                                <div>
                                                    <Label htmlFor="dark-mode" className="text-base font-medium">
                                                        Dark Mode
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Toggle between light and dark theme
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                id="dark-mode"
                                                checked={darkMode}
                                                onCheckedChange={setDarkMode}
                                            />
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="notifications" className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-card rounded-2xl p-6 border border-border/30 space-y-4"
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

                                        <div className="flex items-center justify-between py-3 border-b border-border/30">
                                            <div>
                                                <Label htmlFor="push-notifications" className="text-base font-medium">
                                                    Push Notifications
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive push notifications for important updates
                                                </p>
                                            </div>
                                            <Switch
                                                id="push-notifications"
                                                checked={notifications}
                                                onCheckedChange={setNotifications}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between py-3">
                                            <div>
                                                <Label htmlFor="email-updates" className="text-base font-medium">
                                                    Email Updates
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Get weekly email summaries of your activity
                                                </p>
                                            </div>
                                            <Switch
                                                id="email-updates"
                                                checked={emailUpdates}
                                                onCheckedChange={setEmailUpdates}
                                            />
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="system" className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-card rounded-2xl p-6 border border-border/30 space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">System Status</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={checkDatabaseStatus}
                                                disabled={isCheckingStatus}
                                                className="gap-2"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </Button>
                                        </div>

                                        {/* Database Status */}
                                        <div className="p-5 rounded-xl bg-accent/30 border border-border/30">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${systemStatus?.database.connected ? 'bg-success/10' : 'bg-destructive/10'}`}>
                                                    <Database className={`w-6 h-6 ${systemStatus?.database.connected ? 'text-success' : 'text-destructive'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-semibold text-foreground">MongoDB Database</h4>
                                                        <div className="flex items-center gap-2">
                                                            {systemStatus?.database.connected ? (
                                                                <>
                                                                    <motion.div
                                                                        className="w-3 h-3 rounded-full bg-success"
                                                                        animate={{ scale: [1, 1.2, 1] }}
                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                    />
                                                                    <span className="text-sm font-medium text-success">Connected</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="w-3 h-3 rounded-full bg-destructive" />
                                                                    <span className="text-sm font-medium text-destructive">Disconnected</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {systemStatus?.database.connected && (
                                                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                            <p>Host: <span className="text-foreground font-mono">{systemStatus.database.host}</span></p>
                                                            <p>Database: <span className="text-foreground font-mono">{systemStatus.database.name}</span></p>
                                                        </div>
                                                    )}
                                                </div>
                                                {systemStatus?.database.connected ? (
                                                    <CheckCircle2 className="w-6 h-6 text-success" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-destructive" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Server Status */}
                                        <div className="p-5 rounded-xl bg-accent/30 border border-border/30">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${systemStatus?.server.status === 'running' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                                                    <Server className={`w-6 h-6 ${systemStatus?.server.status === 'running' ? 'text-success' : 'text-destructive'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-semibold text-foreground">Backend Server</h4>
                                                        <div className="flex items-center gap-2">
                                                            {systemStatus?.server.status === 'running' ? (
                                                                <>
                                                                    <motion.div
                                                                        className="w-3 h-3 rounded-full bg-success"
                                                                        animate={{ scale: [1, 1.2, 1] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                                                    />
                                                                    <span className="text-sm font-medium text-success">Running</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="w-3 h-3 rounded-full bg-destructive" />
                                                                    <span className="text-sm font-medium text-destructive">Offline</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {systemStatus?.server.status === 'running' && (
                                                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                            <p>Port: <span className="text-foreground font-mono">{systemStatus.server.port}</span></p>
                                                            <p>Uptime: <span className="text-foreground font-mono">{Math.floor(systemStatus.server.uptime / 60)} minutes</span></p>
                                                        </div>
                                                    )}
                                                </div>
                                                {systemStatus?.server.status === 'running' ? (
                                                    <CheckCircle2 className="w-6 h-6 text-success" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-destructive" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Last Checked */}
                                        {systemStatus && (
                                            <p className="text-sm text-muted-foreground text-center">
                                                Last checked: {new Date(systemStatus.database.timestamp).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Data Integrity Panel */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-card rounded-2xl p-6 border border-border/30 space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-primary" />
                                                <h3 className="text-lg font-semibold">Payment Data Integrity</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={verifyDataIntegrity}
                                                    disabled={isVerifying}
                                                    className="gap-2"
                                                >
                                                    <Activity className={`w-4 h-4 ${isVerifying ? 'animate-pulse' : ''}`} />
                                                    Verify
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={syncPayments}
                                                    disabled={isSyncing}
                                                    className="gap-2"
                                                >
                                                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                                    Sync
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className={`p-5 rounded-xl border ${dataIntegrity?.healthy
                                            ? 'bg-success/5 border-success/30'
                                            : 'bg-warning/5 border-warning/30'
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${dataIntegrity?.healthy ? 'bg-success/10' : 'bg-warning/10'
                                                    }`}>
                                                    {dataIntegrity?.healthy ? (
                                                        <CheckCircle2 className="w-6 h-6 text-success" />
                                                    ) : (
                                                        <AlertTriangle className="w-6 h-6 text-warning" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-foreground">
                                                        {dataIntegrity?.healthy ? 'All Data Consistent' : 'Inconsistencies Found'}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {dataIntegrity?.message || 'Checking...'}
                                                    </p>
                                                    {dataIntegrity && (
                                                        <div className="mt-2 flex gap-4 text-sm">
                                                            <span>
                                                                Students: <strong>{dataIntegrity.summary.studentsChecked}</strong>
                                                            </span>
                                                            <span className={dataIntegrity.summary.issuesFound > 0 ? 'text-warning' : 'text-success'}>
                                                                Issues: <strong>{dataIntegrity.summary.issuesFound}</strong>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Issues List */}
                                        {dataIntegrity?.issues && dataIntegrity.issues.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-muted-foreground">Issues Detected:</h4>
                                                <div className="max-h-40 overflow-y-auto space-y-2">
                                                    {dataIntegrity.issues.map((issue, i) => (
                                                        <div key={i} className="p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium">{issue.studentName}</span>
                                                                <span className="text-muted-foreground text-xs">{issue.studentId}</span>
                                                            </div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                Student Record: ₹{issue.feesPaidInStudent.toLocaleString('en-IN')} |
                                                                Transactions: ₹{issue.totalFromTransactions.toLocaleString('en-IN')} |
                                                                <span className="text-warning"> Diff: ₹{Math.abs(issue.difference).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Last Verified */}
                                        {dataIntegrity?.timestamp && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                Last verified: {new Date(dataIntegrity.timestamp).toLocaleString()}
                                            </p>
                                        )}
                                    </motion.div>
                                </TabsContent>
                            </AnimatePresence>
                        </Tabs>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default Settings;

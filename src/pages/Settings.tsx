import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Moon, Sun, Bell, Database, Server, CheckCircle2, XCircle, RefreshCw, Palette } from "lucide-react";
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

    const checkDatabaseStatus = async () => {
        setIsCheckingStatus(true);
        try {
            const response = await fetch('http://localhost:5000/api/status');
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

    // Check database status on mount
    useEffect(() => {
        checkDatabaseStatus();
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
                    className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-custom"
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

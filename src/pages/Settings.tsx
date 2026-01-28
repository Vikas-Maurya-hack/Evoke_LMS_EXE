import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Moon, Sun, Bell, User, Lock, Palette } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
                            <TabsList className="grid w-full grid-cols-4 mb-6">
                                <TabsTrigger value="appearance" className="gap-2">
                                    <Palette className="w-4 h-4" />
                                    Appearance
                                </TabsTrigger>
                                <TabsTrigger value="notifications" className="gap-2">
                                    <Bell className="w-4 h-4" />
                                    Notifications
                                </TabsTrigger>
                                <TabsTrigger value="account" className="gap-2">
                                    <User className="w-4 h-4" />
                                    Account
                                </TabsTrigger>
                                <TabsTrigger value="security" className="gap-2">
                                    <Lock className="w-4 h-4" />
                                    Security
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

                                <TabsContent value="account" className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-card rounded-2xl p-6 border border-border/30 space-y-4"
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Account Information</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" defaultValue="John Admin" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" type="email" defaultValue="admin@edupro.com" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Input id="role" defaultValue="Super Admin" disabled />
                                        </div>

                                        <Button className="mt-4">Save Changes</Button>
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="security" className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-card rounded-2xl p-6 border border-border/30 space-y-4"
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Change Password</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">Current Password</Label>
                                            <Input id="current-password" type="password" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <Input id="new-password" type="password" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                                            <Input id="confirm-password" type="password" />
                                        </div>

                                        <Button className="mt-4">Update Password</Button>
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

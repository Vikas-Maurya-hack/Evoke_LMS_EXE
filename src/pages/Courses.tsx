import { motion, Variants } from "framer-motion";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CourseExplorer } from "@/components/courses/CourseExplorer";
import { CourseManagement } from "@/components/courses/CourseManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const Courses = () => {
    console.log("Rendering Courses Page with Tabs"); // Debug log
    return (
        <div className="h-screen bg-background flex overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 lg:px-8 lg:pt-6 lg:pb-4">
                    <DashboardHeader />
                </div>

                <div className="flex-1 px-4 lg:px-8 pb-4 overflow-hidden flex flex-col">
                    <Tabs defaultValue="catalog" className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
                            <TabsList className="grid w-[240px] grid-cols-2">
                                <TabsTrigger value="catalog" className="flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4" />
                                    Catalog
                                </TabsTrigger>
                                <TabsTrigger value="management" className="flex items-center gap-2">
                                    <List className="w-4 h-4" />
                                    Manage
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
                            <TabsContent value="catalog" className="mt-0 min-h-full">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <CourseExplorer />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="management" className="mt-0 min-h-full">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <CourseManagement />
                                </motion.div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default Courses;

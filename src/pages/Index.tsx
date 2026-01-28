import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StudentActivityTable, Student } from "@/components/dashboard/StudentActivityTable";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { StudentFullProfile } from "@/components/dashboard/StudentFullProfile";

const statsData = [
  {
    title: "Total Students",
    value: "2,847",
    subtitle: "Active learners",
    icon: Users,
    trend: { value: 12.5, isPositive: true },
    variant: "default" as const,
  },
  {
    title: "Active Courses",
    value: "156",
    subtitle: "Across all programs",
    icon: BookOpen,
    trend: { value: 8.2, isPositive: true },
    variant: "default" as const,
  },
  {
    title: "Revenue This Month",
    value: "₹10,84,500",
    subtitle: "From enrollments",
    icon: DollarSign,
    trend: { value: 23.1, isPositive: true },
    variant: "primary" as const,
  },
  {
    title: "Growth Rate",
    value: "18.3%",
    subtitle: "Year over year",
    icon: TrendingUp,
    trend: { value: 5.4, isPositive: true },
    variant: "success" as const,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 25
    }
  },
};

const Index = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 lg:px-8 lg:pt-6 lg:pb-4">
          <DashboardHeader />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col gap-4 px-4 lg:px-8 pb-4 overflow-hidden"
        >
          {/* Stats Grid */}
          <motion.div
            variants={sectionVariants}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {statsData.map((stat, index) => (
              <StatsCard
                key={stat.title}
                {...stat}
                index={index}
                onClick={() => {
                  if (stat.title === "Revenue This Month") navigate("/analytics#revenue-chart");
                  if (stat.title === "Growth Rate") navigate("/analytics#student-growth-chart");
                }}
              />
            ))}
          </motion.div>

          {/* Main Content Grid - with flex-1 to fill remaining space */}
          <motion.div
            variants={sectionVariants}
            className="grid grid-cols-1 xl:grid-cols-5 gap-4 flex-1 overflow-hidden"
          >
            <div className="xl:col-span-3">
              <StudentActivityTable onStudentClick={setSelectedStudent} />
            </div>
            <div className="xl:col-span-2">
              <TransactionsList />
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentFullProfile
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen, DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StudentActivityTable, Student } from "@/components/dashboard/StudentActivityTable";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { StudentFullProfile } from "@/components/dashboard/StudentFullProfile";


interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingRevenue: number;
  transactionsCount: number;
  coursesCount: number;
}

const Index = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    transactionsCount: 0,
    coursesCount: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const navigate = useNavigate();

  // Fetch dashboard stats from database
  const fetchStats = useCallback(async () => {
    try {
      // Fetch students
      const studentsRes = await fetch('/api/students');
      const students = studentsRes.ok ? await studentsRes.json() : [];

      // Fetch transactions - API returns { transactions: [...], ... }
      const transactionsRes = await fetch('/api/transactions?limit=1000');
      const transactionsResult = transactionsRes.ok ? await transactionsRes.json() : { transactions: [] };
      const transactions = Array.isArray(transactionsResult) ? transactionsResult : (transactionsResult.transactions || []);

      // Calculate stats
      const totalStudents = students.length;
      const activeStudents = students.filter((s: Student) => s.status === 'Active').length;

      // Calculate total revenue from completed transactions
      const totalRevenue = transactions
        .filter((t: any) => t.status === 'Completed' && t.type === 'Credit')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      // Calculate pending revenue (total fees - paid fees)
      const pendingRevenue = students.reduce((sum: number, s: Student) => {
        const fee = s.feeOffered || 0;
        const paid = s.feesPaid || 0;
        return sum + Math.max(0, fee - paid);
      }, 0);

      // Get unique courses count
      const uniqueCourses = new Set(students.map((s: Student) => s.course)).size;

      setStats({
        totalStudents,
        activeStudents,
        totalRevenue,
        pendingRevenue,
        transactionsCount: transactions.length,
        coursesCount: uniqueCourses
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  // Handle student update - triggers refresh of all components
  const handleStudentUpdate = useCallback((updatedStudent: Student) => {
    // Update selected student if it's the same one
    setSelectedStudent(prev =>
      prev && (prev._id === updatedStudent._id || prev.id === updatedStudent.id)
        ? updatedStudent
        : prev
    );

    // Trigger refresh of student table, transactions list, and stats
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const statsData = [
    {
      title: "Total Students",
      value: isLoadingStats ? "..." : stats.totalStudents.toString(),
      subtitle: `${stats.activeStudents} active`,
      icon: Users,
      trend: { value: stats.activeStudents > 0 ? Math.round((stats.activeStudents / Math.max(1, stats.totalStudents)) * 100) : 0, isPositive: true },
      variant: "default" as const,
    },
    {
      title: "Active Courses",
      value: isLoadingStats ? "..." : stats.coursesCount.toString(),
      subtitle: "Unique courses",
      icon: BookOpen,
      trend: { value: 0, isPositive: true },
      variant: "default" as const,
    },
    {
      title: "Total Revenue",
      value: isLoadingStats ? "..." : formatCurrency(stats.totalRevenue),
      subtitle: "From fee payments",
      icon: DollarSign,
      trend: { value: stats.transactionsCount, isPositive: true },
      variant: "primary" as const,
    },
    {
      title: "Pending Fees",
      value: isLoadingStats ? "..." : formatCurrency(stats.pendingRevenue),
      subtitle: "Yet to collect",
      icon: TrendingUp,
      trend: { value: 0, isPositive: false },
      variant: "success" as const,
    },
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 lg:px-8 lg:pt-6 lg:pb-4">
          <DashboardHeader />
        </div>

        <div className="flex-1 flex flex-col gap-4 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-hide">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
              <StatsCard
                key={stat.title}
                {...stat}
                index={index}
                onClick={() => {
                  if (stat.title === "Total Revenue") navigate("/payments");
                  if (stat.title === "Total Students") navigate("/students");
                }}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" style={{ minHeight: '400px' }}>
            <div className="xl:col-span-2" style={{ minHeight: '350px', maxHeight: '500px' }}>
              <StudentActivityTable
                onStudentClick={setSelectedStudent}
                refreshTrigger={refreshTrigger}
              />
            </div>
            <div className="flex flex-col gap-4" style={{ minHeight: '350px', maxHeight: '500px' }}>
              <TransactionsList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </main>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentFullProfile
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onStudentUpdate={handleStudentUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;

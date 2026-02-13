import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search, Filter, SlidersHorizontal, Grid3X3, List, Users, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StudentCard } from "@/components/dashboard/StudentCard";
import { StudentFullProfile } from "@/components/dashboard/StudentFullProfile";
import { AddStudentDialog } from "@/components/dashboard/AddStudentDialog";
import { Student } from "@/components/dashboard/StudentActivityTable";
import { useToast } from "@/hooks/use-toast";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

const filterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      delay: i * 0.05
    }
  })
};

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch students from database
  const fetchStudents = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast({
        title: "Error",
        description: "Could not load students from database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle student update from profile modal (e.g., after payment)
  const handleStudentUpdate = useCallback((updatedStudent: Student) => {
    setStudents(prevStudents =>
      prevStudents.map(s =>
        (s._id === updatedStudent._id || s.id === updatedStudent.id)
          ? updatedStudent
          : s
      )
    );

    // Also update selected student if it's the same one
    setSelectedStudent(prev =>
      prev && (prev._id === updatedStudent._id || prev.id === updatedStudent.id)
        ? updatedStudent
        : prev
    );
  }, []);

  // Handle student delete
  const handleStudentDelete = useCallback(async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      // Remove student from local state
      setStudents(prev => prev.filter(s => (s._id !== studentId && s.id !== studentId)));

      toast({
        title: "Student Deleted",
        description: "The student has been permanently removed from the database.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Handle adding new student
  const handleAddStudent = useCallback(async (newStudentData: Omit<Student, "id">, emiConfig?: { enabled: boolean, installments: number, frequency: string }) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudentData.name,
          email: newStudentData.email,
          course: newStudentData.course,
          status: newStudentData.status,
          feeOffered: newStudentData.feeOffered,
          downPayment: newStudentData.downPayment,
          avatar: newStudentData.avatar // Include avatar
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save student');
      }

      const savedStudent = await response.json();

      // Create EMI Plan if enabled
      if (emiConfig?.enabled) {
        try {
          const token = sessionStorage.getItem('token');
          const emiResponse = await fetch('/api/emi-plans', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              studentId: savedStudent._id,
              numberOfInstallments: emiConfig.installments,
              frequency: emiConfig.frequency,
              startDate: new Date().toISOString()
            })
          });

          if (emiResponse.ok) {
            toast({ title: "EMI Plan Created", description: "Payment schedule generated automatically." });
          } else {
            console.error("EMI Creation failed:", await emiResponse.text());
            toast({ title: "Warning", description: "Student created but EMI plan creation failed. You can create it manually later.", variant: "destructive" });
          }
        } catch (err) {
          console.error("Failed to create EMI plan", err);
          toast({ title: "EMI Plan Error", description: "Student created successfully, but EMI plan could not be generated. Please check your connection.", variant: "destructive" });
        }
      }

      // Add the saved student (with DB-generated ID) to state
      setStudents(prev => [savedStudent, ...prev]);

      toast({
        title: "Student Added Successfully!",
        description: `${savedStudent.name} has been enrolled in ${savedStudent.course}`,
      });
    } catch (error) {
      console.error("Error saving student:", error);
      toast({
        title: "Error",
        description: "Failed to save student to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const filters = [
    { id: "all", label: "All Students", count: students.length },
    { id: "Active", label: "Active", count: students.filter(s => s.status === "Active").length },
    { id: "Pending", label: "Pending", count: students.filter(s => s.status === "Pending").length },
    { id: "Inactive", label: "Inactive", count: students.filter(s => s.status === "Inactive").length },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || student.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-hide">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
                <motion.div
                  className="p-2 rounded-xl bg-primary/10"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                >
                  <Users className="w-7 h-7 text-primary" />
                </motion.div>
                Student Profiles
              </h1>
              <p className="text-muted-foreground">
                Manage and view all {students.length} enrolled students
              </p>
            </div>

            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => fetchStudents(false)}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Student
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Add Student Dialog */}
          <AddStudentDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onAddStudent={handleAddStudent}
          />

          {/* Search and Filters */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col lg:flex-row gap-4"
          >
            {/* Search */}
            <motion.div
              className="relative flex-1 max-w-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 rounded-2xl bg-card border-border/50 shadow-md"
              />
            </motion.div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <motion.button
                  key={filter.id}
                  custom={index}
                  variants={filterVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${activeFilter === filter.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-card text-muted-foreground hover:bg-accent"
                    }
                  `}
                  style={{
                    boxShadow: activeFilter === filter.id
                      ? "0 4px 15px -3px hsl(var(--primary) / 0.4)"
                      : "4px 4px 8px hsl(var(--border) / 0.4), -4px -4px 8px hsl(0 0% 100% / 0.6)"
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filter.label}
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${activeFilter === filter.id ? "bg-primary-foreground/20 text-primary-foreground" : ""}`}
                  >
                    {filter.count}
                  </Badge>
                </motion.button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              {[
                { mode: "grid" as const, icon: Grid3X3 },
                { mode: "list" as const, icon: List },
              ].map((view) => (
                <motion.button
                  key={view.mode}
                  onClick={() => setViewMode(view.mode)}
                  className={`
                    p-3 rounded-xl transition-all duration-200
                    ${viewMode === view.mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent"
                    }
                  `}
                  style={{
                    boxShadow: "4px 4px 8px hsl(var(--border) / 0.4), -4px -4px 8px hsl(0 0% 100% / 0.6)"
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <view.icon className="w-5 h-5" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="mt-4 text-muted-foreground">Loading students...</p>
          </div>
        ) : (
          <>
            {/* Students Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
                }`}
            >
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, index) => (
                  <StudentCard
                    key={student._id || student.id}
                    student={student}
                    index={index}
                    onClick={() => setSelectedStudent(student)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div
                  className="p-6 rounded-3xl bg-muted/50 mb-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Users className="w-12 h-12 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No students found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Student Profile Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentFullProfile
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onDelete={handleStudentDelete}
            onStudentUpdate={handleStudentUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;

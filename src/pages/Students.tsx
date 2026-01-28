import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search, Filter, SlidersHorizontal, Grid3X3, List, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StudentCard } from "@/components/dashboard/StudentCard";
import { StudentFullProfile } from "@/components/dashboard/StudentFullProfile";
import { AddStudentDialog } from "@/components/dashboard/AddStudentDialog";
import { Student, students as initialStudents } from "@/components/dashboard/StudentActivityTable";
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
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Student
              </Button>
            </motion.div>
          </motion.div>

          {/* Add Student Handler */}
          {(() => {
            const handleAddStudent = (newStudentData: Omit<Student, "id">) => {
              const newId = `STU${String(students.length + 1).padStart(3, "0")}`;
              const newStudent: Student = {
                id: newId,
                ...newStudentData,
              };

              setStudents([newStudent, ...students]);

              toast({
                title: "Student Added Successfully!",
                description: `${newStudent.name} has been enrolled in ${newStudent.course}`,
              });
            };

            return (
              <AddStudentDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onAddStudent={handleAddStudent}
              />
            );
          })()}

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
                key={student.id}
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
      </main>

      {/* Student Profile Modal */}
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

export default Students;

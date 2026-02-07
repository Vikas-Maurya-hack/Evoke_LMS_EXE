import { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { Activity, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SoftCard, SoftCardHeader, SoftCardTitle, SoftCardContent } from "@/components/ui/soft-card";
import { Button } from "@/components/ui/button";

export interface Student {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  course: string;
  status: "Active" | "Pending" | "Inactive";
  date?: string;
  joinedDate?: string;
  feeOffered?: number;
  downPayment?: number;
  feesPaid?: number;
  progress?: number;
}

const statusColors = {
  Active: "bg-success/10 text-success hover:bg-success/20 border-success/20",
  Pending: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
  Inactive: "bg-muted text-muted-foreground hover:bg-muted/80 border-muted",
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      delay: index * 0.05
    }
  }),
  hover: {
    scale: 1.01,
    backgroundColor: "hsl(var(--accent))",
    boxShadow: "0 8px 30px -10px hsl(var(--primary) / 0.2)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

interface StudentActivityTableProps {
  onStudentClick: (student: Student) => void;
  refreshTrigger?: number; // Increment to trigger refresh
}

export function StudentActivityTable({ onStudentClick, refreshTrigger }: StudentActivityTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecentStudents = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:5000/api/students');
      if (response.ok) {
        const data = await response.json();
        // Get recent students
        const recentStudents = data.slice(0, 50);
        setStudents(recentStudents);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentStudents();
  }, [fetchRecentStudents, refreshTrigger]);

  return (
    <SoftCard className="flex flex-col h-full" hoverable={false}>
      <SoftCardHeader>
        <motion.div
          className="p-2 rounded-xl bg-primary/10"
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
        >
          <Activity className="w-5 h-5 text-primary" />
        </motion.div>
        <SoftCardTitle>Recent Student Activity</SoftCardTitle>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={fetchRecentStudents}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </SoftCardHeader>
      <SoftCardContent className="p-0 flex-1 min-h-0">
        <div className="h-full overflow-x-auto overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Activity className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No students yet</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/30 m-6 mt-0">
              <table className="w-full min-w-[600px]">
                <thead className="sticky top-0 z-10">
                  <motion.tr
                    className="bg-card"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground bg-card">Student</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground bg-card">Course</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground bg-card">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground bg-card">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-foreground bg-card"></th>
                  </motion.tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <motion.tr
                      key={student._id || student.id}
                      layoutId={`student-card-${student.id}`}
                      className="border-t border-border/30 cursor-pointer group"
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={index}
                      onClick={() => onStudentClick(student)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                          >
                            <Avatar className="h-8 w-8 border-2 border-border/50 shadow-md">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <motion.span
                          className="font-medium text-sm text-foreground px-2 py-1 rounded-lg bg-primary/5"
                          whileHover={{ scale: 1.05 }}
                        >
                          {student.course}
                        </motion.span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`border text-xs ${statusColors[student.status]}`}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                        {(() => {
                          const dateStr = student.joinedDate || student.date;
                          if (!dateStr) return "N/A";
                          const date = new Date(dateStr);
                          if (isNaN(date.getTime())) return dateStr;
                          const month = date.toLocaleDateString("en-US", { month: "short" });
                          const day = date.getDate();
                          const year = date.getFullYear().toString().slice(-2);
                          return `${month} ${day}, '${year}`;
                        })()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <motion.div
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100"
                          initial={{ x: -10 }}
                          whileHover={{ scale: 1.2, x: 5 }}
                          transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SoftCardContent>
    </SoftCard>
  );
}

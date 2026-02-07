import { motion, Variants } from "framer-motion";
import {
  Hash,
  Phone,
  GraduationCap,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Student } from "./StudentActivityTable";

interface StudentCardProps {
  student: Student;
  index: number;
  onClick: () => void;
}

const statusColors = {
  Active: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Inactive: "bg-muted/50 text-muted-foreground border-muted",
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.8,
    rotateX: -15
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
      delay: index * 0.08
    }
  }),
  hover: {
    y: -12,
    scale: 1.02,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

const shimmerVariants: Variants = {
  initial: { x: "-100%" },
  hover: {
    x: "100%",
    transition: { duration: 0.6, ease: "easeInOut" }
  }
};

export function StudentCard({ student, index, onClick }: StudentCardProps) {
  // Safe defaults for fields that might be undefined
  const feeOffered = student.feeOffered ?? 50000;
  const feesPaid = student.feesPaid ?? 0;
  const studentDate = student.date || student.joinedDate || new Date().toISOString();
  const paidPercentage = feeOffered > 0 ? Math.min(100, (feesPaid / feeOffered) * 100).toFixed(0) : "0";

  return (
    <motion.div
      className="relative rounded-3xl bg-card p-6 cursor-pointer overflow-hidden group border border-border/30 shadow-lg"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
      onClick={onClick}
      layoutId={`student-card-${student.id}`}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -skew-x-12 pointer-events-none"
        variants={shimmerVariants}
        initial="initial"
      />

      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
        >
          <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-lg">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-bold">
              {student.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <motion.div
            className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card",
              student.status === "Active" ? "bg-success" :
                student.status === "Pending" ? "bg-warning" : "bg-muted"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" as const, stiffness: 500, damping: 20, delay: index * 0.08 + 0.3 }}
          />
        </motion.div>
        <Badge className={cn("border", statusColors[student.status])}>
          {student.status}
        </Badge>
      </div>

      {/* Student Info */}
      <div className="space-y-3">
        <div>
          <motion.h3
            className="text-lg font-bold text-foreground mb-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 + 0.1 }}
          >
            {student.name}
          </motion.h3>
          <motion.p
            className="text-sm text-muted-foreground flex items-center gap-1.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 + 0.15 }}
          >
            <Hash className="w-3.5 h-3.5" />
            {student.id || student._id}
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-medium"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {student.course}
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          >
            <Calendar className="w-3.5 h-3.5" />
            {new Date(studentDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </motion.div>
        </div>

        {/* Payment Progress */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Payment Progress
            </span>
            <span className="font-semibold text-foreground">{paidPercentage}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${paidPercentage}%` }}
              transition={{
                type: "spring" as const,
                stiffness: 100,
                damping: 20,
                delay: index * 0.08 + 0.4
              }}
            />
          </div>
        </div>
      </div>

      {/* View More Indicator */}
      <motion.div
        className="absolute bottom-4 right-4 p-2 rounded-xl bg-primary/10 text-primary opacity-0 group-hover:opacity-100"
        initial={{ x: 10, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        animate={{ x: 0 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
      >
        <ChevronRight className="w-4 h-4" />
      </motion.div>
    </motion.div>
  );
}

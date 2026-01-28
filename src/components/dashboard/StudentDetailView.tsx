import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Banknote, ArrowDownCircle, GraduationCap, Mail, Hash, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMIProgressBar } from "./EMIProgressBar";
import type { Student } from "./StudentActivityTable";
import { cn } from "@/lib/utils";

interface StudentDetailViewProps {
  student: Student | null;
  onClose: () => void;
}

const statusColors = {
  Active: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Inactive: "bg-muted text-muted-foreground",
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 50,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

export function StudentDetailView({ student, onClose }: StudentDetailViewProps) {
  if (!student) return null;

  // Calculate payment details
  const totalPaid = student.downPayment + Math.floor((student.feeOffered - student.downPayment) * 0.3);
  const pendingAmount = student.feeOffered - totalPaid;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Card */}
        <motion.div
          layoutId={`student-row-${student.id}`}
          className="relative w-full max-w-2xl bg-card rounded-3xl p-8 shadow-xl border border-border/30"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Close Button */}
          <motion.button
            className="absolute top-6 right-6 p-2 rounded-xl bg-accent hover:bg-accent/80 transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header Section */}
            <motion.div variants={staggerItemVariants} className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
              >
                <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {student.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                  <Badge className={statusColors[student.status]}>{student.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4" />
                    <span>{student.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>{student.course}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Enrolled: {new Date(student.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial Summary */}
            <motion.div
              variants={staggerItemVariants}
              className="rounded-2xl bg-accent/50 border border-border/30 p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Financial Summary</h3>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                  className="p-4 rounded-2xl bg-card shadow-md"
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Fee Offered</span>
                  </div>
                  <motion.p
                    className="text-2xl font-bold text-foreground"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" as const, stiffness: 400, damping: 20, delay: 0.3 }}
                  >
                    ₹{student.feeOffered.toLocaleString('en-IN')}
                  </motion.p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-2xl bg-card shadow-md"
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-success/10">
                      <ArrowDownCircle className="w-5 h-5 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">Down Payment</span>
                  </div>
                  <motion.p
                    className="text-2xl font-bold text-success"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" as const, stiffness: 400, damping: 20, delay: 0.4 }}
                  >
                    ₹{student.downPayment.toLocaleString('en-IN')}
                  </motion.p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-2xl bg-card shadow-md"
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-warning/10">
                      <Banknote className="w-5 h-5 text-warning" />
                    </div>
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <motion.p
                    className="text-2xl font-bold text-warning"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" as const, stiffness: 400, damping: 20, delay: 0.5 }}
                  >
                    ₹{pendingAmount.toLocaleString('en-IN')}
                  </motion.p>
                </motion.div>
              </div>

              {/* EMI Progress Bar */}
              <EMIProgressBar
                feeOffered={student.feeOffered}
                downPayment={student.downPayment}
                totalPaid={totalPaid}
              />
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={staggerItemVariants}
              className="flex justify-end gap-3"
            >
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                Close
              </Button>
              <Button className="rounded-xl bg-primary hover:bg-primary/90">
                View Full Profile
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

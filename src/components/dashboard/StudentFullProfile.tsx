import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  X,
  Banknote,
  ArrowDownCircle,
  GraduationCap,
  Mail,
  Hash,
  Calendar,
  Phone,
  MapPin,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  CreditCard,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMIProgressBar } from "./EMIProgressBar";
import type { Student } from "./StudentActivityTable";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StudentFullProfileProps {
  student: Student | null;
  onClose: () => void;
  onDelete?: (studentId: string) => void;
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
    scale: 0.8,
    y: 100,
    rotateX: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 25,
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 100,
    rotateX: 10,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  }
};

const floatAnimation = {
  y: [0, -5, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
};

export function StudentFullProfile({ student, onClose, onDelete }: StudentFullProfileProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!student) return null;

  // Use defaults for financial fields if not present
  const feeOffered = student.feeOffered ?? 50000;
  const downPayment = student.downPayment ?? 10000;
  const studentDate = student.date || student.joinedDate || new Date().toISOString();

  // Calculate payment details with safe defaults
  const totalPaid = downPayment + Math.floor((feeOffered - downPayment) * 0.3);
  const pendingAmount = feeOffered - totalPaid;
  const monthsEnrolled = Math.floor(Math.random() * 12) + 1;
  const coursesCompleted = Math.floor(Math.random() * 5) + 1;
  const averageScore = Math.floor(Math.random() * 20) + 80;

  const handleDelete = async () => {
    const studentId = student._id || student.id;
    if (!studentId || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(studentId);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete student:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Animated Backdrop */}
        <motion.div
          className="absolute inset-0 bg-foreground/30 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Card */}
        <motion.div
          layoutId={`student-card-${student.id}`}
          className="relative w-full max-w-4xl bg-card rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            boxShadow: "0 20px 40px hsl(var(--border) / 0.6)"
          }}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Decorative gradient header */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent pointer-events-none"
            animate={floatAnimation}
          />

          {/* Close Button */}
          <motion.button
            className="absolute top-6 right-6 z-10 p-3 rounded-2xl bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-lg"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>

          <div className="overflow-y-auto scrollbar-hide p-8 pt-16 space-y-8">
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                className="relative"
              >
                <Avatar className="h-28 w-28 border-4 border-primary/30 shadow-2xl">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-3xl font-bold">
                    {student.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className={cn(
                    "absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-card flex items-center justify-center",
                    student.status === "Active" ? "bg-success" :
                      student.status === "Pending" ? "bg-warning" : "bg-muted"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 20, delay: 0.3 }}
                >
                  {student.status === "Active" && <TrendingUp className="w-4 h-4 text-success-foreground" />}
                </motion.div>
              </motion.div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <motion.h2
                    className="text-3xl font-bold text-foreground"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring" as const, stiffness: 300, damping: 25, delay: 0.1 }}
                  >
                    {student.name}
                  </motion.h2>
                  <Badge className={cn("text-sm px-3 py-1", statusColors[student.status])}>
                    {student.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {[
                    { icon: Hash, text: student.id },
                    { icon: Mail, text: student.email },
                    { icon: GraduationCap, text: student.course },
                    { icon: Calendar, text: `Enrolled: ${new Date(studentDate).toLocaleDateString()}` },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--accent))" }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Months Enrolled", value: monthsEnrolled, icon: Clock, color: "text-primary" },
                { label: "Courses Done", value: coursesCompleted, icon: BookOpen, color: "text-success" },
                { label: "Avg. Score", value: `${averageScore}%`, icon: Award, color: "text-warning" },
                { label: "Payments Made", value: 4, icon: CreditCard, color: "text-primary" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="p-4 rounded-2xl bg-accent/30 border border-border/30"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring" as const, stiffness: 300, damping: 25, delay: 0.3 + i * 0.05 }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.2)"
                  }}
                >
                  <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
                  <motion.p
                    className="text-2xl font-bold text-foreground"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" as const, stiffness: 400, damping: 20, delay: 0.4 + i * 0.05 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Financial Summary */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl bg-gradient-to-br from-accent/50 to-accent/30 border border-border/30 p-6"
            >
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Banknote className="w-6 h-6 text-primary" />
                Financial Summary
              </h3>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Fee Offered", value: feeOffered, icon: Banknote, color: "text-foreground", bg: "bg-card" },
                  { label: "Down Payment", value: downPayment, icon: ArrowDownCircle, color: "text-success", bg: "bg-success/5" },
                  { label: "Pending Amount", value: pendingAmount, icon: Banknote, color: "text-warning", bg: "bg-warning/5" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className={cn(
                      "p-5 rounded-2xl border border-border/30",
                      item.bg
                    )}
                    style={{
                      boxShadow: "0 4px 8px hsl(var(--border) / 0.3)"
                    }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring" as const, stiffness: 300, damping: 25, delay: 0.4 + i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className={cn("p-2 rounded-xl", item.bg === "bg-card" ? "bg-primary/10" : item.bg)}
                        whileHover={{ rotate: 15 }}
                        transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                      >
                        <item.icon className={cn("w-5 h-5", item.color)} />
                      </motion.div>
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <motion.p
                      className={cn("text-3xl font-bold", item.color)}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring" as const, stiffness: 400, damping: 20, delay: 0.5 + i * 0.1 }}
                    >
                      ₹{item.value.toLocaleString('en-IN')}
                    </motion.p>
                  </motion.div>
                ))}
              </div>

              {/* EMI Progress Bar */}
              <EMIProgressBar
                feeOffered={feeOffered}
                downPayment={downPayment}
                totalPaid={totalPaid}
              />
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-between gap-3"
            >
              {/* Delete Button */}
              {onDelete && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-xl px-4 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-3 ml-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
                    Close
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="rounded-xl px-6">
                    Send Message
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="rounded-xl px-6 bg-primary hover:bg-primary/90">
                    Edit Profile
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">Delete Student Permanently?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone
              and will permanently remove all data associated with this student from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}

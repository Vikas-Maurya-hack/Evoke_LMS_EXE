import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  X,
  Banknote,
  ArrowDownCircle,
  GraduationCap,
  Mail,
  Hash,
  Calendar,
  Clock,
  BookOpen,
  Award,
  CreditCard,
  Trash2,
  AlertTriangle,
  TrendingUp,
  UserPen,
  History,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMIProgressBar } from "./EMIProgressBar";
import type { Student } from "./StudentActivityTable";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/students/PaymentModal";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HierarchicalCoursePicker } from "@/components/dashboard/HierarchicalCoursePicker";

interface StudentFullProfileProps {
  student: Student | null;
  onClose: () => void;
  onDelete?: (studentId: string) => void;
  onStudentUpdate?: (updatedStudent: Student) => void; // NEW: Callback to sync updates
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

interface Transaction {
  _id: string;
  studentName: string;
  amount: number;
  date: string;
  type: 'Credit' | 'Debit' | 'Refund';
  status: string;
}

export function StudentFullProfile({ student: initialStudent, onClose, onDelete, onStudentUpdate }: StudentFullProfileProps) {
  // Use local state for student to allow real-time updates
  const [student, setStudent] = useState<Student | null>(initialStudent);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // @ts-ignore - emiMonths is a custom field on student
  const [emiMonths, setEmiMonths] = useState(student?.emiMonths || 12);
  const [isEMIExpanded, setIsEMIExpanded] = useState(false);

  // Payment history for this student
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    course: "",
    status: "Active",
    feeOffered: 0
  });

  // Sync local student state when prop changes
  useEffect(() => {
    setStudent(initialStudent);
  }, [initialStudent]);

  // Initialize edit form when student changes
  useEffect(() => {
    if (student) {
      setEditForm({
        name: student.name,
        email: student.email,
        course: student.course,
        status: student.status,
        feeOffered: student.feeOffered || 50000
      });
    }
  }, [student]);

  // Fetch student's transaction history
  const fetchStudentTransactions = async () => {
    if (!student) return;

    setIsLoadingTransactions(true);
    try {
      const studentId = student._id || student.id;
      const response = await fetch(`/api/transactions/student/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Load transactions when student changes
  useEffect(() => {
    if (student) {
      fetchStudentTransactions();
    }
  }, [student?._id, student?.id]);

  if (!student) return null;

  // Calculate financial data from actual stored values
  const feeOffered = student.feeOffered ?? 50000;
  const downPayment = student.downPayment ?? 10000;
  const feesPaid = student.feesPaid ?? 0;
  const pendingAmount = Math.max(0, feeOffered - feesPaid);
  const studentDate = student.date || student.joinedDate || new Date().toISOString();

  // Calculate stats from transactions
  const paymentsCount = transactions.length;

  // Calculate months enrolled from enrollment date
  const enrollmentDate = new Date(studentDate);
  const today = new Date();
  const monthsEnrolled = Math.max(0, Math.floor(
    (today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )); // Average days per month

  // Use static values for course stats (these would come from a course progress system)
  const coursesCompleted = 0;
  const averageScore = 0;

  // Handle payment success - update local state AND notify parent
  const handlePaymentSuccess = (updatedStudent: Student) => {
    // Update local state immediately for instant UI feedback
    setStudent(updatedStudent);

    // Notify parent to update its state (keeps everything in sync)
    if (onStudentUpdate) {
      onStudentUpdate(updatedStudent);
    }

    // Refresh transaction history
    fetchStudentTransactions();

    toast.success("Payment Synced!", {
      description: "Student balance and transaction history updated."
    });
  };

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const studentId = student._id || student.id;

      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedStudent = await response.json();

        // Update local state
        setStudent(updatedStudent);

        // Notify parent
        if (onStudentUpdate) {
          onStudentUpdate(updatedStudent);
        }

        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast.error("Failed to update profile", { description: errorData.message });
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`student-profile-${student._id || student.id}`}
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
                { label: "Payments Made", value: paymentsCount, icon: CreditCard, color: "text-primary" },
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
                  { label: "Total Fee", value: feeOffered, icon: Banknote, color: "text-foreground", bg: "bg-card" },
                  { label: "Total Paid", value: feesPaid, icon: ArrowDownCircle, color: "text-success", bg: "bg-success/5" },
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
                totalPaid={feesPaid}
              />

              {/* EMI Calculator & Timeline */}
              <div className="mt-8 pt-6 border-t border-border/30">
                <div
                  className="flex items-center justify-between mb-4 cursor-pointer hover:bg-accent/10 p-2 rounded-lg transition-colors"
                  onClick={() => setIsEMIExpanded(!isEMIExpanded)}
                >
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    EMI Plan & Schedule
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground bg-accent/30 px-3 py-1 rounded-full">
                      {emiMonths} Months Plan
                    </span>
                    <motion.div
                      animate={{ rotate: isEMIExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isEMIExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-card rounded-2xl border border-border/30 overflow-hidden mb-4">
                        <div className="p-4 bg-muted/30 border-b border-border/30 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Monthly Installment</p>
                            <p className="text-2xl font-bold text-primary">
                              {emiMonths > 0
                                ? `₹${Math.round((feeOffered - downPayment) / emiMonths).toLocaleString('en-IN')}`
                                : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Plan Details</p>
                            <p className="text-sm font-medium text-foreground">
                              {emiMonths > 0
                                ? `${emiMonths} Months x ₹${Math.round((feeOffered - downPayment) / emiMonths).toLocaleString('en-IN')}`
                                : "Full Payment"}
                            </p>
                          </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto scrollbar-hide p-4">
                          <div className="space-y-4">
                            {emiMonths > 0 && Array.from({ length: emiMonths }).map((_, i) => {
                              const principal = feeOffered - downPayment;
                              const monthlyAmount = Math.round(principal / emiMonths);
                              const dueDate = new Date(new Date(studentDate).setMonth(new Date(studentDate).getMonth() + i + 1));

                              // Determine status based on actual fees paid
                              const cumulativeRequired = downPayment + (monthlyAmount * (i + 1));
                              const isPaid = feesPaid >= cumulativeRequired;
                              const isCurrent = !isPaid && feesPaid >= (cumulativeRequired - monthlyAmount);

                              const dueStatus = isPaid ? "Paid" : isCurrent ? "Due Next" : "Pending";

                              return (
                                <div key={i} className="flex items-center gap-4 relative">
                                  {/* Connector Line */}
                                  {i < emiMonths - 1 && (
                                    <div className="absolute left-[19px] top-8 bottom-[-16px] w-0.5 bg-border/50 z-0"></div>
                                  )}

                                  <div className={cn(
                                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 shrink-0 font-bold text-xs transition-colors",
                                    isPaid
                                      ? "bg-success text-success-foreground border-success/20"
                                      : isCurrent
                                        ? "bg-warning text-warning-foreground border-warning/20 animate-pulse"
                                        : "bg-muted text-muted-foreground border-border"
                                  )}>
                                    {i + 1}
                                  </div>

                                  <div className={cn(
                                    "flex-1 p-3 rounded-xl border flex justify-between items-center transition-all",
                                    isPaid ? "bg-success/5 border-success/20" : "bg-card border-border/40"
                                  )}>
                                    <div>
                                      <p className="font-semibold text-sm">Installment #{i + 1}</p>
                                      <p className="text-xs text-muted-foreground">Due: {dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-sm">₹{monthlyAmount.toLocaleString('en-IN')}</p>
                                      <Badge variant={isPaid ? "default" : "outline"} className={cn(
                                        "text-[10px] h-5 px-2",
                                        isPaid ? "bg-success hover:bg-success" :
                                          isCurrent ? "text-warning border-warning" : "text-muted-foreground"
                                      )}>
                                        {dueStatus}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Payment History Section */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl bg-accent/30 border border-border/30 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Payment History
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchStudentTransactions}
                  disabled={isLoadingTransactions}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No payments recorded yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {transactions.map((tx, i) => (
                    <motion.div
                      key={tx._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                          <ArrowDownCircle className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Fee Payment</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-success">+₹{tx.amount.toLocaleString('en-IN')}</span>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
                {/* Record Fee Payment Button */}
                <PaymentModal
                  student={student}
                  onPaymentSuccess={handlePaymentSuccess}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
                    Close
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="rounded-xl px-6 bg-primary hover:bg-primary/90"
                    onClick={() => setIsEditing(true)}
                  >
                    <UserPen className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>
              Update the student's personal and financial information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <HierarchicalCoursePicker
                  value={editForm.course}
                  onValueChange={(value) => setEditForm({ ...editForm, course: value })}
                  placeholder="Select course path..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeOffered">Fee Offered (₹)</Label>
                <Input
                  id="feeOffered"
                  type="number"
                  value={editForm.feeOffered}
                  onChange={(e) => setEditForm({ ...editForm, feeOffered: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Down Payment (₹)</Label>
                <Input
                  type="number"
                  value={student.downPayment || 0}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Down payment cannot be changed after enrollment</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Student
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone and will permanently remove all student data including payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}

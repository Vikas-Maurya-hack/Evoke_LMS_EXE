import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, BookOpen, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Student } from "@/components/dashboard/StudentActivityTable";

interface AddStudentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddStudent: (student: Omit<Student, "id">) => void | Promise<void>;
}

const courses = ["ACCA", "CPA", "CFA", "CMA", "CA"];

export function AddStudentDialog({ isOpen, onClose, onAddStudent }: AddStudentDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        course: "",
        status: "Pending" as "Active" | "Pending" | "Inactive",
        feeOffered: "",
        downPayment: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.course) {
            newErrors.course = "Course is required";
        }

        if (!formData.feeOffered) {
            newErrors.feeOffered = "Fee is required";
        } else if (isNaN(Number(formData.feeOffered)) || Number(formData.feeOffered) <= 0) {
            newErrors.feeOffered = "Fee must be a positive number";
        }

        if (!formData.downPayment) {
            newErrors.downPayment = "Down payment is required";
        } else if (isNaN(Number(formData.downPayment)) || Number(formData.downPayment) < 0) {
            newErrors.downPayment = "Down payment must be a non-negative number";
        } else if (Number(formData.downPayment) > Number(formData.feeOffered)) {
            newErrors.downPayment = "Down payment cannot exceed total fee";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const newStudent: Omit<Student, "id"> = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                course: formData.course,
                status: formData.status,
                date: new Date().toISOString().split("T")[0],
                feeOffered: Number(formData.feeOffered),
                downPayment: Number(formData.downPayment),
            };

            onAddStudent(newStudent);
            handleClose();
        }
    };

    const handleClose = () => {
        setFormData({
            name: "",
            email: "",
            course: "",
            status: "Pending",
            feeOffered: "",
            downPayment: "",
        });
        setErrors({});
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-card rounded-3xl shadow-2xl border border-border/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-custom"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-card border-b border-border/30 px-8 py-6 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        className="p-2 rounded-xl bg-primary/10"
                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    >
                                        <UserPlus className="w-6 h-6 text-primary" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Add New Student</h2>
                                        <p className="text-sm text-muted-foreground">Fill in the student details below</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleClose}
                                    className="p-2 rounded-xl hover:bg-accent transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </motion.button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-primary" />
                                        Full Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter student's full name"
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="student@example.com"
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                {/* Course */}
                                <div className="space-y-2">
                                    <Label htmlFor="course" className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                        Course *
                                    </Label>
                                    <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                                        <SelectTrigger className={errors.course ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Select a course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course} value={course}>
                                                    {course}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
                                </div>

                                {/* Fee and Down Payment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="feeOffered" className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-primary" />
                                            Total Fee (₹) *
                                        </Label>
                                        <Input
                                            id="feeOffered"
                                            type="number"
                                            value={formData.feeOffered}
                                            onChange={(e) => setFormData({ ...formData, feeOffered: e.target.value })}
                                            placeholder="50000"
                                            className={errors.feeOffered ? "border-destructive" : ""}
                                        />
                                        {errors.feeOffered && <p className="text-sm text-destructive">{errors.feeOffered}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="downPayment" className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-primary" />
                                            Down Payment (₹) *
                                        </Label>
                                        <Input
                                            id="downPayment"
                                            type="number"
                                            value={formData.downPayment}
                                            onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                                            placeholder="15000"
                                            className={errors.downPayment ? "border-destructive" : ""}
                                        />
                                        {errors.downPayment && <p className="text-sm text-destructive">{errors.downPayment}</p>}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Status
                                    </Label>
                                    <Select value={formData.status} onValueChange={(value: "Active" | "Pending" | "Inactive") => setFormData({ ...formData, status: value })}>
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

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Add Student
                                        </Button>
                                    </motion.div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

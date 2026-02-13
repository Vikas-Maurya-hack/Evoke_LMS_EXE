import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Upload, Camera, CalendarClock, DollarSign, Wallet } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Student } from "@/components/dashboard/StudentActivityTable";
import { HierarchicalCoursePicker } from "@/components/dashboard/HierarchicalCoursePicker";

interface AddStudentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddStudent: (student: Omit<Student, "id">, emiConfig?: { enabled: boolean, installments: number, frequency: string }) => void | Promise<void>;
}

export function AddStudentDialog({ isOpen, onClose, onAddStudent }: AddStudentDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        course: "",
        status: "Pending" as "Active" | "Pending" | "Inactive",
        feeOffered: "",
        downPayment: "",
        enrollmentDate: new Date().toISOString().split("T")[0], // Default to today
    });

    // New Features State
    const [avatar, setAvatar] = useState<string>("");
    const [useEMI, setUseEMI] = useState(false);
    const [emiInstallments, setEmiInstallments] = useState("6");
    const [emiFrequency, setEmiFrequency] = useState("Monthly");

    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                setErrors(prev => ({ ...prev, avatar: "Image size must be less than 500KB" }));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
                setErrors(prev => ({ ...prev, avatar: "" }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = async () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        } else {
            // Check for duplicate email
            try {
                const response = await fetch('/api/students');
                if (response.ok) {
                    const students = await response.json();
                    const emailExists = students.some((s: Student) =>
                        s.email.toLowerCase() === formData.email.trim().toLowerCase()
                    );
                    if (emailExists) {
                        newErrors.email = "This email is already registered";
                    }
                }
            } catch (error) {
                console.error("Failed to check email uniqueness:", error);
            }
        }
        if (!formData.course) newErrors.course = "Course is required";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (await validateForm()) {
            const newStudent: Omit<Student, "id"> = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                course: formData.course,
                status: formData.status,
                date: formData.enrollmentDate,
                feeOffered: Number(formData.feeOffered),
                downPayment: Number(formData.downPayment),
                avatar: avatar, // Include avatar
                feesPaid: Number(formData.downPayment) // Initial payment
            };
            if (useEMI) {
                // @ts-ignore - emiMonths is a custom field we added to backend
                newStudent.emiMonths = parseInt(emiInstallments);
            }

            // We pass emiConfig as undefined or a simple flag since we integrated it into student object
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
            enrollmentDate: new Date().toISOString().split("T")[0],
        });
        setAvatar("");
        setUseEMI(false);
        setEmiInstallments("6");
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-card w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-border/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-background to-accent/20 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <UserPlus className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold">New Student Enrollment</h2>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-6">

                            {/* SECTION: Personal Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personal Details</h3>

                                {/* Avatar Upload */}
                                <div className="flex justify-center mb-6">
                                    <div
                                        className="relative w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {avatar ? (
                                            <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-accent/20 group-hover:bg-accent/30 transition-colors">
                                                <Camera className="w-6 h-6 mb-1" />
                                                <span className="text-[10px]">Add Photo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    {errors.avatar && <p className="text-xs text-destructive text-center mt-2 absolute">{errors.avatar}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Course</Label>
                                    <HierarchicalCoursePicker
                                        value={formData.course}
                                        onValueChange={(value) => setFormData({ ...formData, course: value })}
                                        error={!!errors.course}
                                        placeholder="Select course path..."
                                    />
                                    {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Enrollment Date</Label>
                                    <div className="relative">
                                        <CalendarClock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={formData.enrollmentDate}
                                            onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                                            className="pl-9"
                                            max={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Select the date when the student enrolled</p>
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            {/* SECTION: Financial Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Financial Details</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Total Course Fee</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                step="1"
                                                className={`pl-9 ${errors.feeOffered ? "border-destructive" : ""}`}
                                                placeholder="50000"
                                                value={formData.feeOffered}
                                                onChange={(e) => setFormData({ ...formData, feeOffered: e.target.value })}
                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            />
                                        </div>
                                        {errors.feeOffered && <p className="text-xs text-destructive">{errors.feeOffered}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Down Payment</Label>
                                        <div className="relative">
                                            <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                step="1"
                                                className={`pl-9 ${errors.downPayment ? "border-destructive" : ""}`}
                                                placeholder="10000"
                                                value={formData.downPayment}
                                                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            />
                                        </div>
                                        {errors.downPayment && <p className="text-xs text-destructive">{errors.downPayment}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Initial Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Active">Active (Paid)</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* EMI Configuration */}
                                <div className="bg-accent/30 rounded-xl p-4 border border-border/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarClock className="w-4 h-4 text-primary" />
                                            <Label className="cursor-pointer" htmlFor="emi-mode">Enable EMI Schedule</Label>
                                        </div>
                                        <Switch
                                            id="emi-mode"
                                            checked={useEMI}
                                            onCheckedChange={setUseEMI}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {useEMI && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pt-2"
                                            >
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Duration (6 - 24 Months)</Label>
                                                    <Select
                                                        value={emiInstallments}
                                                        onValueChange={setEmiInstallments}
                                                    >
                                                        <SelectTrigger className="w-full bg-background border-input">
                                                            <SelectValue placeholder="Select EMI Duration" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-[200px]">
                                                            {Array.from({ length: 19 }, (_, i) => i + 6).map((month) => (
                                                                <SelectItem key={month} value={month.toString()}>
                                                                    {month} Months
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <div className="p-3 mt-2 bg-background/50 rounded-lg border border-border/50">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-muted-foreground">Monthly Payment:</span>
                                                            <span className="font-semibold text-primary">
                                                                ₹{formData.feeOffered && formData.downPayment
                                                                    ? Math.round((Number(formData.feeOffered) - Number(formData.downPayment)) / parseInt(emiInstallments)).toLocaleString('en-IN')
                                                                    : "0"}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Based on (Total Fee - Down Payment) / {emiInstallments} months
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 mt-6 flex justify-end gap-3 sticky bottom-0 bg-card">
                            <Button type="button" variant="ghost" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                Complete Enrollment
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

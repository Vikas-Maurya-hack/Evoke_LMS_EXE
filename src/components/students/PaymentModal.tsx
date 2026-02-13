import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, IndianRupee, User, Loader2, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Student {
    _id?: string;
    id: string;
    name: string;
    email: string;
    course: string;
    feeOffered?: number;
    feesPaid?: number;
}

interface PaymentModalProps {
    student: Student;
    onPaymentSuccess?: (updatedStudent: Student) => void;
}

export function PaymentModal({ student, onPaymentSuccess }: PaymentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState<string>("");
    const [paymentMode, setPaymentMode] = useState<string>("Cash");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const pendingAmount = (student.feeOffered || 50000) - (student.feesPaid || 0);

    const handleSubmit = async () => {
        const paymentAmount = parseFloat(amount);

        if (!paymentAmount || paymentAmount <= 0) {
            toast.error("Invalid Amount", { description: "Please enter a valid amount greater than 0" });
            return;
        }

        if (paymentAmount > pendingAmount) {
            toast.warning("Amount Exceeds Balance", {
                description: `Pending amount is only ₹${pendingAmount.toLocaleString('en-IN')}`
            });
        }

        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('token');
            const studentId = student._id || student.id;

            const response = await fetch('/api/payments/collect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: studentId,
                    amount: paymentAmount,
                    description: 'Fee Payment',
                    paymentMode: paymentMode
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setShowSuccess(true);

                // Show receipt number in success message
                const receiptInfo = data.transaction?.receiptNumber
                    ? ` | Receipt: ${data.transaction.receiptNumber}`
                    : '';

                toast.success("Payment Recorded!", {
                    description: `₹${paymentAmount.toLocaleString('en-IN')} collected from ${student.name}${receiptInfo}`
                });

                // Show warning if payment exceeds fee
                if (data.warning) {
                    toast.warning("Note", { description: data.warning });
                }

                // Callback to update parent component with the updated student
                if (onPaymentSuccess && data.student) {
                    onPaymentSuccess(data.student);
                }

                // Close modal after success animation
                setTimeout(() => {
                    setShowSuccess(false);
                    setAmount("");
                    setIsOpen(false);
                }, 1500);
            } else {
                toast.error("Payment Failed", { description: data.message || "Could not record payment" });
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Connection Error", { description: "Could not connect to server" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="outline"
                        className="rounded-xl gap-2 border-success/30 text-success hover:bg-success/10 hover:text-success"
                    >
                        <CreditCard className="w-4 h-4" />
                        Record Fee
                    </Button>
                </motion.div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl">
                <AnimatePresence mode="wait">
                    {showSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                className="p-4 rounded-full bg-success/10 mb-4"
                            >
                                <CheckCircle2 className="w-12 h-12 text-success" />
                            </motion.div>
                            <h3 className="text-xl font-semibold text-foreground">Payment Recorded!</h3>
                            <p className="text-muted-foreground mt-1">Transaction saved successfully</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-primary/10">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </div>
                                    Record Fee Payment
                                </DialogTitle>
                                <DialogDescription>
                                    Collect and record a fee payment for this student.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-6">
                                {/* Student Info (Read-only) */}
                                <div className="p-4 rounded-xl bg-accent/50 border border-border/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.course}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Total Fee</p>
                                            <p className="font-semibold text-foreground">
                                                ₹{(student.feeOffered || 50000).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Pending</p>
                                            <p className="font-semibold text-warning">
                                                ₹{pendingAmount.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-3">
                                    <Label className="text-base font-medium">Payment Mode</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Cash', 'UPI', 'Online Transfer', 'Cheque'].map((mode) => (
                                            <div
                                                key={mode}
                                                onClick={() => setPaymentMode(mode)}
                                                className={`
                                                    cursor-pointer p-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                                                    ${paymentMode === mode
                                                        ? 'bg-primary/10 border-primary text-primary font-medium'
                                                        : 'bg-background border-border hover:bg-accent hover:border-border/80'
                                                    }
                                                `}
                                            >
                                                {mode}
                                                {paymentMode === mode && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="space-y-3">
                                    <Label htmlFor="amount" className="text-base font-medium">
                                        Amount (₹)
                                    </Label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pl-12 py-6 text-lg rounded-xl"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !amount}
                                    className="rounded-xl gap-2 bg-success hover:bg-success/90"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Confirm Payment
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}

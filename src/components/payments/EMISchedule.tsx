import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, CheckCircle2, AlertTriangle, Clock,
    ChevronDown, ChevronUp, Plus, RefreshCw,
    DollarSign, CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface Installment {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    status: 'Pending' | 'Paid' | 'Overdue' | 'Partially Paid';
    paidAmount: number;
    paidDate: string | null;
}

interface EMIPlan {
    _id: string;
    studentId: string;
    totalAmount: number;
    downPayment: number;
    remainingAmount: number;
    numberOfInstallments: number;
    frequency: string;
    startDate: string;
    installments: Installment[];
    completionPercentage: number;
    overdueCount: number;
}

interface EMIScheduleProps {
    studentId: string;
    studentName: string;
    feeOffered: number;
    downPayment: number;
    feesPaid: number;
    onRefresh?: () => void;
}

const statusConfig = {
    Pending: {
        color: 'bg-muted/50 text-muted-foreground',
        icon: Clock,
        label: 'Pending'
    },
    Paid: {
        color: 'bg-success/10 text-success border-success/30',
        icon: CheckCircle2,
        label: 'Paid'
    },
    Overdue: {
        color: 'bg-destructive/10 text-destructive border-destructive/30',
        icon: AlertTriangle,
        label: 'Overdue'
    },
    'Partially Paid': {
        color: 'bg-warning/10 text-warning border-warning/30',
        icon: DollarSign,
        label: 'Partial'
    }
};

export function EMISchedule({
    studentId,
    studentName,
    feeOffered,
    downPayment,
    feesPaid,
    onRefresh
}: EMIScheduleProps) {
    const [emiPlan, setEmiPlan] = useState<EMIPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true); // Auto-expand to show installments by default
    const [isCreating, setIsCreating] = useState(false);

    // Create plan form state
    const [numberOfInstallments, setNumberOfInstallments] = useState('6');
    const [frequency, setFrequency] = useState('Monthly');

    const fetchEMIPlan = async () => {
        setIsLoading(true);
        try {
            const url = `http://localhost:5000/api/emi-plans/${studentId}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setEmiPlan(data);
            } else if (response.status === 404) {
                setEmiPlan(null);
            }
        } catch (error) {
            console.error('Error fetching EMI plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) {
            fetchEMIPlan();
        }
    }, [studentId]);

    const createEMIPlan = async () => {
        setIsCreating(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/emi-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId,
                    numberOfInstallments: parseInt(numberOfInstallments),
                    frequency,
                    startDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                setEmiPlan(data.emiPlan);
                toast.success('EMI Plan Created', {
                    description: `${numberOfInstallments} ${frequency.toLowerCase()} installments scheduled`
                });
            } else {
                const error = await response.json();
                toast.error('Failed to create plan', { description: error.message });
            }
        } catch (error) {
            console.error('Error creating EMI plan:', error);
            toast.error('Error creating EMI plan');
        } finally {
            setIsCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysUntilDue = (dueDate: string) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const remainingAmount = feeOffered - downPayment;

    if (isLoading) {
        return (
            <div className="p-4 bg-accent/30 rounded-xl">
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading EMI plan...</span>
                </div>
            </div>
        );
    }

    // No EMI plan exists - show create option
    if (!emiPlan) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-accent/30 rounded-xl border border-border/50"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">EMI Schedule</h4>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    No EMI plan set up. Create a payment schedule for easier tracking.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Installments</label>
                        <Select value={numberOfInstallments} onValueChange={setNumberOfInstallments}>
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[3, 4, 5, 6, 8, 10, 12].map(n => (
                                    <SelectItem key={n} value={n.toString()}>{n} Installments</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Quarterly">Quarterly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4 p-3 bg-card rounded-lg">
                    <p>Remaining Amount: <strong className="text-foreground">₹{remainingAmount.toLocaleString('en-IN')}</strong></p>
                    <p className="mt-1">
                        ≈ ₹{Math.floor(remainingAmount / parseInt(numberOfInstallments)).toLocaleString('en-IN')} per installment
                    </p>
                </div>

                <Button
                    onClick={createEMIPlan}
                    disabled={isCreating || remainingAmount <= 0}
                    className="w-full"
                >
                    {isCreating ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create EMI Plan
                        </>
                    )}
                </Button>
            </motion.div>
        );
    }

    // Show EMI plan
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/30 rounded-xl border border-border/50 overflow-hidden"
        >
            {/* DEBUG INFO - Remove after fixing */}
            <div className="p-2 bg-info/10 text-xs font-mono">
                <strong>DEBUG:</strong> emiPlan exists: {emiPlan ? 'YES' : 'NO'} |
                isExpanded: {isExpanded ? 'YES' : 'NO'} |
                installments count: {emiPlan?.installments?.length || 0}
            </div>

            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <CalendarDays className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold">EMI Schedule</h4>
                            <p className="text-xs text-muted-foreground">
                                {emiPlan.numberOfInstallments} {emiPlan.frequency} installments
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Progress */}
                        <div className="text-right">
                            <p className="text-sm font-semibold">{emiPlan.completionPercentage}%</p>
                            <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                        {/* Overdue Alert */}
                        {emiPlan.overdueCount > 0 && (
                            <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {emiPlan.overdueCount} Overdue
                            </Badge>
                        )}
                        {/* Expand Toggle */}
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${emiPlan.completionPercentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Installments List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border/50"
                    >
                        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                            {emiPlan.installments.map((installment, index) => {
                                const StatusIcon = statusConfig[installment.status].icon;
                                const daysUntil = getDaysUntilDue(installment.dueDate);
                                const isUpcoming = installment.status === 'Pending' && daysUntil <= 7 && daysUntil >= 0;

                                return (
                                    <motion.div
                                        key={installment.installmentNumber}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`
                                            p-3 rounded-lg border flex items-center justify-between
                                            ${installment.status === 'Paid' ? 'bg-success/5 border-success/20' :
                                                installment.status === 'Overdue' ? 'bg-destructive/5 border-destructive/20' :
                                                    isUpcoming ? 'bg-warning/5 border-warning/20' :
                                                        'bg-card border-border/50'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                                                ${installment.status === 'Paid' ? 'bg-success/20 text-success' :
                                                    installment.status === 'Overdue' ? 'bg-destructive/20 text-destructive' :
                                                        'bg-muted text-muted-foreground'}
                                            `}>
                                                {installment.status === 'Paid' ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    installment.installmentNumber
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    ₹{installment.amount.toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(installment.dueDate)}
                                                    {isUpcoming && installment.status === 'Pending' && (
                                                        <span className="text-warning ml-1">
                                                            (Due in {daysUntil} days)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`gap-1 ${statusConfig[installment.status].color}`}
                                        >
                                            <StatusIcon className="w-3 h-3" />
                                            {statusConfig[installment.status].label}
                                        </Badge>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

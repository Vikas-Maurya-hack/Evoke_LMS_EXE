import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Download, Printer, CheckCircle,
    Building2, Phone, Mail, Calendar,
    User, CreditCard, Receipt as ReceiptIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReceiptData {
    receiptNumber: string;
    date: string;
    studentName: string;
    studentId: string;
    studentEmail: string;
    course: string;
    amount: number;
    amountInWords: string;
    paymentMode: string;
    description: string;
    previousBalance: number;
    newBalance: number;
    totalFee: number;
    totalPaid: number;
    pendingAmount: number;
    recordedBy: string;
    status: string;
    organizationName: string;
    organizationAddress: string;
    organizationPhone: string;
    organizationEmail: string;
}

interface PaymentReceiptProps {
    transactionId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentReceipt({ transactionId, isOpen, onClose }: PaymentReceiptProps) {
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchReceipt = async () => {
        if (!transactionId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}/receipt`);
            if (response.ok) {
                const data = await response.json();
                setReceipt(data);
            } else {
                toast.error('Failed to load receipt');
            }
        } catch (error) {
            console.error('Error fetching receipt:', error);
            toast.error('Error loading receipt');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch receipt when opened
    useState(() => {
        if (isOpen && transactionId) {
            fetchReceipt();
        }
    });

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-content');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${receipt?.receiptNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .receipt-header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .org-name { font-size: 24px; font-weight: bold; color: #333; }
                    .receipt-title { 
                        font-size: 18px; 
                        margin-top: 10px;
                        background: #f0f0f0;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    .receipt-number { font-size: 14px; color: #666; margin-top: 5px; }
                    .info-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                    }
                    .info-box {
                        background: #f9f9f9;
                        padding: 15px;
                        border-radius: 8px;
                        width: 48%;
                    }
                    .info-box h3 { font-size: 12px; color: #666; margin-bottom: 10px; }
                    .info-box p { font-size: 14px; margin: 5px 0; }
                    .amount-section {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 10px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .amount { font-size: 36px; font-weight: bold; }
                    .amount-words { font-size: 14px; margin-top: 10px; opacity: 0.9; }
                    .details-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .details-table td {
                        padding: 12px;
                        border-bottom: 1px solid #eee;
                    }
                    .details-table td:first-child { color: #666; width: 40%; }
                    .details-table td:last-child { font-weight: 500; }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px dashed #ccc;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    .signature-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 60px;
                    }
                    .signature-box {
                        text-align: center;
                        width: 200px;
                    }
                    .signature-line {
                        border-top: 1px solid #333;
                        margin-top: 50px;
                        padding-top: 10px;
                    }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleDownloadPDF = () => {
        // For real PDF generation, you'd use a library like jsPDF or html2pdf
        // For now, we'll use the print functionality
        toast.info('Use Print → Save as PDF for best results');
        handlePrint();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <ReceiptIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Payment Receipt</h2>
                                {receipt && (
                                    <p className="text-sm text-muted-foreground">{receipt.receiptNumber}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Receipt Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        ) : receipt ? (
                            <div id="receipt-content" className="space-y-6">
                                {/* Organization Header */}
                                <div className="text-center pb-4 border-b-2 border-border">
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {receipt.organizationName}
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {receipt.organizationAddress}
                                    </p>
                                    <div className="mt-3 inline-block bg-primary/10 text-primary px-4 py-2 rounded-lg">
                                        <span className="font-semibold">FEE RECEIPT</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Receipt No: <span className="font-mono font-semibold">{receipt.receiptNumber}</span>
                                    </p>
                                </div>

                                {/* Student & Payment Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-accent/30 p-4 rounded-xl">
                                        <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4" /> STUDENT DETAILS
                                        </h3>
                                        <p className="font-semibold text-foreground">{receipt.studentName}</p>
                                        <p className="text-sm text-muted-foreground">{receipt.studentId}</p>
                                        <p className="text-sm text-muted-foreground">{receipt.studentEmail}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Course: <span className="text-foreground">{receipt.course}</span>
                                        </p>
                                    </div>
                                    <div className="bg-accent/30 p-4 rounded-xl">
                                        <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> PAYMENT DETAILS
                                        </h3>
                                        <p className="text-sm">
                                            Date: <span className="font-semibold">
                                                {new Date(receipt.date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </p>
                                        <p className="text-sm mt-1">
                                            Mode: <span className="font-semibold">{receipt.paymentMode}</span>
                                        </p>
                                        <p className="text-sm mt-1">
                                            Status: <span className="text-success font-semibold">{receipt.status}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Amount Section */}
                                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-xl text-center">
                                    <p className="text-sm opacity-90">Amount Paid</p>
                                    <p className="text-4xl font-bold mt-2">
                                        ₹{receipt.amount.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-sm opacity-90 mt-2 italic">
                                        {receipt.amountInWords}
                                    </p>
                                </div>

                                {/* Fee Summary */}
                                <div className="border border-border rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <tbody>
                                            <tr className="border-b border-border">
                                                <td className="p-3 text-muted-foreground">Description</td>
                                                <td className="p-3 font-medium text-right">{receipt.description}</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="p-3 text-muted-foreground">Total Course Fee</td>
                                                <td className="p-3 font-medium text-right">₹{receipt.totalFee.toLocaleString('en-IN')}</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="p-3 text-muted-foreground">Previous Paid</td>
                                                <td className="p-3 font-medium text-right">₹{receipt.previousBalance.toLocaleString('en-IN')}</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="p-3 text-muted-foreground">This Payment</td>
                                                <td className="p-3 font-medium text-right text-success">+ ₹{receipt.amount.toLocaleString('en-IN')}</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="p-3 text-muted-foreground">Total Paid</td>
                                                <td className="p-3 font-medium text-right">₹{receipt.totalPaid.toLocaleString('en-IN')}</td>
                                            </tr>
                                            <tr className="bg-accent/30">
                                                <td className="p-3 font-semibold">Balance Pending</td>
                                                <td className="p-3 font-bold text-right text-warning">₹{receipt.pendingAmount.toLocaleString('en-IN')}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-start pt-4 border-t border-dashed border-border">
                                    <div className="text-sm text-muted-foreground">
                                        <p>Received by: {receipt.recordedBy}</p>
                                        <p className="mt-1">This is a computer generated receipt.</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-32 border-t border-border pt-2">
                                            <p className="text-sm text-muted-foreground">Authorized Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                                <p>No receipt data available</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

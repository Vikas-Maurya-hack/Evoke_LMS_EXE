import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    DollarSign,
    Download,
    Search,
    RefreshCw,
    Calendar,
    TrendingUp,
    Clock,
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Transaction {
    _id: string;
    studentId: string;
    studentName: string;
    amount: number;
    date: string;
    type: 'Credit' | 'Debit' | 'Refund';
    description: string;
    status: 'Completed' | 'Pending' | 'Failed';
    recordedBy?: string;
    paymentMode?: 'Cash' | 'Cheque' | 'UPI' | 'Online Transfer' | 'Other';
}

interface PaymentStats {
    totalRevenue: number;
    pendingAmount: number;
    transactionsCount: number;
    thisMonthRevenue: number;
}

const Payments = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stats, setStats] = useState<PaymentStats>({
        totalRevenue: 0,
        pendingAmount: 0,
        transactionsCount: 0,
        thisMonthRevenue: 0
    });

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch all transactions
    const fetchTransactions = useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Fetch all transactions with a high limit to get everything
            const response = await fetch('/api/transactions?limit=1000');
            if (response.ok) {
                const result = await response.json();
                // API returns { transactions: [...], currentPage, totalPages, totalTransactions }
                const data = Array.isArray(result) ? result : (result.transactions || []);
                setTransactions(data);
                setFilteredTransactions(data);

                // Calculate stats
                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();

                const completedTransactions = data.filter((t: Transaction) =>
                    t.status === 'Completed' && t.type === 'Credit'
                );

                const totalRevenue = completedTransactions.reduce(
                    (sum: number, t: Transaction) => sum + t.amount, 0
                );

                const thisMonthRevenue = completedTransactions
                    .filter((t: Transaction) => {
                        const txDate = new Date(t.date);
                        return txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear;
                    })
                    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

                const pendingAmount = data
                    .filter((t: Transaction) => t.status === 'Pending')
                    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

                setStats({
                    totalRevenue,
                    pendingAmount,
                    transactionsCount: data.length,
                    thisMonthRevenue
                });
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Filter transactions based on search and date
    useEffect(() => {
        let filtered = [...transactions];

        // Filter by name
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.studentName.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }

        // Filter by date range
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(t => new Date(t.date) >= fromDate);
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(t => new Date(t.date) <= toDate);
        }

        setFilteredTransactions(filtered);
        setCurrentPage(1);
    }, [searchQuery, dateFrom, dateTo, transactions]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery("");
        setDateFrom("");
        setDateTo("");
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN').format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Transaction ID', 'Student Name', 'Amount', 'Date', 'Type', 'Status', 'Description'];
        const csvData = filteredTransactions.map(t => [
            t._id,
            t.studentName,
            t.amount,
            formatDate(t.date),
            t.type,
            t.status,
            t.description
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            <DashboardSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 lg:px-8 lg:pt-6 lg:pb-4">
                    <DashboardHeader />
                </div>

                <div className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-hide">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Payments</h1>
                                    <p className="text-muted-foreground">Full transaction history and payment records</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="gap-2 rounded-xl"
                                onClick={fetchTransactions}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-6 h-6" />
                                <p className="text-sm opacity-90">Total Revenue</p>
                            </div>
                            <p className="text-2xl font-bold">₹{formatCurrency(stats.totalRevenue)}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-6 h-6" />
                                <p className="text-sm opacity-90">This Month</p>
                            </div>
                            <p className="text-2xl font-bold">₹{formatCurrency(stats.thisMonthRevenue)}</p>
                        </div>

                        <div className="bg-card rounded-2xl p-5 border border-border/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-6 h-6 text-warning" />
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">₹{formatCurrency(stats.pendingAmount)}</p>
                        </div>

                        <div className="bg-card rounded-2xl p-5 border border-border/30">
                            <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="w-6 h-6 text-primary" />
                                <p className="text-sm text-muted-foreground">Transactions</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stats.transactionsCount}</p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        {/* Search by Name */}
                        <div className="flex flex-col gap-1.5 flex-1">
                            <Label className="text-xs text-muted-foreground ml-1">Search Student</Label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name..."
                                    className="pl-12 py-5 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Date From */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground ml-1">Start Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    placeholder="From date"
                                    className="pl-12 py-5 rounded-xl w-full lg:w-44"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Date To */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground ml-1">End Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    placeholder="To date"
                                    className="pl-12 py-5 rounded-xl w-full lg:w-44"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || dateFrom || dateTo) && (
                            <Button
                                variant="ghost"
                                className="gap-2 rounded-xl"
                                onClick={clearFilters}
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </Button>
                        )}

                        {/* Export */}
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl"
                            onClick={exportToCSV}
                            disabled={filteredTransactions.length === 0}
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Loading transactions...</p>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <CreditCard className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-1">No transactions found</h3>
                                <p className="text-sm text-muted-foreground">
                                    {transactions.length === 0
                                        ? "Record a fee payment to see transactions here"
                                        : "Try adjusting your search or filter criteria"
                                    }
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/30">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Mode</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {paginatedTransactions.map((transaction) => (
                                                <tr key={transaction._id} className="hover:bg-accent transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-foreground">{transaction.studentName}</p>
                                                            <p className="text-xs text-muted-foreground">{transaction.description}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "font-bold text-lg",
                                                            transaction.type === 'Credit' ? "text-green-600" : "text-red-600"
                                                        )}>
                                                            {transaction.type === 'Credit' ? '+' : '-'}₹{formatCurrency(transaction.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-foreground">
                                                        {formatDate(transaction.date)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {transaction.paymentMode || 'Cash'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={cn(
                                                            "border",
                                                            transaction.status === 'Completed'
                                                                ? "bg-green-100 text-green-800 border-green-200"
                                                                : transaction.status === 'Pending'
                                                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                    : "bg-red-100 text-red-800 border-red-200"
                                                        )}>
                                                            {transaction.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
                                        <p className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 rounded-lg"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 rounded-lg"
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Payments;

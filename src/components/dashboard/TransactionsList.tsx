import { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, Sparkles } from "lucide-react";
import { SoftCard, SoftCardHeader, SoftCardTitle, SoftCardContent } from "@/components/ui/soft-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
}

const statusColors = {
  Completed: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit'
  });
};

interface TransactionsListProps {
  refreshTrigger?: number; // Increment to trigger refresh
}

export function TransactionsList({ refreshTrigger }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:5000/api/transactions?limit=50');
      if (response.ok) {
        const data = await response.json();
        const transactions = Array.isArray(data) ? data : (data.transactions || []);
        setTransactions(transactions);
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
  }, [fetchTransactions, refreshTrigger]);

  const handleRefresh = () => {
    fetchTransactions();
  };

  return (
    <SoftCard hoverable={false} className="flex flex-col h-full">
      <SoftCardHeader>
        <motion.div
          className="p-2 rounded-xl bg-primary/10"
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
        >
          <CreditCard className="w-5 h-5 text-primary" />
        </motion.div>
        <SoftCardTitle>Recent Transactions</SoftCardTitle>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </SoftCardHeader>
      <SoftCardContent className="flex-1 p-0 min-h-0">
        <div className="h-full overflow-y-auto px-6 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <motion.div
                className="p-4 rounded-2xl bg-muted/50"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </motion.div>
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">No transactions yet</p>
                <p className="text-xs text-muted-foreground">Record a fee to see it here</p>
              </div>
            </div>
          ) : (
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={refreshTrigger} // Re-animate on refresh
            >
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction._id}
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-xl bg-accent/30 border border-border/30"
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "hsl(var(--accent))",
                    boxShadow: "0 4px 20px -5px hsl(var(--primary) / 0.1)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={cn(
                        "p-2 rounded-xl",
                        transaction.type === "Credit"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      )}
                      whileHover={{ rotate: 15 }}
                      transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                    >
                      {transaction.type === "Credit" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-destructive" />
                      )}
                    </motion.div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{transaction.studentName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.span
                      className={cn(
                        "font-bold text-sm",
                        transaction.type === "Credit" ? "text-success" : "text-destructive"
                      )}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                    >
                      {transaction.type === "Credit" ? "+" : "-"}₹{formatCurrency(transaction.amount)}
                    </motion.span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs border hidden sm:inline-flex", statusColors[transaction.status])}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </SoftCardContent>
    </SoftCard>
  );
}

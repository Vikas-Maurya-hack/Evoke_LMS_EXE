import { motion, Variants } from "framer-motion";
import { CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { SoftCard, SoftCardHeader, SoftCardTitle, SoftCardContent } from "@/components/ui/soft-card";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  studentName?: string;
}

const transactions: Transaction[] = [
  { id: "TXN001", description: "Course Fee - ACCA", amount: 1500, type: "income", date: "2024-01-15", studentName: "Emma Thompson" },
  { id: "TXN002", description: "EMI Payment", amount: 500, type: "income", date: "2024-01-14", studentName: "Michael Chen" },
  { id: "TXN003", description: "Refund - Course Change", amount: 200, type: "expense", date: "2024-01-13", studentName: "James Brown" },
  { id: "TXN004", description: "Down Payment - CFA", amount: 1800, type: "income", date: "2024-01-12", studentName: "David Williams" },
  { id: "TXN005", description: "EMI Payment", amount: 450, type: "income", date: "2024-01-11", studentName: "Lisa Anderson" },
];

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

export function TransactionsList() {
  return (
    <SoftCard hoverable={false} className="flex flex-col">
      <SoftCardHeader>
        <div className="p-2 rounded-xl bg-primary/10">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <SoftCardTitle>Last 5 Transactions</SoftCardTitle>
      </SoftCardHeader>
      <SoftCardContent>
        <motion.div
          className="space-y-3 h-[250px] overflow-y-scroll pr-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              variants={itemVariants}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border/30"
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
                    transaction.type === "income"
                      ? "bg-success/10"
                      : "bg-destructive/10"
                  )}
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-destructive" />
                  )}
                </motion.div>
                <div>
                  <p className="font-medium text-sm text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.studentName} • {new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              <motion.span
                className={cn(
                  "font-bold text-base",
                  transaction.type === "income" ? "text-success" : "text-destructive"
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
              >
                {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString('en-IN')}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </SoftCardContent>
    </SoftCard>
  );
}

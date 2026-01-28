import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface EMIProgressBarProps {
  feeOffered: number;
  downPayment: number;
  totalPaid: number;
}

export function EMIProgressBar({ feeOffered, downPayment, totalPaid }: EMIProgressBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const totalPending = feeOffered - totalPaid;
  const paidPercentage = (totalPaid / feeOffered) * 100;
  const pendingPercentage = 100 - paidPercentage;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Payment Progress
        </span>
        <motion.span
          className="font-semibold text-foreground"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
        >
          {paidPercentage.toFixed(1)}% Complete
        </motion.span>
      </div>

      <motion.div
        className="relative h-10 rounded-full overflow-hidden bg-muted/30 cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
        style={{
          boxShadow: "inset 0 2px 8px hsl(var(--border) / 0.3)"
        }}
      >
        {/* Paid portion */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/70 flex items-center"
          initial={{ width: 0 }}
          animate={{ width: `${paidPercentage}%` }}
          transition={{ type: "spring" as const, stiffness: 100, damping: 20, delay: 0.3 }}
          style={{
            boxShadow: "4px 0 15px -3px hsl(var(--primary) / 0.5)"
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" as const, repeatDelay: 1 }}
          />
        </motion.div>

        {/* Pending portion indicator */}
        <motion.div
          className={cn(
            "absolute top-0 right-0 h-full bg-gradient-to-r from-warning/10 to-warning/20 rounded-r-full",
            "transition-opacity duration-200"
          )}
          style={{ width: `${pendingPercentage}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.3 }}
        />

        {/* Paid label */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: paidPercentage > 20 ? 1 : 0, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-sm font-bold text-primary-foreground drop-shadow-md">
            ₹{totalPaid.toLocaleString('en-IN')} Paid
          </span>
        </motion.div>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        className={cn(
          "grid grid-cols-2 gap-4 p-4 rounded-2xl bg-accent/50 border border-border/30",
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 300, damping: 25, delay: 0.4 }}
      >
        <motion.div
          className="space-y-1 p-3 rounded-xl bg-card"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          style={{
            boxShadow: "0 4px 8px hsl(var(--border) / 0.2)"
          }}
        >
          <p className="text-xs text-muted-foreground">Amount Paid</p>
          <motion.p
            className="text-2xl font-bold text-success"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          >
            ₹{totalPaid.toLocaleString('en-IN')}
          </motion.p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">{paidPercentage.toFixed(1)}%</span>
          </div>
        </motion.div>

        <motion.div
          className="space-y-1 p-3 rounded-xl bg-card"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          style={{
            boxShadow: "0 4px 8px hsl(var(--border) / 0.2)"
          }}
        >
          <p className="text-xs text-muted-foreground">Pending Amount</p>
          <motion.p
            className="text-2xl font-bold text-warning"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          >
            ₹{totalPending.toLocaleString('en-IN')}
          </motion.p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-warning/50" />
            <span className="text-xs text-muted-foreground">{pendingPercentage.toFixed(1)}%</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
  variant?: "default" | "primary" | "success";
  onClick?: () => void;
}

const variants = {
  default: "bg-card border border-border",
  primary: "bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground border-0",
  success: "bg-gradient-to-br from-success via-success/95 to-success/90 text-success-foreground border-0",
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  index = 0,
  variant = "default",
  onClick
}: StatsCardProps) {
  const isPrimary = variant !== "default";

  // Animated number counter
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    // Extract numeric value if it's a string
    const numericValue = typeof value === 'string'
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;

    if (!isNaN(numericValue)) {
      const animation = animate(count, numericValue, {
        duration: 1.5,
        delay: index * 0.1,
      });
      return animation.stop;
    }
  }, [value, index, count]);

  return (
    <motion.div
      className={cn(
        "rounded-2xl p-6 shadow-md relative overflow-hidden group",
        onClick && "cursor-pointer",
        variants[variant]
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.1
      }}
      whileHover={{
        scale: 1.03,
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      style={{
        boxShadow: isPrimary
          ? "0 10px 30px -5px hsl(var(--primary) / 0.3)"
          : undefined
      }}
    >
      {/* Animated gradient overlay on hover */}
      {isPrimary && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          initial={false}
        />
      )}

      {/* Shimmer effect removed for dark mode compatibility */}

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1 flex-1">
          <p className={cn(
            "text-xs font-medium uppercase tracking-wide",
            isPrimary ? "opacity-90" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <motion.p
            className="text-3xl font-bold tracking-tight tabular-nums"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: index * 0.1 + 0.2
            }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              isPrimary ? "opacity-80" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <motion.div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold mt-2",
                trend.isPositive
                  ? isPrimary ? "opacity-90" : "text-success"
                  : "text-destructive"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
            >
              <span>{trend.isPositive ? "↑" : "↓"} {trend.value}%</span>
              <span className={cn(
                "text-xs font-normal",
                isPrimary ? "opacity-70" : "text-muted-foreground"
              )}>from last month</span>
            </motion.div>
          )}
        </div>
        <motion.div
          className={cn(
            "p-3 rounded-xl",
            isPrimary
              ? "bg-primary-foreground/20"
              : "bg-primary/10"
          )}
          whileHover={{ scale: 1.15, rotate: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Icon className={cn(
            "w-6 h-6",
            isPrimary ? "text-primary-foreground" : "text-primary"
          )} />
        </motion.div>
      </div>
    </motion.div>
  );
}

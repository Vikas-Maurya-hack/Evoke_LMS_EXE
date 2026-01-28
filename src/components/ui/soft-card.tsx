import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface SoftCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const SoftCard = React.forwardRef<HTMLDivElement, SoftCardProps>(
  ({ className, children, hoverable = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl bg-card p-6",
          "shadow-lg",
          "border border-border/20",
          "transition-all duration-300",
          hoverable && "hover:shadow-xl",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        whileHover={hoverable ? { scale: 1.02, y: -4 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

SoftCard.displayName = "SoftCard";

const SoftCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 pb-4", className)}
    {...props}
  />
));
SoftCardHeader.displayName = "SoftCardHeader";

const SoftCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold text-foreground tracking-tight",
      className
    )}
    {...props}
  />
));
SoftCardTitle.displayName = "SoftCardTitle";

const SoftCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
SoftCardContent.displayName = "SoftCardContent";

export { SoftCard, SoftCardHeader, SoftCardTitle, SoftCardContent };

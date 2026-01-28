import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick?: () => void;
    isPopular?: boolean;
    delay?: number;
    layoutId?: string;
}

export function CourseCard({
    title,
    description,
    icon: Icon,
    onClick,
    isPopular = false,
    delay = 0,
    layoutId
}: CourseCardProps) {
    return (
        <motion.div
            layoutId={layoutId}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay
            }}
            whileHover={{
                scale: 1.03,
                y: -10,
                transition: { type: "spring", stiffness: 400, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer",
                "rounded-3xl p-8",
                "bg-gradient-to-br from-card/90 to-card/70",
                "backdrop-blur-xl",
                "border border-border/30",
                "overflow-hidden shadow-lg",
                isPopular && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
            )}
        >
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                initial={false}
            />

            {/* Shimmer effect on hover - removed for dark mode compatibility */}

            {/* Glow effect for popular courses */}
            {isPopular && (
                <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10"
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}

            {/* Popular Badge */}
            {isPopular && (
                <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: delay + 0.2 }}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-10"
                >
                    ✨ Popular
                </motion.div>
            )}

            {/* Icon */}
            <motion.div
                className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 w-fit relative overflow-hidden"
                whileHover={{ rotate: 15, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
                {/* Icon glow */}
                <motion.div
                    className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                />
                <Icon className="w-8 h-8 text-primary relative z-10" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10">
                <motion.h3
                    className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.1 }}
                >
                    {title}
                </motion.h3>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.15 }}
                >
                    {description}
                </motion.p>
            </div>

            {/* Hover arrow indicator */}
            <motion.div
                className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
                <div className="p-2 rounded-lg bg-primary/10">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </div>
            </motion.div>
        </motion.div>
    );
}

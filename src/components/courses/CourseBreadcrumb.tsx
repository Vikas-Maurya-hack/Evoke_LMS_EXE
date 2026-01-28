import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface CourseBreadcrumbProps {
    items: BreadcrumbItem[];
}

export function CourseBreadcrumb({ items }: CourseBreadcrumbProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 flex-wrap"
        >
            <motion.button
                onClick={items[0]?.onClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-sm font-medium text-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Home className="w-4 h-4" />
                <span>Courses</span>
            </motion.button>

            {items.slice(1).map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    {item.onClick ? (
                        <motion.button
                            onClick={item.onClick}
                            className="px-3 py-1.5 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-sm font-medium text-foreground"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {item.label}
                        </motion.button>
                    ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                            {item.label}
                        </span>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
}

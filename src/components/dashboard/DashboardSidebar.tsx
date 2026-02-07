import { motion, Variants } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  Settings,
  GraduationCap,
  TrendingUp,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Students", path: "/students" },
  { icon: BookOpen, label: "Courses", path: "/courses" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: TrendingUp, label: "Analytics", path: "/analytics" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

const bottomMenuItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

const sidebarVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

export function DashboardSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <motion.aside
      className="hidden lg:flex flex-col w-72 bg-card rounded-xl m-4 mr-0 px-6 py-4 border border-border/30"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div
        className="flex items-center mb-6"
        variants={itemVariants}
      >
        <Link to="/" className="flex items-center">
          <motion.img
            src="/evoke-sidebar-logo.png"
            alt="Evoke Eduglobal"
            className="h-14 w-auto object-contain"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
          />
        </Link>
      </motion.div>

      {/* Main Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <motion.div key={item.label} variants={itemVariants}>
              <Link to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"
                      layoutId="activeIndicator"
                      transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                    />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="pt-6 border-t border-border space-y-2">
        {bottomMenuItems.map((item) => (
          <motion.div key={item.label} variants={itemVariants}>
            <Link to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02, x: 8 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
}

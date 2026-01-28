import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Bell, Search, X, Users, BookOpen, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSearchContext } from "@/contexts/SearchContext";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export function DashboardHeader() {
  const navigate = useNavigate();
  const { searchableItems, addRecentSearch } = useSearchContext();
  const { query, setQuery, results, hasResults } = useSearch(searchableItems);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const showDropdown = isSearchFocused && (hasResults || query.length > 0);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsSearchFocused(false);
        break;
    }
  };

  const handleSelectResult = (result: typeof results[0]) => {
    addRecentSearch(query);

    if (result.type === "page" && result.path) {
      navigate(result.path);
    } else if (result.type === "student") {
      navigate("/students");
    } else if (result.type === "course") {
      navigate("/courses");
    }

    setQuery("");
    setIsSearchFocused(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "student":
        return Users;
      case "course":
        return BookOpen;
      case "page":
        return FileText;
      default:
        return FileText;
    }
  };

  return (
    <motion.header
      className="flex items-center justify-between gap-4 mb-4"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex-1">
        <h1 className="text-2xl font-bold text-foreground mb-0.5">Welcome back, Admin</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening with your students today.</p>
      </motion.div>

      <motion.div
        ref={searchRef}
        variants={itemVariants}
        className="hidden md:block relative"
      >
        <motion.div
          className={cn(
            "flex items-center gap-2 bg-card rounded-2xl px-4 py-2 border transition-all duration-300",
            isSearchFocused
              ? "border-primary shadow-lg ring-2 ring-primary/20"
              : "border-border/20 shadow-md"
          )}
          animate={{
            width: isSearchFocused ? 400 : 280,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search students, courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleKeyDown}
            className="border-0 bg-transparent focus-visible:ring-0 flex-1"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery("")}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {hasResults ? (
                <div className="max-h-96 overflow-y-auto scrollbar-custom">
                  {results.map((result, index) => {
                    const Icon = getResultIcon(result.type);
                    return (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          "w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left",
                          selectedIndex === index && "bg-accent"
                        )}
                      >
                        <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{result.name}</p>
                          {result.description && (
                            <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{result.type}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <motion.button
          className="relative p-3 rounded-lg bg-card border border-border/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full" />
        </motion.button>

        <motion.div
          className="flex items-center gap-3 p-2 pr-4 rounded-lg bg-card border border-border/30"
          whileHover={{ scale: 1.02 }}
        >
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">AD</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">John Admin</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}

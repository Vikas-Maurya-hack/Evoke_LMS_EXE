import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronDown, Layers } from "lucide-react";
import { courseData, Category, Course, CourseVariant } from "@/constants/courseData";
import { cn } from "@/lib/utils";

interface HierarchicalCoursePickerProps {
    value: string;
    onValueChange: (value: string) => void;
    error?: boolean;
    placeholder?: string;
}

type Step = "category" | "course" | "variant";

interface Selection {
    category?: Category;
    course?: Course;
}

export function HierarchicalCoursePicker({
    value,
    onValueChange,
    error,
    placeholder = "Select course..."
}: HierarchicalCoursePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>("category");
    const [selection, setSelection] = useState<Selection>({});
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const resetAndOpen = () => {
        setStep("category");
        setSelection({});
        setIsOpen(true);
    };

    const handleCategorySelect = (category: Category) => {
        setSelection({ category });
        if (category.courses && category.courses.length > 0) {
            setStep("course");
        }
    };

    const handleCourseSelect = (course: Course) => {
        setSelection(prev => ({ ...prev, course }));
        // If course has variants or boards, show them
        const hasSubOptions = (course.variants && course.variants.length > 0) || (course.boards && course.boards.length > 0);
        if (hasSubOptions) {
            setStep("variant");
        } else {
            // No sub-options, finalize with just category > course
            const path = `${selection.category?.name} > ${course.name}`;
            onValueChange(path);
            setIsOpen(false);
        }
    };

    const handleVariantSelect = (variantName: string) => {
        const path = `${selection.category?.name} > ${selection.course?.name} > ${variantName}`;
        onValueChange(path);
        setIsOpen(false);
    };

    const goBack = () => {
        if (step === "course") {
            setStep("category");
            setSelection({});
        } else if (step === "variant") {
            setStep("course");
            setSelection(prev => ({ category: prev.category }));
        }
    };

    // Determine sub-options for variant step
    const getSubOptions = (): { id: string; name: string; description?: string; isPopular?: boolean }[] => {
        if (!selection.course) return [];
        if (selection.course.variants && selection.course.variants.length > 0) {
            return selection.course.variants;
        }
        if (selection.course.boards && selection.course.boards.length > 0) {
            return selection.course.boards.map(b => ({ id: b.toLowerCase(), name: b }));
        }
        return [];
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => isOpen ? setIsOpen(false) : resetAndOpen()}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200",
                    "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    error && "border-destructive",
                    isOpen && "border-primary ring-2 ring-primary/20",
                    !value && "text-muted-foreground"
                )}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180 text-primary"
                )} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[100] mt-1.5 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
                    >
                        {/* Navigation header — only shown after first step */}
                        {step !== "category" && (
                            <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/50 border-b border-border/50 text-xs">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="p-0.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                {selection.category && (
                                    <span className="font-medium text-muted-foreground">
                                        {selection.category.name}
                                    </span>
                                )}
                                {selection.course && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                                        <span className="font-medium text-foreground">
                                            {selection.course.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Items */}
                        <div className="max-h-[220px] overflow-y-auto py-1">
                            <AnimatePresence mode="wait">
                                {/* Categories */}
                                {step === "category" && (
                                    <motion.div
                                        key="cat"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.12 }}
                                    >
                                        {courseData.map((category) => (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => handleCategorySelect(category)}
                                                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <category.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <div>
                                                        <span className="font-medium text-foreground">{category.name}</span>
                                                        <p className="text-[11px] text-muted-foreground leading-tight">{category.description}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Courses */}
                                {step === "course" && selection.category && (
                                    <motion.div
                                        key="crs"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.12 }}
                                    >
                                        {selection.category.courses?.map((course) => {
                                            const hasSubOptions = (course.variants && course.variants.length > 0) || (course.boards && course.boards.length > 0);
                                            return (
                                                <button
                                                    key={course.id}
                                                    type="button"
                                                    onClick={() => handleCourseSelect(course)}
                                                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left group"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <course.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        <div>
                                                            <span className="font-medium text-foreground">{course.name}</span>
                                                            <p className="text-[11px] text-muted-foreground leading-tight">{course.description}</p>
                                                        </div>
                                                    </div>
                                                    {hasSubOptions && (
                                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}

                                {/* Variants / Boards */}
                                {step === "variant" && selection.course && (
                                    <motion.div
                                        key="var"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.12 }}
                                    >
                                        {getSubOptions().map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleVariantSelect(opt.name)}
                                                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Layers className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium text-foreground">{opt.name}</span>
                                                            {opt.isPopular && (
                                                                <span className="text-[9px] font-bold uppercase px-1.5 py-px bg-primary/10 text-primary rounded">Popular</span>
                                                            )}
                                                        </div>
                                                        {opt.description && (
                                                            <p className="text-[11px] text-muted-foreground leading-tight">{opt.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, BookOpen } from "lucide-react";
import { CourseCard } from "./CourseCard";
import { CourseBreadcrumb } from "./CourseBreadcrumb";
import { courseData, deliveryModes, Category, Course, CourseVariant, DeliveryMode } from "@/constants/courseData";
import { SoftCard } from "@/components/ui/soft-card";

type NavigationStep = "category" | "course" | "variant" | "delivery";

interface NavigationState {
    step: NavigationStep;
    selectedCategory?: Category;
    selectedCourse?: Course;
    selectedVariant?: CourseVariant;
    selectedDelivery?: DeliveryMode;
}

export function CourseExplorer() {
    const [navState, setNavState] = useState<NavigationState>({
        step: "category"
    });

    const handleCategorySelect = (category: Category) => {
        setNavState({
            step: "course",
            selectedCategory: category
        });
    };

    const handleCourseSelect = (course: Course) => {
        setNavState({
            ...navState,
            step: "variant",
            selectedCourse: course
        });
    };

    const handleVariantSelect = (variant: CourseVariant) => {
        setNavState({
            ...navState,
            step: "delivery",
            selectedVariant: variant
        });
    };

    const handleDeliverySelect = (delivery: DeliveryMode) => {
        setNavState({
            ...navState,
            selectedDelivery: delivery
        });

        // Show success message
        alert(`Course Selected!\n\nCategory: ${navState.selectedCategory?.name}\nCourse: ${navState.selectedCourse?.name}\nVariant: ${navState.selectedVariant?.name}\nDelivery: ${delivery.name}`);
    };

    const resetToCategory = () => {
        setNavState({ step: "category" });
    };

    const goBackToCourse = () => {
        setNavState({
            step: "course",
            selectedCategory: navState.selectedCategory
        });
    };

    const goBackToVariant = () => {
        setNavState({
            step: "variant",
            selectedCategory: navState.selectedCategory,
            selectedCourse: navState.selectedCourse
        });
    };

    // Build breadcrumb items
    const breadcrumbItems = [
        { label: "Home", onClick: resetToCategory }
    ];

    if (navState.selectedCategory) {
        breadcrumbItems.push({
            label: navState.selectedCategory.name,
            onClick: navState.step !== "course" ? goBackToCourse : undefined
        });
    }

    if (navState.selectedCourse) {
        breadcrumbItems.push({
            label: navState.selectedCourse.name,
            onClick: navState.step === "delivery" ? goBackToVariant : undefined
        });
    }

    if (navState.selectedVariant) {
        breadcrumbItems.push({
            label: navState.selectedVariant.name,
            onClick: undefined
        });
    }

    return (
        <SoftCard className="col-span-full" hoverable={false}>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <motion.div
                        className="p-2 rounded-xl bg-primary/10"
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        <BookOpen className="w-5 h-5 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground">Course Explorer</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                    Discover and enroll in our comprehensive course offerings
                </p>
            </div>

            {navState.step !== "category" && <CourseBreadcrumb items={breadcrumbItems} />}

            <AnimatePresence mode="wait">
                {/* Step 1: Category Selection */}
                {navState.step === "category" && (
                    <motion.div
                        key="category"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {courseData.map((category, index) => (
                            <CourseCard
                                key={category.id}
                                layoutId={`category-${category.id}`}
                                title={category.name}
                                description={category.description}
                                icon={category.icon}
                                onClick={() => handleCategorySelect(category)}
                                delay={index * 0.1}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Step 2: Course Selection */}
                {navState.step === "course" && navState.selectedCategory && (
                    <motion.div
                        key="course"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {navState.selectedCategory.courses?.map((course, index) => (
                                <CourseCard
                                    key={course.id}
                                    layoutId={`course-${course.id}`}
                                    title={course.name}
                                    description={course.description}
                                    icon={course.icon}
                                    onClick={() => handleCourseSelect(course)}
                                    delay={index * 0.1}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Variant Selection */}
                {navState.step === "variant" && navState.selectedCourse && (
                    <motion.div
                        key="variant"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {navState.selectedCourse.variants?.map((variant, index) => (
                                <CourseCard
                                    key={variant.id}
                                    layoutId={`variant-${variant.id}`}
                                    title={variant.name}
                                    description={variant.description || ""}
                                    icon={navState.selectedCourse.icon}
                                    onClick={() => handleVariantSelect(variant)}
                                    isPopular={variant.isPopular}
                                    delay={index * 0.1}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Delivery Mode Selection */}
                {navState.step === "delivery" && (
                    <motion.div
                        key="delivery"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                                Choose Your Learning Mode
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {deliveryModes.map((mode, index) => (
                                    <motion.button
                                        key={mode.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleDeliverySelect(mode)}
                                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border border-border/30 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl text-left"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {mode.name}
                                            </h4>
                                            <Check className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {mode.description}
                                        </p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SoftCard>
    );
}

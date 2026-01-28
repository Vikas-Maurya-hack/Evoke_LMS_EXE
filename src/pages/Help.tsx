import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Search, ChevronDown } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Input } from "@/components/ui/input";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const faqs = [
    {
        question: "How do I enroll a new student?",
        answer: "Navigate to the Students page and click the 'Add New Student' button. Fill in the required information including name, email, and course selection. The student will receive an email with login credentials.",
    },
    {
        question: "How can I track student progress?",
        answer: "Go to the Students page and click on any student card to view their detailed profile. You'll see their course progress, completed modules, grades, and activity timeline.",
    },
    {
        question: "What payment methods are supported?",
        answer: "We support all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. Students can also set up installment plans for courses over ₹42,000.",
    },
    {
        question: "How do I create a new course?",
        answer: "Visit the Courses page and click 'Add Course'. You'll be guided through setting up the course structure, adding modules, uploading materials, and setting pricing.",
    },
    {
        question: "Can I export student data?",
        answer: "Yes! Go to the Students page, select the students you want to export, and click the 'Export' button. You can download data in CSV or PDF format.",
    },
    {
        question: "How do I customize notification settings?",
        answer: "Navigate to Settings > Notifications. You can toggle different notification types, set quiet hours, and choose your preferred notification channels (email, push, SMS).",
    },
];

const Help = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            <DashboardSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 lg:px-8 lg:pt-6 lg:pb-4">
                    <DashboardHeader />
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto scrollbar-custom"
                >
                    <motion.div variants={fadeInUp} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <motion.div
                                className="p-2 rounded-xl bg-primary/10"
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <HelpCircle className="w-5 h-5 text-primary" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
                        </div>
                        <p className="text-muted-foreground">Find answers to commonly asked questions</p>
                    </motion.div>

                    {/* Search */}
                    <motion.div variants={fadeInUp} className="mb-8">
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 py-6 rounded-2xl"
                            />
                        </div>
                    </motion.div>

                    {/* FAQ Accordion */}
                    <motion.div variants={fadeInUp} className="max-w-3xl space-y-3">
                        {filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-card rounded-2xl border border-border/30 overflow-hidden"
                            >
                                <motion.button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent transition-colors"
                                    whileHover={{ x: 4 }}
                                >
                                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    </motion.div>
                                </motion.button>

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 text-muted-foreground border-t border-border/30 pt-4">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>

                    {filteredFaqs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default Help;

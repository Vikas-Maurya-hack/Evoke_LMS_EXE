import { BookOpen, GraduationCap, TrendingUp, BarChart3, Award, LucideIcon } from "lucide-react";

export interface DeliveryMode {
    id: string;
    name: string;
    description: string;
}

export interface CourseVariant {
    id: string;
    name: string;
    description?: string;
    isPopular?: boolean;
}

export interface Course {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    variants?: CourseVariant[];
    boards?: string[];
}

export interface Category {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    courses?: Course[];
    levels?: string[];
}

export const deliveryModes: DeliveryMode[] = [
    {
        id: "live-rec",
        name: "Live + Rec",
        description: "Live classes with recordings"
    },
    {
        id: "recording-only",
        name: "Recording Only",
        description: "Pre-recorded video lectures"
    },
    {
        id: "offline",
        name: "Offline",
        description: "In-person classroom sessions"
    }
];

export const courseData: Category[] = [
    {
        id: "academic",
        name: "Academic",
        icon: GraduationCap,
        description: "School & Board Exam Preparation",
        levels: ["11th & 12th Grade"],
        courses: [
            {
                id: "hsc",
                name: "HSC",
                icon: BookOpen,
                description: "Maharashtra State Board",
                boards: ["Science", "Commerce", "Arts"]
            },
            {
                id: "cbse",
                name: "CBSE",
                icon: BookOpen,
                description: "Central Board of Secondary Education",
                boards: ["Science", "Commerce", "Arts"]
            },
            {
                id: "icse",
                name: "ICSE",
                icon: BookOpen,
                description: "Indian Certificate of Secondary Education",
                boards: ["Science", "Commerce", "Arts"]
            }
        ]
    },
    {
        id: "professional",
        name: "Professional",
        icon: Award,
        description: "Professional Certification Courses",
        courses: [
            {
                id: "acca",
                name: "ACCA",
                icon: TrendingUp,
                description: "Association of Chartered Certified Accountants",
                variants: [
                    {
                        id: "acca-basic",
                        name: "Basic",
                        description: "Foundation level ACCA"
                    },
                    {
                        id: "acca-advance",
                        name: "Advance",
                        description: "Advanced level ACCA"
                    },
                    {
                        id: "acca-subject",
                        name: "Subject-wise",
                        description: "Individual subject courses"
                    }
                ]
            },
            {
                id: "cma-us",
                name: "CMA-US",
                icon: BarChart3,
                description: "Certified Management Accountant (USA)",
                variants: [
                    {
                        id: "cma-combo",
                        name: "Combo",
                        description: "Complete CMA package"
                    },
                    {
                        id: "cma-partwise",
                        name: "Part-wise",
                        description: "Individual parts",
                        isPopular: true
                    }
                ]
            },
            {
                id: "cfa",
                name: "CFA",
                icon: Award,
                description: "Chartered Financial Analyst",
                variants: [
                    {
                        id: "cfa-combo",
                        name: "Combo",
                        description: "All levels combined"
                    },
                    {
                        id: "cfa-levelwise",
                        name: "Level-wise",
                        description: "Individual level courses"
                    }
                ]
            }
        ]
    }
];

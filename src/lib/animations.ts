import { Variants } from "framer-motion";

// Spring configurations for consistent animations
export const spring = {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
};

export const smoothSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
};

export const bouncySpring = {
    type: "spring" as const,
    stiffness: 500,
    damping: 20,
};

// Easing functions
export const easing = {
    smooth: [0.43, 0.13, 0.23, 0.96],
    easeOut: [0.16, 1, 0.3, 1],
    easeIn: [0.7, 0, 0.84, 0],
    easeInOut: [0.87, 0, 0.13, 1],
};

// Common animation variants
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: easing.smooth }
    },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: smoothSpring
    },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: smoothSpring
    },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: spring
    },
};

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: smoothSpring
    },
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: smoothSpring
    },
};

// Stagger container variants
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

export const fastStaggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
};

// Hover and tap animations
export const hoverScale = {
    scale: 1.05,
    transition: spring,
};

export const hoverLift = {
    y: -8,
    scale: 1.03,
    transition: spring,
};

export const tapScale = {
    scale: 0.95,
    transition: { duration: 0.1 },
};

// Page transition variants
export const pageTransition: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: smoothSpring
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: { duration: 0.2 }
    },
};

// Modal/Dialog variants
export const modalBackdrop: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    },
};

export const modalContent: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: spring
    },
};

// Utility function for stagger delays
export const getStaggerDelay = (index: number, baseDelay = 0.05) => {
    return index * baseDelay;
};

// Shimmer effect keyframes (for use with CSS)
export const shimmerKeyframes = {
    "0%": { backgroundPosition: "-1000px 0" },
    "100%": { backgroundPosition: "1000px 0" },
};

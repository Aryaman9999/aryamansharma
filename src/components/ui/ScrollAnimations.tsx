import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

// Fade in up with physics-based damping
interface FadeInUpProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
}

export const FadeInUp = ({
    children,
    delay = 0,
    duration = 0.6,
    className = '',
    once = true
}: FadeInUpProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

// Staggered children animation
interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
    once?: boolean;
}

export const StaggerContainer = ({
    children,
    className = '',
    staggerDelay = 0.1,
    once = true
}: StaggerContainerProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
};

// Child element for stagger container
interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: {
                    opacity: 0,
                    y: 40,
                    scale: 0.95
                },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        duration: 0.5,
                        ease: [0.25, 0.4, 0.25, 1]
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
};

// Parallax scroll effect
interface ParallaxProps {
    children: ReactNode;
    className?: string;
    speed?: number;
    direction?: 'up' | 'down';
}

export const Parallax = ({
    children,
    className = '',
    speed = 0.5,
    direction = 'up'
}: ParallaxProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    const y = useTransform(
        scrollYProgress,
        [0, 1],
        direction === 'up' ? [100 * speed, -100 * speed] : [-100 * speed, 100 * speed]
    );

    const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ y: smoothY }}
        >
            {children}
        </motion.div>
    );
};

// Scale on scroll
interface ScaleOnScrollProps {
    children: ReactNode;
    className?: string;
    scaleRange?: [number, number];
}

export const ScaleOnScroll = ({
    children,
    className = '',
    scaleRange = [0.8, 1]
}: ScaleOnScrollProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'center center']
    });

    const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
    const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ scale: smoothScale }}
        >
            {children}
        </motion.div>
    );
};

// Reveal from direction
interface RevealProps {
    children: ReactNode;
    className?: string;
    direction?: 'left' | 'right' | 'up' | 'down';
    delay?: number;
    once?: boolean;
}

export const Reveal = ({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    once = true
}: RevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-100px' });

    const getInitial = () => {
        switch (direction) {
            case 'left': return { opacity: 0, x: -100 };
            case 'right': return { opacity: 0, x: 100 };
            case 'up': return { opacity: 0, y: 100 };
            case 'down': return { opacity: 0, y: -100 };
        }
    };

    const getAnimate = () => {
        switch (direction) {
            case 'left':
            case 'right': return { opacity: 1, x: 0 };
            case 'up':
            case 'down': return { opacity: 1, y: 0 };
        }
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={getInitial()}
            animate={isInView ? getAnimate() : getInitial()}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.4, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

// Floating animation
interface FloatingProps {
    children: ReactNode;
    className?: string;
    amplitude?: number;
    duration?: number;
}

export const Floating = ({
    children,
    className = '',
    amplitude = 10,
    duration = 3
}: FloatingProps) => {
    return (
        <motion.div
            className={className}
            animate={{
                y: [0, -amplitude, 0]
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        >
            {children}
        </motion.div>
    );
};

// Rotate on scroll
interface RotateOnScrollProps {
    children: ReactNode;
    className?: string;
    rotateRange?: [number, number];
}

export const RotateOnScroll = ({
    children,
    className = '',
    rotateRange = [0, 360]
}: RotateOnScrollProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);
    const smoothRotate = useSpring(rotate, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ rotate: smoothRotate }}
        >
            {children}
        </motion.div>
    );
};

// Page transition wrapper
interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            {children}
        </motion.div>
    );
};

export default FadeInUp;

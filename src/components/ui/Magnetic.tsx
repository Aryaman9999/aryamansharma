import { useRef, useCallback, memo } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

// Magnetic wrapper for elements - separated for better code splitting
interface MagneticProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export const Magnetic = memo(({ children, className = '', strength = 0.25 }: MagneticProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 200, damping: 20 });
    const springY = useSpring(y, { stiffness: 200, damping: 20 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        x.set((e.clientX - centerX) * strength);
        y.set((e.clientY - centerY) * strength);
    }, [strength, x, y]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    return (
        <motion.div
            ref={ref}
            className={className}
            data-magnetic
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
        >
            {children}
        </motion.div>
    );
});

Magnetic.displayName = 'Magnetic';

export default Magnetic;

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface MagneticCursorProps {
    children?: React.ReactNode;
}

export const MagneticCursor = memo(({ children }: MagneticCursorProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Reduced spring calculations for performance
    const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    // Throttle ref for mouse moves
    const lastMoveTime = useRef(0);

    useEffect(() => {
        // Throttled mouse move handler - 60fps max
        const handleMouseMove = (e: MouseEvent) => {
            const now = performance.now();
            if (now - lastMoveTime.current < 16) return; // ~60fps throttle
            lastMoveTime.current = now;

            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        // Simplified hover detection
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const magneticEl = target.closest('[data-magnetic]');
            setIsHovering(!!magneticEl);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener('mouseover', handleMouseOver, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY, isVisible]);

    // Don't render on touch devices
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
        return <>{children}</>;
    }

    return (
        <>
            {children}

            {/* Simplified cursor - single element for performance */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    opacity: isVisible ? 1 : 0,
                }}
            >
                <motion.div
                    className="w-8 h-8 border border-white rounded-full"
                    style={{ transform: 'translate(-50%, -50%)' }}
                    animate={{
                        scale: isHovering ? 1.8 : 1,
                        borderWidth: isHovering ? '2px' : '1px'
                    }}
                    transition={{ duration: 0.15 }}
                />
                {!isHovering && (
                    <motion.div
                        className="absolute w-1.5 h-1.5 bg-white rounded-full"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                )}
            </motion.div>
        </>
    );
});

MagneticCursor.displayName = 'MagneticCursor';

// Magnetic wrapper for elements - simplified
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

export default MagneticCursor;

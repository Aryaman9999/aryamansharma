import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface MagneticCursorProps {
    children?: React.ReactNode;
}

export const MagneticCursor = ({ children }: MagneticCursorProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [cursorText, setCursorText] = useState('');

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const trailX = useMotionValue(-100);
    const trailY = useMotionValue(-100);

    // Smooth springs for trailing effect
    const springConfig = { damping: 25, stiffness: 200 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);
    const trailXSpring = useSpring(trailX, { damping: 40, stiffness: 150 });
    const trailYSpring = useSpring(trailY, { damping: 40, stiffness: 150 });

    // Trail particles
    const [trails, setTrails] = useState<{ x: number; y: number; id: number }[]>([]);
    const trailIdRef = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            trailX.set(e.clientX);
            trailY.set(e.clientY);
            setIsVisible(true);

            // Add trail particle occasionally
            if (Math.random() > 0.7) {
                const id = trailIdRef.current++;
                setTrails(prev => [...prev.slice(-8), { x: e.clientX, y: e.clientY, id }]);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        const handleMouseEnter = () => {
            setIsVisible(true);
        };

        // Check for magnetic elements
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const magneticEl = target.closest('[data-magnetic]');
            const cursorTextEl = target.closest('[data-cursor-text]');

            if (magneticEl) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }

            if (cursorTextEl) {
                setCursorText(cursorTextEl.getAttribute('data-cursor-text') || '');
            } else {
                setCursorText('');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY, trailX, trailY]);

    // Clean up old trails
    useEffect(() => {
        const cleanup = setInterval(() => {
            setTrails(prev => prev.slice(-5));
        }, 100);
        return () => clearInterval(cleanup);
    }, []);

    // Don't render on touch devices
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
        return <>{children}</>;
    }

    return (
        <>
            {children}

            {/* Main cursor */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                }}
            >
                <motion.div
                    className="relative flex items-center justify-center"
                    animate={{
                        scale: isHovering ? 2 : 1,
                        opacity: isVisible ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Outer ring */}
                    <motion.div
                        className="absolute w-8 h-8 border border-white rounded-full"
                        style={{
                            transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                            scale: isHovering ? 1.5 : 1,
                            borderWidth: isHovering ? '2px' : '1px'
                        }}
                    />

                    {/* Inner dot */}
                    <motion.div
                        className="absolute w-1.5 h-1.5 bg-white rounded-full"
                        style={{
                            transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                            scale: isHovering ? 0 : 1
                        }}
                    />

                    {/* Cursor text */}
                    {cursorText && (
                        <motion.span
                            className="absolute text-xs font-medium text-white whitespace-nowrap"
                            style={{
                                transform: 'translate(-50%, -50%)'
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            {cursorText}
                        </motion.span>
                    )}
                </motion.div>
            </motion.div>

            {/* Trailing ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9998]"
                style={{
                    x: trailXSpring,
                    y: trailYSpring,
                }}
            >
                <motion.div
                    className="w-10 h-10 border border-primary/30 rounded-full"
                    style={{
                        transform: 'translate(-50%, -50%)'
                    }}
                    animate={{
                        scale: isHovering ? 0 : 1,
                        opacity: isVisible ? 0.5 : 0
                    }}
                />
            </motion.div>

            {/* Trail particles */}
            {trails.map((trail, index) => (
                <motion.div
                    key={trail.id}
                    className="fixed top-0 left-0 pointer-events-none z-[9997]"
                    initial={{
                        x: trail.x,
                        y: trail.y,
                        scale: 1,
                        opacity: 0.4
                    }}
                    animate={{
                        scale: 0,
                        opacity: 0
                    }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut'
                    }}
                >
                    <div
                        className="w-2 h-2 bg-primary/40 rounded-full"
                        style={{
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                </motion.div>
            ))}
        </>
    );
};

// Magnetic wrapper for elements
interface MagneticProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export const Magnetic = ({ children, className = '', strength = 0.3 }: MagneticProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        setPosition({ x: deltaX, y: deltaY });
    }, [strength]);

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            data-magnetic
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
            {children}
        </motion.div>
    );
};

export default MagneticCursor;

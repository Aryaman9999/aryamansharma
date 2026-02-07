import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
    intensity?: 'low' | 'medium' | 'high';
    tiltAmount?: number;
    onClick?: () => void;
}

export const GlassCard = ({
    children,
    className = '',
    glowColor = '#6366f1',
    intensity = 'medium',
    tiltAmount = 15,
    onClick
}: GlassCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Motion values for smooth mouse tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animations
    const springConfig = { stiffness: 150, damping: 20 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);

    // Shine effect position
    const shineX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
    const shineY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
    };

    // Intensity-based styles
    const intensityStyles = {
        low: {
            blur: 'backdrop-blur-sm',
            bg: 'bg-white/5',
            border: 'border-white/10'
        },
        medium: {
            blur: 'backdrop-blur-md',
            bg: 'bg-white/10',
            border: 'border-white/20'
        },
        high: {
            blur: 'backdrop-blur-lg',
            bg: 'bg-white/15',
            border: 'border-white/30'
        }
    };

    const styles = intensityStyles[intensity];

    return (
        <motion.div
            ref={cardRef}
            className={`
        relative overflow-hidden rounded-xl
        ${styles.blur} ${styles.bg}
        border ${styles.border}
        transition-shadow duration-300
        ${isHovered ? 'shadow-lg' : 'shadow-md'}
        ${className}
      `}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                boxShadow: isHovered
                    ? `0 0 30px ${glowColor}33, 0 0 60px ${glowColor}1a`
                    : `0 4px 20px rgba(0,0,0,0.2)`
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Glowing border effect */}
            <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${glowColor}00, ${glowColor}40, ${glowColor}00)`,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />

            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at ${shineX.get()}% ${shineY.get()}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
                    opacity: isHovered ? 0.8 : 0
                }}
            />

            {/* Border glow on hover */}
            <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{
                    boxShadow: isHovered
                        ? `inset 0 0 0 1px ${glowColor}80`
                        : 'inset 0 0 0 1px transparent'
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;

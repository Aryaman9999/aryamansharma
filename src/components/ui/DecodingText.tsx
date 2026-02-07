import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface DecodingTextProps {
    text: string;
    className?: string;
    duration?: number;
    delay?: number;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    triggerOnView?: boolean;
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const DecodingText = ({
    text,
    className = '',
    duration = 800, // Faster default
    delay = 0,
    as: Tag = 'span',
    triggerOnView = true,
}: DecodingTextProps) => {
    const [displayText, setDisplayText] = useState(text); // Start with full text to prevent layout shift
    const [isDecoding, setIsDecoding] = useState(false);
    const [hasDecoded, setHasDecoded] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Memoize the final text to prevent unnecessary re-renders
    const finalText = useMemo(() => text, [text]);

    useEffect(() => {
        // Set display text immediately to prevent layout shift
        setDisplayText(finalText);

        if (!triggerOnView) {
            timeoutRef.current = setTimeout(() => {
                startDecoding();
            }, delay);
            return () => clearTimeout(timeoutRef.current);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasDecoded && !isDecoding) {
                        timeoutRef.current = setTimeout(() => {
                            startDecoding();
                        }, delay);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [triggerOnView, delay, hasDecoded, finalText]);

    const startDecoding = () => {
        if (isDecoding || hasDecoded) return;

        setIsDecoding(true);

        const textLength = finalText.length;
        const intervalTime = Math.min(30, duration / (textLength * 2)); // Faster for longer text
        let frame = 0;
        const maxFrames = Math.min(textLength * 2, 40); // Cap iterations for long text

        const interval = setInterval(() => {
            const progress = frame / maxFrames;

            const newText = finalText
                .split('')
                .map((char, index) => {
                    // Determine if this character should be revealed
                    const charProgress = index / textLength;

                    if (progress >= charProgress) {
                        return char; // Reveal the actual character
                    }

                    // Keep spaces as spaces
                    if (char === ' ') return ' ';

                    // Random scramble character
                    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
                })
                .join('');

            setDisplayText(newText);
            frame++;

            if (frame >= maxFrames) {
                clearInterval(interval);
                setDisplayText(finalText);
                setIsDecoding(false);
                setHasDecoded(true);
            }
        }, intervalTime);

        return () => clearInterval(interval);
    };

    return (
        <Tag
            ref={containerRef as any}
            className={className}
            style={{ display: 'inline' }}
        >
            {displayText}
        </Tag>
    );
};

// Simple fade-in reveal for subtitles/descriptions
interface FadeRevealProps {
    text: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    delay?: number;
}

export const FadeReveal = ({
    text,
    className = '',
    as: Tag = 'span',
    delay = 0
}: FadeRevealProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => setIsVisible(true), delay);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    return (
        <Tag ref={containerRef as any} className={className}>
            <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {text}
            </motion.span>
        </Tag>
    );
};

// Staggered reveal variant - each word animates in sequence
interface StaggeredRevealProps {
    text: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    delay?: number;
}

export const StaggeredReveal = ({
    text,
    className = '',
    as: Tag = 'span',
    delay = 0
}: StaggeredRevealProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => setIsVisible(true), delay);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    const words = text.split(' ');

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const wordVariants = {
        hidden: {
            opacity: 0,
            y: 10
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1] as const
            }
        }
    };

    return (
        <Tag ref={containerRef as any} className={className}>
            <motion.span
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={containerVariants}
                className="inline-flex flex-wrap"
            >
                {words.map((word, index) => (
                    <motion.span
                        key={index}
                        variants={wordVariants}
                        className="inline-block mr-[0.25em]"
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.span>
        </Tag>
    );
};

export default DecodingText;

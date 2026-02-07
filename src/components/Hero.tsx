import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Cpu, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { HeroScene } from "@/components/3d/Scene";
import { DecodingText } from "@/components/ui/DecodingText";
import { Magnetic } from "@/components/ui/MagneticCursor";
import { FadeInUp, Parallax } from "@/components/ui/ScrollAnimations";

const Hero = () => {
    const [content, setContent] = useState(() => {
        const cached = localStorage.getItem("hero_content");
        return cached ? JSON.parse(cached) : {
            title: "",
            description: "",
            button_primary_text: "View My Work",
            button_secondary_text: "About Me",
            image_url: ""
        };
    });

    const [resumeUrl, setResumeUrl] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadContent();
        // Trigger loaded state after mount
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const loadContent = async () => {
        const { data } = await supabase
            .from("hero_content")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (data) {
            if (JSON.stringify(data) !== JSON.stringify(content)) {
                setContent(data);
                localStorage.setItem("hero_content", JSON.stringify(data));
            }
        }

        const { data: resumeSetting } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "resume_url")
            .maybeSingle();

        if (resumeSetting) setResumeUrl(resumeSetting.value);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    // Parse title for highlighted text
    const renderTitle = () => {
        if (!content.title) return null;

        const parts = content.title.split(/(\*\*[^*]+\*\*)/);
        return parts.map((part: string, i: number) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const text = part.slice(2, -2);
                return (
                    <span key={i} className="gradient-text text-glow">
                        {text}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.4, 0.25, 1] as const
            }
        }
    };

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden"
        >
            {/* 3D Background Scene */}
            <HeroScene />

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background pointer-events-none" />

            {/* Decorative circuit lines */}
            <div className="absolute inset-0 circuit-decoration opacity-20 pointer-events-none" />

            {/* Content */}
            <motion.div
                className="container relative z-10 mx-auto max-w-6xl"
                variants={containerVariants}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
            >
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Text Content */}
                    <motion.div
                        className="flex-1 text-center lg:text-left"
                        variants={itemVariants}
                    >
                        {/* Main Title with Decoding Effect */}
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight"
                            variants={itemVariants}
                        >
                            {content.title ? (
                                <DecodingText
                                    text={content.title.replace(/\*\*/g, '')}
                                    duration={600}
                                    as="span"
                                />
                            ) : (
                                <span className="opacity-0">Loading</span>
                            )}
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                            variants={itemVariants}
                        >
                            {content.description}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            variants={itemVariants}
                        >
                            <Magnetic>
                                <Button
                                    onClick={() => scrollToSection('work')}
                                    size="lg"
                                    className="gap-2 btn-glow glow text-base px-8"
                                    data-magnetic
                                >
                                    {content.button_primary_text}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Magnetic>

                            <Magnetic>
                                <Button
                                    onClick={() => scrollToSection('about')}
                                    variant="outline"
                                    size="lg"
                                    className="bg-background/80 border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 text-foreground text-base px-8 backdrop-blur-sm"
                                    data-magnetic
                                >
                                    {content.button_secondary_text}
                                </Button>
                            </Magnetic>

                            {resumeUrl && (
                                <Magnetic>
                                    <Button
                                        onClick={() => window.open(resumeUrl, '_blank')}
                                        variant="outline"
                                        size="lg"
                                        className="gap-2 bg-background/80 border-2 border-secondary/50 hover:bg-secondary/10 hover:border-secondary/70 text-foreground text-base px-8 backdrop-blur-sm"
                                        data-magnetic
                                    >
                                        <Download className="w-4 h-4" />
                                        Resume
                                    </Button>
                                </Magnetic>
                            )}
                        </motion.div>

                    </motion.div>

                    {/* Visual Element - The 3D chip is now in the background via HeroScene */}
                    {/* Optional: Add a decorative element or profile image here */}
                    <motion.div
                        className="flex-shrink-0 hidden lg:block"
                        variants={itemVariants}
                    >
                        <Parallax speed={0.2}>
                            <div className="relative w-80 h-80">
                                {/* Glowing orb effect */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" />

                                {/* Profile image with glass effect */}
                                {content.image_url && (
                                    <div className="relative w-full h-full rounded-full glass-strong overflow-hidden border-2 border-primary/30">
                                        <img
                                            src={content.image_url}
                                            alt="Aryaman"
                                            className="w-full h-full object-cover"
                                            loading="eager"
                                        />
                                        {/* Overlay glow */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                                    </div>
                                )}

                                {/* Floating badges around the image */}
                                <motion.div
                                    className="absolute -top-4 -right-4 p-3 rounded-xl glass border border-primary/30"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Cpu className="w-6 h-6 text-primary" />
                                </motion.div>

                                <motion.div
                                    className="absolute -bottom-4 -left-4 p-3 rounded-xl glass border border-secondary/30"
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <Sparkles className="w-6 h-6 text-secondary" />
                                </motion.div>
                            </div>
                        </Parallax>
                    </motion.div>

                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
            >
                <motion.div
                    className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <motion.div
                        className="w-1.5 h-3 rounded-full bg-primary"
                        animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FadeInUp, Reveal } from "@/components/ui/ScrollAnimations";
import { DecodingText } from "@/components/ui/DecodingText";
import { User } from "lucide-react";

const About = () => {
  const [content, setContent] = useState({
    title: "",
    subtitle: "",
    content: "",
    image_url: ""
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from("about_content")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) setContent(data);
  };

  const paragraphs = content.content.split('\n').filter(p => p.trim());

  return (
    <section id="about" className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/5 via-background to-muted/5 pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Image Section - Simple and Clean */}
          <Reveal direction="left" className="flex-shrink-0">
            <div className="w-64 lg:w-80 aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
              {content.image_url ? (
                <img
                  src={content.image_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                  <User className="w-20 h-20 opacity-50" />
                </div>
              )}
            </div>
          </Reveal>

          {/* Content Section */}
          <div className="flex-1">
            <FadeInUp>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm text-muted-foreground">About Me</span>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {content.title || (
                  <DecodingText text="About Me" duration={600} />
                )}
              </h2>
            </FadeInUp>

            {content.subtitle && (
              <FadeInUp delay={0.2}>
                <p className="text-xl text-primary mb-8 font-medium">
                  {content.subtitle}
                </p>
              </FadeInUp>
            )}

            <FadeInUp delay={0.3}>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                {paragraphs.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="text-base md:text-lg"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </FadeInUp>

            {/* Skills or highlights */}
            <FadeInUp delay={0.4}>
              <div className="flex flex-wrap gap-3 mt-10">
                {['AI/ML', 'VLSI', 'Embedded Systems', 'Full-Stack', 'Hardware Design'].map((skill, i) => (
                  <motion.span
                    key={skill}
                    className="px-4 py-2 rounded-full glass border border-primary/20 text-sm font-medium text-foreground"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                    whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary))' }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

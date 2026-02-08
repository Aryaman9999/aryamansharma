import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Briefcase, Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/ui/ScrollAnimations";
import { DecodingText } from "@/components/ui/DecodingText";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/ui/Magnetic";

const Career = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadExperiences();
    loadResumeUrl();
  }, []);

  const loadExperiences = async () => {
    const { data } = await supabase
      .from("experiences")
      .select("*")
      .order("display_order");
    if (data) setExperiences(data);
  };

  const loadResumeUrl = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "resume_url")
      .maybeSingle();
    if (data) setResumeUrl(data.value);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="career" className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      {/* Decorative circuit lines */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

      <div className="container relative z-10 mx-auto max-w-4xl">
        {/* Section Header */}
        <FadeInUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Experience</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <DecodingText text="Career & Experience" duration={1500} glitchIntensity="medium" />
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A journey through technology, innovation, and continuous learning
          </p>
        </FadeInUp>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50 transform md:-translate-x-px" />

          <StaggerContainer className="space-y-8">
            {experiences.map((exp, index) => (
              <StaggerItem key={exp.id}>
                <div className={`relative flex items-start gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline node */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary glow transform -translate-x-1/2 mt-8 z-10">
                    <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Content Card */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-8">
                    <GlassCard
                      className="overflow-hidden"
                      glowColor={index % 2 === 0 ? "#6366f1" : "#06b6d4"}
                      intensity="medium"
                    >
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => toggleExpand(exp.id)}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {exp.company}
                            </h3>
                            <p className="text-primary font-medium">{exp.role}</p>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedId === exp.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          </motion.div>
                        </div>

                        {/* Period */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>{exp.period}</span>
                        </div>

                        {/* Expandable content */}
                        <AnimatePresence>
                          {expandedId === exp.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 border-t border-border/50">
                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                  <ReactMarkdown>{exp.contributions}</ReactMarkdown>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Preview text when collapsed */}
                        {expandedId !== exp.id && exp.contributions && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {exp.contributions.replace(/[*#-]/g, '').substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Download Resume CTA */}
        {resumeUrl && (
          <FadeInUp className="text-center mt-16">
            <Magnetic>
              <Button
                onClick={() => window.open(resumeUrl, '_blank')}
                size="lg"
                className="gap-3 btn-glow glow text-base px-8"
                data-magnetic
              >
                <Download className="w-5 h-5" />
                Download My Full Resume
              </Button>
            </Magnetic>
          </FadeInUp>
        )}
      </div>
    </section>
  );
};

export default Career;

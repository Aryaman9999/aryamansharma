import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Github, Send, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/ui/ScrollAnimations";
import { DecodingText } from "@/components/ui/DecodingText";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/ui/Magnetic";

const Contact = () => {
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .order("created_at");
    if (data) setSocialLinks(data);
  };

  const getLink = (platform: string) =>
    socialLinks.find((l) => l.platform.toLowerCase() === platform.toLowerCase());

  const email = getLink("email");
  const linkedin = getLink("linkedin");
  const github = getLink("github");

  const contactMethods = [
    {
      platform: email,
      icon: Mail,
      label: "Send me an Email",
      color: "#6366f1",
      description: "For inquiries and collaboration"
    },
    {
      platform: linkedin,
      icon: Linkedin,
      label: "Connect on LinkedIn",
      color: "#0077b5",
      description: "Let's connect professionally"
    },
    {
      platform: github,
      icon: Github,
      label: "See My Code on GitHub",
      color: "#06b6d4",
      description: "Check out my open source work"
    },
  ].filter(item => item.platform);

  return (
    <section id="contact" className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-1/3 h-1/2 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl text-center">
        {/* Header */}
        <FadeInUp>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/20 mb-8"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">Available for opportunities</span>
          </motion.div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            <DecodingText text="Let's Build Together" duration={1500} glitchIntensity="medium" />
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <p className="text-lg md:text-xl text-muted-foreground mb-16 leading-relaxed max-w-2xl mx-auto">
            I'm always open to discussing new ideas, challenging projects, or asymmetric opportunities.
            Whether you're a founder, a recruiter, or just a curious mind — let's connect.
          </p>
        </FadeInUp>

        {/* Contact Cards */}
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {contactMethods.map(({ platform, icon: Icon, label, color, description }, index) => (
            <StaggerItem key={platform.platform}>
              <GlassCard
                className="p-6 text-center h-full"
                glowColor={color}
                intensity="medium"
                tiltAmount={8}
                onClick={() => window.open(platform.url, '_blank')}
              >
                <motion.div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                    border: `1px solid ${color}40`
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Icon className="w-7 h-7" style={{ color }} />
                </motion.div>

                <h3 className="font-semibold text-foreground mb-2">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Primary CTA */}
        {email && (
          <FadeInUp delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="gap-3 btn-glow glow text-base px-10"
                  data-magnetic
                >
                  <a href={email.url} target="_blank" rel="noopener noreferrer">
                    <Send className="w-5 h-5" />
                    Get in Touch
                  </a>
                </Button>
              </Magnetic>
            </div>
          </FadeInUp>
        )}

        {/* Additional info */}
        <FadeInUp delay={0.5}>
          <motion.p
            className="mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Response time: Usually within 24-48 hours
          </motion.p>
        </FadeInUp>
      </div>
    </section>
  );
};

export default Contact;

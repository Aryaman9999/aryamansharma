import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Cpu, Heart } from "lucide-react";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16 px-6 border-t border-border/30 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container relative z-10 mx-auto max-w-5xl">
        <FadeInUp>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo & Copyright */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <motion.button
                onClick={scrollToTop}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold">Aryaman Sharma</span>
              </motion.button>

              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {currentYear} All rights reserved.
              </p>
            </div>

            {/* Tagline */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="w-4 h-4 text-destructive fill-destructive" />
              </motion.div>
              <span>and lots of</span>
              <span className="gradient-text font-medium">coffee</span>
            </div>

            {/* Navigation & Social */}
            <div className="flex flex-col items-center md:items-end gap-4">
              {/* Quick links */}
              <div className="flex gap-6 text-sm text-muted-foreground">
                {['Work', 'About', 'Contact'].map((link) => (
                  <motion.button
                    key={link}
                    onClick={() => {
                      const element = document.getElementById(link.toLowerCase());
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-foreground transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    {link}
                  </motion.button>
                ))}
              </div>

              {/* Social icons */}
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full glass border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
          </div>
        </FadeInUp>
      </div>
    </footer>
  );
};

export default Footer;

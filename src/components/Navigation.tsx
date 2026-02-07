import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Moon, Sun, Menu, X, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Magnetic } from "@/components/ui/MagneticCursor";

const Navigation = () => {
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark for the sci-fi aesthetic
      setTheme("dark");
      applyTheme("dark");
    }

    getResumeUrl();

    // Scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const getResumeUrl = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "resume_url")
      .maybeSingle();
    if (data) setResumeUrl(data.value);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'work', label: 'Work' },
    { id: 'about', label: 'About' },
    { id: 'career', label: 'Career' },
    { id: 'blog', label: 'Blog' },
    { id: 'news', label: 'News' },
  ];

  return (
    <>
      <motion.nav
        className={`
          fixed top-0 w-full z-50 transition-all duration-300
          ${isScrolled
            ? 'nav-glass py-3'
            : 'bg-transparent py-4'
          }
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Magnetic>
              <motion.button
                onClick={() => scrollToSection('hero')}
                className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-magnetic
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline">Aryaman Sharma</span>
              </motion.button>
            </Magnetic>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Magnetic key={item.id}>
                  <motion.button
                    onClick={() => scrollToSection(item.id)}
                    className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-magnetic
                  >
                    {item.label}
                    {/* Hover indicator */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary rounded-full"
                      whileHover={{ width: '50%', x: '-50%' }}
                    />
                  </motion.button>
                </Magnetic>
              ))}

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                title="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </motion.div>
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Resume button */}
              {resumeUrl && (
                <Magnetic>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 ml-2 hover:bg-muted/50"
                    onClick={() => window.open(resumeUrl, '_blank')}
                    data-magnetic
                  >
                    <Download className="w-4 h-4" />
                    Resume
                  </Button>
                </Magnetic>
              )}

              {/* Contact CTA */}
              <Magnetic>
                <Button
                  onClick={() => scrollToSection('contact')}
                  size="sm"
                  className="ml-2 glow"
                  data-magnetic
                >
                  Contact
                </Button>
              </Magnetic>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu content */}
            <motion.div
              className="relative z-10 flex flex-col items-center justify-center h-full gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
            >
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-2xl font-medium text-foreground hover:text-primary transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {item.label}
                </motion.button>
              ))}

              <motion.div
                className="flex gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="w-12 h-12 rounded-full"
                >
                  {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={() => scrollToSection('contact')}
                  size="lg"
                  className="glow"
                >
                  Contact
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
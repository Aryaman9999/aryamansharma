import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Moon, Sun } from "lucide-react";

const Navigation = () => {
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const hour = new Date().getHours();
      const isEvening = hour >= 18 || hour < 6;
      const autoTheme = isEvening ? "dark" : "light";
      setTheme(autoTheme);
      applyTheme(autoTheme);
    }

    getResumeUrl();
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
    // Mocking this for the preview if supabase isn't configured
    // const { data } = await supabase... 
    setResumeUrl("#"); 
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50 fade-in transition-colors duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('hero')}
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            Aryaman Sharma
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('work')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Work
            </button>
            <button onClick={() => scrollToSection('about')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('career')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Career
            </button>
            <button onClick={() => scrollToSection('blog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </button>
            
            <button onClick={() => scrollToSection('news')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              News
            </button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle theme"
            >
              {theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {resumeUrl && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => window.open(resumeUrl, '_blank')}
              >
                <Download className="w-4 h-4" />
                Resume
              </Button>
            )}

            <Button onClick={() => scrollToSection('contact')} size="sm">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
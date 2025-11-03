import { Button } from "@/components/ui/button";

const Navigation = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50 fade-in">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('hero')}
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            Aryaman Sharma
          </button>
          <div className="hidden md:flex items-center gap-8">
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

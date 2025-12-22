import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

const Hero = () => {
  // TECHNIQUE 1: Local Storage Cache
  // Initialize state directly from localStorage if it exists to prevent 
  // the "layout shift" while waiting for the database.
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
  // New state to handle smooth image fading
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    // 1. Fetch Hero Content
    const { data } = await supabase
      .from("hero_content")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (data) {
      // Check if data actually changed before updating state to avoid re-renders
      if (JSON.stringify(data) !== JSON.stringify(content)) {
        setContent(data);
        // Save to cache for next reload
        localStorage.setItem("hero_content", JSON.stringify(data));
      }
    }

    // 2. Fetch Resume URL
    // (We can cache this too if you like, using the same technique)
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

  const renderTitle = () => {
    if (!content.title) return <span className="opacity-0">Loading</span>; // Prevent collapse
    const parts = content.title.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const text = part.slice(2, -2);
        return <span key={i} className="text-primary">{text}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 pt-20 pb-20">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {renderTitle()}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {content.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button onClick={() => scrollToSection('work')} size="lg" className="gap-2">
                {content.button_primary_text} <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => scrollToSection('about')} variant="outline" size="lg">
                {content.button_secondary_text}
              </Button>
              {resumeUrl && (
                <Button 
                  onClick={() => window.open(resumeUrl, '_blank')} 
                  variant="outline" 
                  size="lg"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </Button>
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="flex-shrink-0 fade-in">
            {/* TECHNIQUE 2: Skeleton Loading Wrapper */}
            <div className={`
              relative w-64 h-64 md:w-80 md:h-80 rounded-full 
              overflow-hidden shadow-soft-lg transition-all duration-500
              ${isImageLoaded ? 'bg-transparent' : 'bg-muted/50 animate-pulse'} 
            `}>
              {content.image_url ? (
                <img 
                  src={content.image_url} 
                  alt="Aryaman" 
                  // TECHNIQUE 3: Browser Resource Hints
                  // "eager" tells browser to load this immediately (don't lazy load LCP images)
                  loading="eager"
                  // "high" signals this is a high-priority asset
                  fetchPriority="high"
                  className={`
                    w-full h-full object-cover transition-opacity duration-700
                    ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
                  `}
                  onLoad={() => setIsImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="text-sm">Aryaman</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
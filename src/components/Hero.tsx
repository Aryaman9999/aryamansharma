import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

const Hero = () => {
  const [content, setContent] = useState({
    title: "",
    description: "",
    button_primary_text: "View My Work",
    button_secondary_text: "About Me",
    image_url: ""
  });
  const [resumeUrl, setResumeUrl] = useState<string>("");

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from("hero_content")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) setContent(data);

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
          <div className="flex-shrink-0 fade-in">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-accent to-muted shadow-soft-lg overflow-hidden">
              {content.image_url ? (
                <img src={content.image_url} alt="Profile" className="w-full h-full object-cover" />
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

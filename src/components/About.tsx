import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    <section id="about" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl fade-in-up">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-shrink-0">
            <div className="w-64 h-80 bg-gradient-to-br from-accent to-muted rounded-lg shadow-soft overflow-hidden">
              {content.image_url ? (
                <img src={content.image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Casual Photo
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="text-xl text-primary mb-6">
                {content.subtitle}
              </p>
            )}
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Career = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string>("");

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

  return (
    <section id="career" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-4xl fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
          Career & Experience
        </h2>
        <div className="space-y-6 mb-12">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card rounded-lg border border-border hover:shadow-soft transition-shadow"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  {exp.company}
                </h3>
                <p className="text-muted-foreground mb-2">{exp.role}</p>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                  {exp.status}
                </span>
              </div>
              <div className="text-muted-foreground mt-4 md:mt-0">
                {exp.period}
              </div>
            </div>
          ))}
        </div>
        {resumeUrl && (
          <div className="flex justify-center">
            <Button 
              onClick={() => window.open(resumeUrl, '_blank')} 
              size="lg" 
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download My Full Resume
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Career;

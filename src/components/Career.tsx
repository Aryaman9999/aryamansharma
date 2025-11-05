import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown"
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
        <Accordion type="single" collapsible className="w-full space-y-4 mb-12">
  {experiences.map((exp) => (
    <AccordionItem key={exp.id} value={exp.id} className="bg-card rounded-lg border border-border hover:shadow-soft transition-shadow">
      
      {/* This is the part you click */}
      <AccordionTrigger className="flex justify-between items-center w-full p-6 font-semibold text-left">
        <div className="flex-1 text-left">
          <h3 className="text-xl font-semibold text-foreground mb-1">{exp.company}</h3>
          <p className="text-muted-foreground font-normal">{exp.role}</p>
        </div>
        <div className="text-muted-foreground font-normal ml-4 hidden md:block">
          {exp.period}
        </div>
      </AccordionTrigger>

      {/* This is the hidden content */}
      <AccordionContent className="p-6 pt-0">
        <div className="text-muted-foreground space-y-2 prose prose-sm dark:prose-invert">
          {/* This will render your bullet points as a list */}
          <ReactMarkdown>
            {exp.contributions}
          </ReactMarkdown>
        </div>
        <div className="text-muted-foreground font-normal mt-4 md:hidden">
          {exp.period}
        </div>
      </AccordionContent>

    </AccordionItem>
  ))}
</Accordion>
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

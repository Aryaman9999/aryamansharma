import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  // Helper to get a link by platform name
  const getLink = (platform: string) =>
    socialLinks.find((l) => l.platform.toLowerCase() === platform.toLowerCase());

  const email = getLink("email");
  const linkedin = getLink("linkedin");
  const github = getLink("github");

  return (
    <section id="contact" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-3xl text-center fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Let's Build Together
        </h2>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          I'm always open to discussing new ideas, challenging projects, or asymmetric opportunities. 
          Whether you're a founder, a recruiter, or just a curious mind, let's talk.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {email && (
            <Button asChild size="lg" className="gap-2 glow">
              <a href={email.url} target="_blank" rel="noopener noreferrer">
                <Mail className="w-4 h-4" />
                Send me an Email
              </a>
            </Button>
          )}
          {linkedin && (
            <Button asChild size="lg" variant="outline" className="gap-2 glow">
              <a href={linkedin.url} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
                Connect on LinkedIn
              </a>
            </Button>
          )}
          {github && (
            <Button asChild size="lg" variant="outline" className="gap-2 glow">
              <a href={github.url} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                See My Code on GitHub
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;

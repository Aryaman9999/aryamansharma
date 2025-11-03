import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Linkedin, Github, Twitter, Instagram, Youtube, Facebook, Globe } from "lucide-react";

const Footer = () => {
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

  const getIcon = (platform: string) => {
    const iconMap: Record<string, any> = {
      email: Mail,
      linkedin: Linkedin,
      github: Github,
      twitter: Twitter,
      instagram: Instagram,
      youtube: Youtube,
      facebook: Facebook,
      website: Globe,
    };
    const Icon = iconMap[platform.toLowerCase()] || Globe;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-6">
          {socialLinks.length > 0 && (
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.platform}
                >
                  {getIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            © 2025 Aryaman Sharma. Built with care and precision.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

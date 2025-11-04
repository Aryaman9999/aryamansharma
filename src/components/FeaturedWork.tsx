import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

const FeaturedWork = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("display_order");
    if (data) setProjects(data);
  };

  return (
    <section id="work" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-5xl fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
          My Work
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-soft-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-full h-48 bg-accent rounded-md mb-4 flex items-center justify-center text-muted-foreground overflow-hidden">
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{project.title}</span>
                  )}
                </div>
                <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{project.description}</ReactMarkdown>
                </CardDescription>
                {project.content && (
                  <Button 
                    variant="ghost" 
                    className="gap-2 px-0 hover:gap-3 transition-all"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    View Details <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                {!project.content && project.case_study_url && (
                  <Button 
                    variant="ghost" 
                    className="gap-2 px-0 hover:gap-3 transition-all"
                    onClick={() => window.open(project.case_study_url, '_blank')}
                  >
                    View Case Study <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWork;

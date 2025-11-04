import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (data) {
      setProject(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>

          {project.image_url && (
            <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-xl text-muted-foreground mb-8">
            {project.description}
          </p>

          {project.content && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{project.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;

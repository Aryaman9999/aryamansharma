import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Globe, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { GlassCard } from "@/components/ui/GlassCard";
import { StaggerContainer, StaggerItem, FadeInUp } from "@/components/ui/ScrollAnimations";
import { DecodingText } from "@/components/ui/DecodingText";

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
    <section id="work" className="relative py-32 px-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <FadeInUp>
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Portfolio</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              <DecodingText text="My Work" duration={1500} glitchIntensity="medium" />
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A collection of projects showcasing my expertise in Electronics, AI, and Software Engineering
            </p>
          </div>
        </FadeInUp>

        {/* Projects Grid */}
        <StaggerContainer className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <StaggerItem key={project.id}>
              <GlassCard
                className="h-full cursor-pointer group"
                glowColor={index % 2 === 0 ? "#6366f1" : "#06b6d4"}
                intensity="medium"
                tiltAmount={10}
                onClick={() => {
                  if (project.content) {
                    navigate(`/project/${project.id}`);
                  } else if (project.case_study_url) {
                    window.open(project.case_study_url, '_blank');
                  }
                }}
              >
                <div className="p-6">
                  {/* Project Image */}
                  <div className="relative w-full h-52 rounded-lg overflow-hidden mb-6 bg-muted/20">
                    {project.image_url ? (
                      <>
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground">{project.title}</span>
                      </div>
                    )}

                    {/* Floating action buttons */}
                    <motion.div
                      className="absolute bottom-4 right-4 flex gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full glass hover:bg-primary/20 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.live_demo_url && (
                        <a
                          href={project.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full glass hover:bg-secondary/20 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </motion.div>
                  </div>

                  {/* Project Info */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex gap-2">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Code on GitHub"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.live_demo_url && (
                        <a
                          href={project.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Live Demo"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.slice(0, 4).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {project.tags?.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-muted-foreground text-sm mb-6 line-clamp-3 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{project.description}</ReactMarkdown>
                  </div>

                  {/* Action Button */}
                  {(project.content || project.case_study_url) && (
                    <Button
                      variant="ghost"
                      className="gap-2 px-0 text-primary hover:text-primary hover:gap-3 transition-all group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (project.content) {
                          navigate(`/project/${project.id}`);
                        } else if (project.case_study_url) {
                          window.open(project.case_study_url, '_blank');
                        }
                      }}
                    >
                      {project.content ? 'View Details' : 'View Case Study'}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  )}
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* View All Projects Link */}
        {projects.length > 4 && (
          <FadeInUp className="text-center mt-12">
            <Button variant="outline" size="lg" className="glass border-white/20 gap-2">
              View All Projects
              <ExternalLink className="w-4 h-4" />
            </Button>
          </FadeInUp>
        )}
      </div>
    </section>
  );
};

export default FeaturedWork;

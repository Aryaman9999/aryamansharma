import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedWork = () => {
  const projects = [
    {
      title: "IEEE EPICS-Funded Smart Knee Cap",
      description: "Leading a team to build a wearable device for physiotherapy. Secured $3,800 in IEEE funding to design the custom PCB, sensor fusion algorithms, and data pipeline.",
      tags: ["Hardware", "MedTech", "Sensors", "AI/ML", "Leadership"],
      image: "Smart Knee Cap Project"
    },
    {
      title: "Agentic AI & GPU Project at Cvent",
      description: "Delivered $200k in value and saved 3 FTE hours by developing the company's first-ever agentic AI and GPU-based projects.",
      tags: ["AI/ML", "Data Science", "Python", "ROI", "Internship"],
      image: "Agentic AI Architecture"
    }
  ];

  return (
    <section id="work" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-5xl fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
          My Work
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="hover:shadow-soft-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-full h-48 bg-accent rounded-md mb-4 flex items-center justify-center text-muted-foreground">
                  {project.image}
                </div>
                <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {project.description}
                </CardDescription>
                <Button variant="ghost" className="gap-2 px-0 hover:gap-3 transition-all">
                  View Case Study <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWork;

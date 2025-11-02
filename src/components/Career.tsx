import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Career = () => {
  const experiences = [
    {
      company: "Cadence",
      role: "System Design Engineer Intern",
      status: "Upcoming",
      period: "2025"
    },
    {
      company: "PEC",
      role: "Joint Chief, Student Technical Societies",
      status: "Leadership",
      period: "2023-2024"
    },
    {
      company: "Cvent",
      role: "Data Science Intern",
      status: "PPO Offer",
      period: "2024"
    },
    {
      company: "Hitachi",
      role: "Engineering Intern",
      status: "Completed",
      period: "2023"
    },
    {
      company: "Vecros",
      role: "Marketing Intern",
      status: "Completed",
      period: "2022"
    }
  ];

  return (
    <section id="career" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-4xl fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
          Career & Experience
        </h2>
        <div className="space-y-6 mb-12">
          {experiences.map((exp, index) => (
            <div
              key={index}
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
        <div className="flex justify-center">
          <Button size="lg" className="gap-2">
            <Download className="w-4 h-4" />
            Download My Full Resume
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Career;

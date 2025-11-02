import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const Blog = () => {
  const articles = [
    {
      title: "3 Things I Learned Building a $200k AI Project at Cvent",
      description: "Key insights from developing enterprise-scale agentic AI systems and GPU-accelerated workflows.",
      readTime: "5 min read"
    },
    {
      title: "Why the 'Smart Knee Cap' is a Full-Stack Mechatronics Challenge",
      description: "From sensor fusion to custom PCB design, exploring the intersection of hardware and software in medical devices.",
      readTime: "7 min read"
    },
    {
      title: "Prepping for Cadence: My 3-Month Sprint into VLSI & Bare-Metal C",
      description: "A structured approach to mastering semiconductor design and low-level programming for hardware roles.",
      readTime: "6 min read"
    }
  ];

  return (
    <section id="blog" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
          My Field Notes
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Card key={index} className="hover:shadow-soft-lg transition-shadow duration-300 cursor-pointer border-border">
              <CardHeader>
                <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{article.readTime}</span>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {article.description}
                </CardDescription>
                <div className="flex items-center gap-2 text-primary hover:gap-3 transition-all">
                  <span className="text-sm font-medium">Read More</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;

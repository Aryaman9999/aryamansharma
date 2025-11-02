import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const Blog = () => {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("display_order");
    if (data) setArticles(data);
  };

  return (
    <section id="blog" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
          My Field Notes
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-soft-lg transition-shadow duration-300 cursor-pointer border-border">
              <CardHeader>
                <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{article.read_time}</span>
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

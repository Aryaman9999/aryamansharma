import { useEffect, useState } from "react";
import { ExternalLink, Calendar, Bot, Heart, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  public_reactions_count: number;
  published_at: string;
  cover_image: string | null;
  reading_time_minutes: number;
  user: {
    name: string;
    profile_image: string;
  };
  tag_list: string[];
}

const NewsFeed = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(
        `https://dev.to/api/articles?tag=ai&per_page=15&state=rising`
      );
      if (!response.ok) throw new Error("Failed to fetch articles");
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError(true);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section id="news" className="py-16 border-t border-border/40 bg-secondary/5">
      <div className="container px-6 mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Curated News Articles</h2>
              <p className="text-sm text-muted-foreground">Trending discussions in artificial intelligence, robotics and more</p>
            </div>
          </div>
          <div className="hidden text-sm font-medium sm:flex text-muted-foreground items-center gap-1 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Updated Daily</span>
          </div>
        </div>
      </div>

      {/* Updated Scroll Container: 
        - Removed 'hide-scrollbar'
        - Added custom scrollbar styles for a cleaner look in dark/light modes
        - Added 'snap-x' for better scrolling physics 
      */}
      <div className="w-full overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
        <div className="container px-6 mx-auto">
          {loading ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[300px] h-[360px] border rounded-xl bg-card/50 animate-pulse border-border flex-shrink-0" />
              ))}
            </div>
          ) : error ? (
             <div className="w-full p-8 text-center border border-dashed rounded-lg border-destructive/50">
               <p className="text-muted-foreground">Unable to load AI news at this moment.</p>
             </div>
          ) : (
            <div className="flex gap-5">
              {articles.map((article) => (
                <article 
                  key={article.id} 
                  className="group relative flex flex-col min-w-[300px] max-w-[300px] h-[380px] bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex-shrink-0 snap-center"
                >
                  <div className="h-40 overflow-hidden bg-secondary">
                    {article.cover_image ? (
                      <img 
                        src={article.cover_image} 
                        alt={article.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted-foreground/20">
                        <Bot className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 p-4">
                    <div className="flex gap-2 mb-3 overflow-hidden">
                      {article.tag_list.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="mb-2 text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {article.title}
                      </a>
                    </h3>

                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <img 
                          src={article.user.profile_image} 
                          alt={article.user.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="truncate max-w-[80px]">{article.user.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {article.public_reactions_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.published_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              <div className="flex flex-col items-center justify-center min-w-[150px] gap-2 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer flex-shrink-0 snap-center"
                   onClick={() => window.open('https://dev.to/t/ai', '_blank')}
              >
                <div className="p-3 rounded-full bg-secondary">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">View All</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
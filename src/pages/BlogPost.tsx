import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .single();
    
    setPost(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <article className="container mx-auto max-w-3xl px-6 py-24">
        <Button 
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{post.read_time}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground mb-8">{post.description}</p>
          <div className="whitespace-pre-wrap text-foreground">{post.content}</div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogPost;

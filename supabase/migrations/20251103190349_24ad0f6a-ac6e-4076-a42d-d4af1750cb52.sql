-- Create about_content table
CREATE TABLE IF NOT EXISTS public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view about content"
  ON public.about_content
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage about content"
  ON public.about_content
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_about_content_updated_at
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.about_content (title, subtitle, content)
VALUES (
  'I''m a Builder, Not Just an Engineer',
  NULL,
  E'My core "want" in life is autonomy, which I pursue through "asymmetric bets" and constant prototyping. I believe the most interesting problems are at the intersection of different fields. My goal is to build a career at the seam of intelligent software and physical hardware.\n\nThis passion isn''t new. It started in 9th grade, taking two buses to a government school''s tinkering lab just for the love of building. That "builder''s" curiosity is the same force that drives me today, from my Cvent internship to my IEEE project.\n\nAs the Joint Chief (JCST) at PEC, I led all 13 of the college''s technical societies. This role taught me that the best technology is useless without a great team, clear communication, and a shared mission.\n\nWhen I''m not in front of a terminal or a soldering iron, you can find me at the gym, exploring new food in Chandigarh, or in a deep philosophical discourse.'
);
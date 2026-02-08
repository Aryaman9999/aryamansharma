-- Add slug column to blog_posts for human-readable URLs
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create a function to generate slugs from titles
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  result_slug TEXT;
  base_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  base_slug := lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  -- Remove leading/trailing hyphens and collapse multiple hyphens
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  result_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.blog_posts bp WHERE bp.slug = result_slug) LOOP
    counter := counter + 1;
    result_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN result_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update existing blog posts with generated slugs based on their titles
UPDATE public.blog_posts 
SET slug = public.generate_slug(title) 
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing rows
ALTER TABLE public.blog_posts ALTER COLUMN slug SET NOT NULL;

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);


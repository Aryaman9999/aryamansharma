-- Add slug column to projects for human-readable URLs
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create a function to generate project slugs from titles
CREATE OR REPLACE FUNCTION public.generate_project_slug(title TEXT)
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
  WHILE EXISTS (SELECT 1 FROM public.projects p WHERE p.slug = result_slug) LOOP
    counter := counter + 1;
    result_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN result_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update existing projects with generated slugs based on their titles
UPDATE public.projects 
SET slug = public.generate_project_slug(title) 
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing rows
ALTER TABLE public.projects ALTER COLUMN slug SET NOT NULL;

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

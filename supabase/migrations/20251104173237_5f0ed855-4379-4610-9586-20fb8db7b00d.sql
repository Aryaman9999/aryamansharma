-- Add content field to projects table for markdown content
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS content TEXT;

-- Create storage bucket for files (resume, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for files bucket
CREATE POLICY "Anyone can view files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'files');

CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'files' AND has_role(auth.uid(), 'admin'::app_role));
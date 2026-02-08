import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Save, Mail, Upload, Loader2, HardDrive, RefreshCw, Eye, Copy, AlertTriangle, Check, Grid3X3, List, Search, X, FileImage, File } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/RichTextEditor";

const ImageUrlInput = ({
  value,
  onChange,
  onUpload
}: {
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File) => Promise<string | null>;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploading(true);
      try {
        const url = await onUpload(e.target.files[0]);
        if (url) onChange(url);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="flex-1"
      />
      <div className="relative">
        <Input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={handleFileChange}
          accept="image/*"
          disabled={uploading}
          title="Upload image"
        />
        <Button variant="outline" type="button" disabled={uploading} size="icon">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

// Helper function to generate URL-friendly slugs from titles
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");

  // Hero content state
  const [heroContent, setHeroContent] = useState({
    id: "",
    title: "",
    description: "",
    button_primary_text: "",
    button_secondary_text: "",
    image_url: ""
  });

  // Companies state
  const [companies, setCompanies] = useState<any[]>([]);
  const [newCompany, setNewCompany] = useState({ name: "", logo_url: "", display_order: 0 });

  // Projects state
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [uploadedBlogImageUrls, setUploadedBlogImageUrls] = useState<string[]>([]);

  // Experiences state
  const [experiences, setExperiences] = useState<any[]>([]);
  const [editingExperience, setEditingExperience] = useState<any>(null);

  // Blog posts state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  // Social links state
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: "", url: "", icon: "" });

  // Email list
  const [emailList, setEmailList] = useState<any[]>([]);

  // About content state
  const [aboutContent, setAboutContent] = useState({
    id: "",
    title: "",
    subtitle: "",
    content: "",
    image_url: ""
  });

  // Storage Manager state
  interface BucketFile {
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
    publicUrl: string;
    isImage: boolean;
  }
  interface FileReference {
    table: string;
    field: string;
    id: string;
    title?: string;
  }
  const [bucketFiles, setBucketFiles] = useState<BucketFile[]>([]);
  const [fileReferences, setFileReferences] = useState<Record<string, FileReference[]>>({});
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageViewMode, setStorageViewMode] = useState<'grid' | 'list'>('grid');
  const [storageSearch, setStorageSearch] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<BucketFile | null>(null);
  const [previewFile, setPreviewFile] = useState<BucketFile | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin-login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast.error("Unauthorized access");
      await supabase.auth.signOut();
      navigate("/admin-login");
      return;
    }

    loadAllContent();
  };

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const { data: heroData } = await supabase
        .from("hero_content")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (heroData) setHeroContent(heroData);

      // Load resume URL from site settings
      const { data: resumeSetting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "resume_url")
        .maybeSingle();
      if (resumeSetting) setResumeUrl(resumeSetting.value);

      const { data: companiesData } = await supabase
        .from("companies")
        .select("*")
        .order("display_order");
      if (companiesData) setCompanies(companiesData);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("display_order");
      if (projectsData) setProjects(projectsData);

      const { data: experiencesData } = await supabase
        .from("experiences")
        .select("*")
        .order("display_order");
      if (experiencesData) setExperiences(experiencesData);

      const { data: blogData } = await supabase
        .from("blog_posts")
        .select("*")
        .order("display_order");
      if (blogData) setBlogPosts(blogData);

      const { data: socialData } = await supabase
        .from("social_links")
        .select("*");
      if (socialData) setSocialLinks(socialData);

      const { data: emailData } = await supabase
        .from("email_list")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (emailData) setEmailList(emailData);

      const { data: aboutData } = await supabase
        .from("about_content")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (aboutData) setAboutContent(aboutData);

    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const saveHeroContent = async () => {
    try {
      // Upload resume file if selected
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `resume-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(fileName, resumeFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(fileName);

        // Save resume URL to site settings
        const { data: existingSetting } = await supabase
          .from('site_settings')
          .select('id')
          .eq('key', 'resume_url')
          .maybeSingle();

        const { error: settingsError } = existingSetting
          ? await supabase
            .from('site_settings')
            .update({ value: publicUrl })
            .eq('key', 'resume_url')
          : await supabase
            .from('site_settings')
            .insert({ key: 'resume_url', value: publicUrl });

        if (settingsError) throw settingsError;

        setResumeUrl(publicUrl);
        setResumeFile(null);
      }

      const { error } = await supabase
        .from("hero_content")
        .update({
          title: heroContent.title,
          description: heroContent.description,
          button_primary_text: heroContent.button_primary_text,
          button_secondary_text: heroContent.button_secondary_text,
          image_url: heroContent.image_url
        })
        .eq("id", heroContent.id);

      if (error) throw error;
      toast.success("Hero content updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addCompany = async () => {
    if (!newCompany.name) {
      toast.error("Company name is required");
      return;
    }
    try {
      const { error } = await supabase
        .from("companies")
        .insert([newCompany]);
      if (error) throw error;
      toast.success("Company added");
      setNewCompany({ name: "", logo_url: "", display_order: 0 });
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
      toast.success("Company deleted");
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `upload-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const uploadProjectImage = async () => {
    if (!projectImageFile) return null;

    try {
      const fileExt = projectImageFile.name.split('.').pop();
      const fileName = `project-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, projectImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      setUploadedImageUrls([...uploadedImageUrls, publicUrl]);
      toast.success("Image uploaded! URL copied below.");
      setProjectImageFile(null);
      return publicUrl;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const uploadBlogImage = async () => {
    if (!blogImageFile) return null;

    try {
      const fileExt = blogImageFile.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, blogImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      setUploadedBlogImageUrls([...uploadedBlogImageUrls, publicUrl]);
      // If currently editing a blog, set its image_url to the uploaded public URL
      if (editingBlog) setEditingBlog({ ...editingBlog, image_url: publicUrl });
      toast.success("Image uploaded! URL copied below.");
      setBlogImageFile(null);
      return publicUrl;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const saveProject = async () => {
    if (!editingProject) return;
    try {
      if (editingProject.id) {
        const { error } = await supabase
          .from("projects")
          .update(editingProject)
          .eq("id", editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert([editingProject]);
        if (error) throw error;
      }
      toast.success("Project saved");
      setEditingProject(null);
      setUploadedImageUrls([]);
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Project deleted");
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveExperience = async () => {
    if (!editingExperience) return;
    try {
      if (editingExperience.id) {
        const { error } = await supabase
          .from("experiences")
          .update(editingExperience)
          .eq("id", editingExperience.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("experiences").insert([editingExperience]);
        if (error) throw error;
      }
      toast.success("Experience saved");
      setEditingExperience(null);
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw error;
      toast.success("Experience deleted");
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveBlogPost = async () => {
    if (!editingBlog) return;
    try {
      if (editingBlog.id) {
        const { error } = await supabase
          .from("blog_posts")
          .update(editingBlog)
          .eq("id", editingBlog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert([editingBlog]);
        if (error) throw error;
      }
      toast.success("Blog post saved");
      setEditingBlog(null);
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Blog post deleted");
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addSocialLink = async () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      toast.error("Platform and URL are required");
      return;
    }
    try {
      const { error } = await supabase.from("social_links").insert([newSocialLink]);
      if (error) throw error;
      toast.success("Social link added");
      setNewSocialLink({ platform: "", url: "", icon: "" });
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteSocialLink = async (id: string) => {
    try {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
      toast.success("Social link deleted");
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveAboutContent = async () => {
    try {
      const { error } = await supabase
        .from("about_content")
        .update({
          title: aboutContent.title,
          subtitle: aboutContent.subtitle,
          content: aboutContent.content,
          image_url: aboutContent.image_url
        })
        .eq("id", aboutContent.id);

      if (error) throw error;
      toast.success("About content updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteEmail = async (id: string) => {
    try {
      const { error } = await supabase.from("email_list").delete().eq("id", id);
      if (error) throw error;
      toast.success("Email deleted");
      loadAllContent();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Storage Manager Functions
  const loadBucketFiles = async () => {
    setStorageLoading(true);
    try {
      // List all files in the bucket
      const { data: files, error } = await supabase.storage
        .from('files')
        .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      // Get public URLs for all files
      const filesWithUrls: BucketFile[] = (files || [])
        .filter(f => f.name !== '.emptyFolderPlaceholder') // Filter out placeholder files
        .map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(file.name);

          const imageExtensions = ['jpg', 'jpeg', 'jfif', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'avif'];
          const ext = file.name.split('.').pop()?.toLowerCase() || '';

          return {
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at || '',
            updated_at: file.updated_at || '',
            publicUrl,
            isImage: imageExtensions.includes(ext)
          };
        });

      setBucketFiles(filesWithUrls);

      // Now scan database for references
      const references: Record<string, FileReference[]> = {};

      // Check hero_content - use * to get all fields
      const { data: heroData } = await supabase.from("hero_content").select("*") as { data: any[] | null };
      if (heroData) {
        heroData.forEach(item => {
          if (item.image_url) {
            filesWithUrls.forEach(file => {
              if (item.image_url?.includes(file.name)) {
                if (!references[file.name]) references[file.name] = [];
                references[file.name].push({ table: 'Hero', field: 'image_url', id: item.id, title: item.title || 'Hero Section' });
              }
            });
          }
        });
      }

      // Check about_content - use * to get all fields
      const { data: aboutData } = await supabase.from("about_content").select("*") as { data: any[] | null };
      if (aboutData) {
        aboutData.forEach(item => {
          filesWithUrls.forEach(file => {
            if (item.image_url?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'About', field: 'image_url', id: item.id, title: item.title || 'About Section' });
            }
            if (item.content?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'About', field: 'content', id: item.id, title: item.title || 'About Section' });
            }
          });
        });
      }

      // Check projects - use * to get all fields
      const { data: projectData } = await supabase.from("projects").select("*") as { data: any[] | null };
      if (projectData) {
        projectData.forEach(item => {
          filesWithUrls.forEach(file => {
            if (item.image_url?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'Project', field: 'image_url', id: item.id, title: item.title });
            }
            if (item.content?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'Project', field: 'content', id: item.id, title: item.title });
            }
            if (item.description?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'Project', field: 'description', id: item.id, title: item.title });
            }
          });
        });
      }

      // Check blog_posts - use * to get all fields including image_url
      const { data: blogData } = await supabase.from("blog_posts").select("*") as { data: any[] | null };
      if (blogData) {
        blogData.forEach((item: any) => {
          filesWithUrls.forEach(file => {
            if (item.image_url?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'Blog', field: 'image_url', id: item.id, title: item.title });
            }
            if (item.content?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'Blog', field: 'content', id: item.id, title: item.title });
            }
            if (item.description?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'Blog', field: 'description', id: item.id, title: item.title });
            }
          });
        });
      }

      // Check site_settings (resume) - use * to get all fields
      const { data: settingsData } = await supabase.from("site_settings").select("*") as { data: any[] | null };
      if (settingsData) {
        settingsData.forEach(item => {
          filesWithUrls.forEach(file => {
            if (item.value?.includes(file.name)) {
              if (!references[file.name]) references[file.name] = [];
              references[file.name].push({ table: 'Settings', field: item.key, id: item.id, title: `Setting: ${item.key}` });
            }
          });
        });
      }

      setFileReferences(references);
    } catch (error: any) {
      console.error('Error loading bucket files:', error);
      toast.error('Failed to load storage files');
    } finally {
      setStorageLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTotalStorageUsed = (): number => {
    return bucketFiles.reduce((acc, file) => acc + file.size, 0);
  };

  const getOrphanedFiles = (): BucketFile[] => {
    return bucketFiles.filter(file => !fileReferences[file.name] || fileReferences[file.name].length === 0);
  };

  const getFilteredFiles = (): BucketFile[] => {
    if (!storageSearch) return bucketFiles;
    return bucketFiles.filter(file =>
      file.name.toLowerCase().includes(storageSearch.toLowerCase())
    );
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleDeleteFile = async (file: BucketFile) => {
    try {
      const { error } = await supabase.storage.from('files').remove([file.name]);
      if (error) throw error;
      toast.success(`Deleted: ${file.name}`);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      loadBucketFiles();
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const filesToDelete = Array.from(selectedFiles);
      const { error } = await supabase.storage.from('files').remove(filesToDelete);
      if (error) throw error;
      toast.success(`Deleted ${filesToDelete.length} files`);
      setSelectedFiles(new Set());
      setBulkDeleteDialogOpen(false);
      loadBucketFiles();
    } catch (error: any) {
      toast.error(`Failed to delete files: ${error.message}`);
    }
  };

  const toggleFileSelection = (fileName: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileName)) {
      newSelected.delete(fileName);
    } else {
      newSelected.add(fileName);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllOrphaned = () => {
    const orphaned = getOrphanedFiles();
    setSelectedFiles(new Set(orphaned.map(f => f.name)));
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid grid-cols-9 w-full">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="experiences">Career</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="storage" onClick={() => loadBucketFiles()}>Storage</TabsTrigger>
          </TabsList>

          {/* Hero Content Tab */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Edit your homepage hero content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Textarea
                    value={heroContent.title}
                    onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={heroContent.description}
                    onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Text</Label>
                    <Input
                      value={heroContent.button_primary_text}
                      onChange={(e) => setHeroContent({ ...heroContent, button_primary_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Secondary Button Text</Label>
                    <Input
                      value={heroContent.button_secondary_text}
                      onChange={(e) => setHeroContent({ ...heroContent, button_secondary_text: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Image URL (optional)</Label>
                  <ImageUrlInput
                    value={heroContent.image_url || ""}
                    onChange={(val) => setHeroContent({ ...heroContent, image_url: val })}
                    onUpload={handleImageUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resume File</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  {resumeUrl && (
                    <p className="text-sm text-muted-foreground">
                      Current resume: <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF or DOC file for the download resume button
                  </p>
                </div>
                <Button onClick={saveHeroContent}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Hero Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Content Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Edit your about section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Section title"
                    value={aboutContent.title}
                    onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle (optional)</Label>
                  <Input
                    placeholder="Optional subtitle"
                    value={aboutContent.subtitle || ""}
                    onChange={(e) => setAboutContent({ ...aboutContent, subtitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="About content (use line breaks for paragraphs)"
                    value={aboutContent.content}
                    onChange={(e) => setAboutContent({ ...aboutContent, content: e.target.value })}
                    rows={12}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image URL (optional)</Label>
                  <ImageUrlInput
                    value={aboutContent.image_url || ""}
                    onChange={(val) => setAboutContent({ ...aboutContent, image_url: val })}
                    onUpload={handleImageUpload}
                  />
                </div>
                <Button onClick={saveAboutContent}>
                  <Save className="w-4 h-4 mr-2" />
                  Save About Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Companies / Social Proof</CardTitle>
                <CardDescription>Manage company logos and names</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center gap-4 p-4 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{company.name}</p>
                        {company.logo_url && (
                          <p className="text-sm text-muted-foreground">{company.logo_url}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">Order: {company.display_order}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCompany(company.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium">Add New Company</h3>
                  <Input
                    placeholder="Company name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  />
                  <Input
                    placeholder="Logo URL (optional)"
                    value={newCompany.logo_url}
                    onChange={(e) => setNewCompany({ ...newCompany, logo_url: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Display order"
                    value={newCompany.display_order}
                    onChange={(e) => setNewCompany({ ...newCompany, display_order: parseInt(e.target.value) || 0 })}
                  />
                  <Button onClick={addCompany}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects / Featured Work</CardTitle>
                <CardDescription>Manage your portfolio projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editingProject ? (
                  <>
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-start gap-4 p-4 border rounded">
                          <div className="flex-1">
                            <h3 className="font-medium">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.tags?.map((tag: string, i: number) => (
                                <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">{tag}</span>
                              ))}
                            </div>
                            <p className="text-xs text-primary/70 mt-1">/{project.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProject(project)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProject(project.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => setEditingProject({ title: "", description: "", tags: [], image_url: "", case_study_url: "", display_order: 0, github_url: "", live_demo_url: "", slug: "" })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Project title"
                        value={editingProject.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          const autoSlug = !editingProject.id ? generateSlug(newTitle) : editingProject.slug;
                          setEditingProject({ ...editingProject, title: newTitle, slug: autoSlug });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">/project/</span>
                        <Input
                          placeholder="my-awesome-project"
                          value={editingProject.slug || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, slug: generateSlug(e.target.value) })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">The URL slug is auto-generated from the title but can be customized.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Project Description (Markdown supported)</Label>
                      <Textarea
                        placeholder="Short description with markdown support (## Heading, **bold**, etc.)"
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <Input
                      placeholder="Tags (comma-separated)"
                      value={editingProject.tags?.join(", ") || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value.split(",").map((t: string) => t.trim()) })}
                    />
                    <div className="space-y-2">
                      <Label>Cover Image URL</Label>
                      <ImageUrlInput
                        value={editingProject.image_url || ""}
                        onChange={(val) => setEditingProject({ ...editingProject, image_url: val })}
                        onUpload={handleImageUpload}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project Content</Label>
                      <RichTextEditor
                        content={editingProject.content || ""}
                        onChange={(value) => setEditingProject({ ...editingProject, content: value })}
                        onImageUpload={handleImageUpload}
                        className="min-h-[300px]"
                      />
                    </div>
                    <Input
                      placeholder="External Case Study URL (optional if content is provided)"
                      value={editingProject.case_study_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, case_study_url: e.target.value })}
                    />
                    <Input
                      placeholder="GitHub URL (e.g., https://github.com/...)"
                      value={editingProject.github_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                    />
                    <Input
                      placeholder="Live Demo URL (e.g., https://...)"
                      value={editingProject.live_demo_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, live_demo_url: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Display order"
                      value={editingProject.display_order}
                      onChange={(e) => setEditingProject({ ...editingProject, display_order: parseInt(e.target.value) || 0 })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveProject}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Project
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProject(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences">
            <Card>
              <CardHeader>
                <CardTitle>Career & Experience</CardTitle>
                <CardDescription>Manage your work experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editingExperience ? (
                  <>
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="flex items-start gap-4 p-4 border rounded">
                          <div className="flex-1">
                            <h3 className="font-medium">{exp.company}</h3>
                            <p className="text-sm">{exp.role}</p>
                            <p className="text-sm text-muted-foreground">{exp.status} • {exp.period}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingExperience(exp)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteExperience(exp.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => setEditingExperience({ company: "", role: "", status: "", period: "", display_order: 0 })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Company name"
                      value={editingExperience.company}
                      onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                    />
                    <Input
                      placeholder="Role/Position"
                      value={editingExperience.role}
                      onChange={(e) => setEditingExperience({ ...editingExperience, role: e.target.value })}
                    />
                    <Input
                      placeholder="Status (e.g., Upcoming, Completed)"
                      value={editingExperience.status}
                      onChange={(e) => setEditingExperience({ ...editingExperience, status: e.target.value })}
                    />
                    <Input
                      placeholder="Period (e.g., 2024-2025)"
                      value={editingExperience.period}
                      onChange={(e) => setEditingExperience({ ...editingExperience, period: e.target.value })}
                    />
                    <Textarea
                      placeholder="Contributions (use * for bullet points)..."
                      value={editingExperience.contributions || ""}
                      onChange={(e) => setEditingExperience({ ...editingExperience, contributions: e.target.value })}
                      rows={4}
                    />
                    <Input
                      type="number"
                      placeholder="Display order"
                      value={editingExperience.display_order}
                      onChange={(e) => setEditingExperience({ ...editingExperience, display_order: parseInt(e.target.value) || 0 })}
                    />

                    <div className="flex gap-2">
                      <Button onClick={saveExperience}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Experience
                      </Button>
                      <Button variant="outline" onClick={() => setEditingExperience(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Posts Tab */}
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>Manage your blog content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editingBlog ? (
                  <>
                    <div className="space-y-3">
                      {blogPosts.map((blog) => (
                        <div key={blog.id} className="flex items-start gap-4 p-4 border rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{blog.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${blog.published ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                                {blog.published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{blog.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{blog.read_time}</p>
                            <p className="text-xs text-primary/70 mt-1">/{blog.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingBlog(blog)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteBlogPost(blog.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => setEditingBlog({ title: "", description: "", content: "", read_time: "5 min read", published: false, display_order: 0, slug: "" })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blog Post
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Blog post title"
                        value={editingBlog.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          const autoSlug = !editingBlog.id ? generateSlug(newTitle) : editingBlog.slug;
                          setEditingBlog({ ...editingBlog, title: newTitle, slug: autoSlug });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">/blog/</span>
                        <Input
                          placeholder="my-blog-post"
                          value={editingBlog.slug || ""}
                          onChange={(e) => setEditingBlog({ ...editingBlog, slug: generateSlug(e.target.value) })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">The URL slug is auto-generated from the title but can be customized.</p>
                    </div>
                    <Textarea
                      placeholder="Short description"
                      value={editingBlog.description}
                      onChange={(e) => setEditingBlog({ ...editingBlog, description: e.target.value })}
                      rows={3}
                    />
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <RichTextEditor
                        content={editingBlog.content || ""}
                        onChange={(value) => setEditingBlog({ ...editingBlog, content: value })}
                        onImageUpload={handleImageUpload}
                        className="min-h-[400px]"
                      />
                    </div>
                    <Input
                      placeholder="Read time (e.g., 5 min read)"
                      value={editingBlog.read_time}
                      onChange={(e) => setEditingBlog({ ...editingBlog, read_time: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingBlog.published}
                        onCheckedChange={(checked) => setEditingBlog({ ...editingBlog, published: checked })}
                      />
                      <Label>Published</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Cover Image URL (optional)</Label>
                      <ImageUrlInput
                        value={editingBlog.image_url || ""}
                        onChange={(val) => setEditingBlog({ ...editingBlog, image_url: val })}
                        onUpload={handleImageUpload}
                      />
                    </div>
                    <Input
                      type="number"
                      placeholder="Display order"
                      value={editingBlog.display_order}
                      onChange={(e) => setEditingBlog({ ...editingBlog, display_order: parseInt(e.target.value) || 0 })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveBlogPost}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Blog Post
                      </Button>
                      <Button variant="outline" onClick={() => setEditingBlog(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Manage your social media and contact links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-4 p-4 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{link.platform}</p>
                        <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSocialLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium">Add New Social Link</h3>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select
                      value={newSocialLink.platform}
                      onValueChange={(value) => setNewSocialLink({ ...newSocialLink, platform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      placeholder="https://..."
                      value={newSocialLink.url}
                      onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                    />
                  </div>
                  <Button onClick={addSocialLink}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email List Tab */}
          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Email Subscribers</CardTitle>
                <CardDescription>View and manage email list subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emailList.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No subscribers yet</p>
                  ) : (
                    emailList.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <p className="font-medium">{item.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.subscribed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEmail(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Manager Tab */}
          <TabsContent value="storage">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5" />
                      Storage Manager
                    </CardTitle>
                    <CardDescription>
                      {bucketFiles.length} files • {formatFileSize(getTotalStorageUsed())} used
                      {getOrphanedFiles().length > 0 && (
                        <span className="text-yellow-600 ml-2">
                          • {getOrphanedFiles().length} orphaned (safe to delete)
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadBucketFiles}
                      disabled={storageLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${storageLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Controls */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={storageSearch}
                      onChange={(e) => setStorageSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-1 border rounded-md">
                    <Button
                      variant={storageViewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setStorageViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={storageViewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setStorageViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  {getOrphanedFiles().length > 0 && (
                    <Button variant="outline" size="sm" onClick={selectAllOrphaned}>
                      Select Orphaned ({getOrphanedFiles().length})
                    </Button>
                  )}
                  {selectedFiles.size > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        Clear ({selectedFiles.size})
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                      </Button>
                    </>
                  )}
                </div>

                {/* Loading State */}
                {storageLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : bucketFiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No files in storage</p>
                    <p className="text-sm">Upload files through the other tabs</p>
                  </div>
                ) : (
                  <>
                    {/* Grid View */}
                    {storageViewMode === 'grid' && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {getFilteredFiles().map((file) => {
                          const refs = fileReferences[file.name] || [];
                          const isOrphaned = refs.length === 0;
                          const isSelected = selectedFiles.has(file.name);

                          return (
                            <div
                              key={file.name}
                              className={`relative group border rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''
                                } ${isOrphaned ? 'border-yellow-500/50' : 'border-green-500/50'}`}
                            >
                              {/* Selection checkbox */}
                              <button
                                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 transition-all ${isSelected
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'bg-background/80 border-muted-foreground/50 hover:border-primary'
                                  }`}
                                onClick={() => toggleFileSelection(file.name)}
                              >
                                {isSelected && <Check className="w-3 h-3 mx-auto" />}
                              </button>

                              {/* Status badge */}
                              <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-xs font-medium ${isOrphaned
                                ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                : 'bg-green-500/20 text-green-700 dark:text-green-400'
                                }`}>
                                {isOrphaned ? 'Orphaned' : `${refs.length} ref${refs.length > 1 ? 's' : ''}`}
                              </div>

                              {/* Thumbnail */}
                              <div
                                className="aspect-square bg-muted flex items-center justify-center cursor-pointer"
                                onClick={() => file.isImage && setPreviewFile(file)}
                              >
                                {file.isImage ? (
                                  <img
                                    src={file.publicUrl}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <File className="w-12 h-12 text-muted-foreground" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="p-2 space-y-1">
                                <p className="text-xs font-medium truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-1 pt-1">
                                  {file.isImage && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2"
                                      onClick={() => setPreviewFile(file)}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => copyToClipboard(file.publicUrl)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setFileToDelete(file);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* List View */}
                    {storageViewMode === 'list' && (
                      <div className="space-y-2">
                        {getFilteredFiles().map((file) => {
                          const refs = fileReferences[file.name] || [];
                          const isOrphaned = refs.length === 0;
                          const isSelected = selectedFiles.has(file.name);

                          return (
                            <div
                              key={file.name}
                              className={`flex items-center gap-4 p-3 border rounded-lg transition-all ${isSelected ? 'ring-2 ring-primary' : ''
                                } ${isOrphaned ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-green-500/50 bg-green-500/5'}`}
                            >
                              {/* Checkbox */}
                              <button
                                className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-all ${isSelected
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground/50 hover:border-primary'
                                  }`}
                                onClick={() => toggleFileSelection(file.name)}
                              >
                                {isSelected && <Check className="w-3 h-3 mx-auto" />}
                              </button>

                              {/* Thumbnail */}
                              <div className="w-12 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {file.isImage ? (
                                  <img
                                    src={file.publicUrl}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <File className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>•</span>
                                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                </div>
                                {refs.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {refs.slice(0, 3).map((ref, i) => (
                                      <span key={i} className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                                        {ref.table}: {ref.title}
                                      </span>
                                    ))}
                                    {refs.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{refs.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Status */}
                              <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${isOrphaned
                                ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                : 'bg-green-500/20 text-green-700 dark:text-green-400'
                                }`}>
                                {isOrphaned ? 'Orphaned' : 'In Use'}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1 flex-shrink-0">
                                {file.isImage && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPreviewFile(file)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(file.publicUrl)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setFileToDelete(file);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="truncate">{previewFile?.name}</DialogTitle>
            </DialogHeader>
            {previewFile && (
              <div className="space-y-4">
                <img
                  src={previewFile.publicUrl}
                  alt={previewFile.name}
                  className="max-h-[60vh] mx-auto object-contain rounded"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatFileSize(previewFile.size)}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(previewFile.publicUrl)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy URL
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setFileToDelete(previewFile);
                        setDeleteDialogOpen(true);
                        setPreviewFile(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                {fileReferences[previewFile.name]?.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                      This file is referenced in:
                    </p>
                    <ul className="text-sm space-y-1">
                      {fileReferences[previewFile.name].map((ref, i) => (
                        <li key={i} className="text-muted-foreground">
                          • {ref.table} → {ref.title} ({ref.field})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Single Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {fileToDelete && fileReferences[fileToDelete.name]?.length > 0 && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                Delete File
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>Are you sure you want to delete <strong>{fileToDelete?.name}</strong>?</p>

                  {fileToDelete && fileReferences[fileToDelete.name]?.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                        ⚠️ Warning: This file is currently in use!
                      </p>
                      <ul className="text-sm space-y-1">
                        {fileReferences[fileToDelete.name].map((ref, i) => (
                          <li key={i} className="text-muted-foreground">
                            • {ref.table} → {ref.title} ({ref.field})
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-yellow-600 mt-2">
                        Deleting this file will break these references!
                      </p>
                    </div>
                  )}

                  {fileToDelete && (!fileReferences[fileToDelete.name] || fileReferences[fileToDelete.name].length === 0) && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        ✓ This file is not referenced anywhere. Safe to delete.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => fileToDelete && handleDeleteFile(fileToDelete)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Delete {selectedFiles.size} Files
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>Are you sure you want to delete {selectedFiles.size} selected files?</p>

                  {(() => {
                    const referencedFiles = Array.from(selectedFiles).filter(
                      fileName => fileReferences[fileName]?.length > 0
                    );

                    if (referencedFiles.length > 0) {
                      return (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                            ⚠️ Warning: {referencedFiles.length} file(s) are in use!
                          </p>
                          <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                            {referencedFiles.slice(0, 5).map((fileName) => (
                              <li key={fileName} className="text-muted-foreground truncate">
                                • {fileName}
                              </li>
                            ))}
                            {referencedFiles.length > 5 && (
                              <li className="text-muted-foreground">
                                ...and {referencedFiles.length - 5} more
                              </li>
                            )}
                          </ul>
                        </div>
                      );
                    }

                    return (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          ✓ None of these files are referenced. Safe to delete.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBulkDelete}
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminDashboard;

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
import { LogOut, Plus, Trash2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="experiences">Career</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
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
                  <Input
                    value={heroContent.image_url || ""}
                    onChange={(e) => setHeroContent({ ...heroContent, image_url: e.target.value })}
                    placeholder="https://..."
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
                  <Input
                    placeholder="https://..."
                    value={aboutContent.image_url || ""}
                    onChange={(e) => setAboutContent({ ...aboutContent, image_url: e.target.value })}
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
                    <Button onClick={() => setEditingProject({ title: "", description: "", tags: [], image_url: "", case_study_url: "", display_order: 0 })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Project title"
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    />
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
                    <Input
                      placeholder="Image URL"
                      value={editingProject.image_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                    />
                    <div className="space-y-2">
                      <Label>Upload Images for Markdown</Label>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProjectImageFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        <Button 
                          type="button"
                          onClick={uploadProjectImage}
                          disabled={!projectImageFile}
                          variant="secondary"
                        >
                          Upload Image
                        </Button>
                      </div>
                      {uploadedImageUrls.length > 0 && (
                        <div className="space-y-2 p-3 bg-muted rounded-md">
                          <p className="text-xs font-medium">Uploaded Image URLs (copy & paste into markdown):</p>
                          {uploadedImageUrls.map((url, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <code className="text-xs bg-background p-2 rounded flex-1 overflow-x-auto">
                                ![image]({url})
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(`![image](${url})`);
                                  toast.success("Copied to clipboard!");
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Project Content (Markdown)</Label>
                      <Textarea
                        placeholder="Write your project details in markdown format...&#10;&#10;## Overview&#10;This project...&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Images&#10;![Alt text](image-url-here)"
                        value={editingProject.content || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, content: e.target.value })}
                        rows={15}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use markdown formatting. Upload images above and paste the URLs. Leave blank to use external case study URL instead.
                      </p>
                    </div>
                    <Input
                      placeholder="External Case Study URL (optional if content is provided)"
                      value={editingProject.case_study_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, case_study_url: e.target.value })}
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
                    <Button onClick={() => setEditingBlog({ title: "", description: "", content: "", read_time: "5 min read", published: false, display_order: 0 })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blog Post
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Blog post title"
                      value={editingBlog.title}
                      onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Short description"
                      value={editingBlog.description}
                      onChange={(e) => setEditingBlog({ ...editingBlog, description: e.target.value })}
                      rows={3}
                    />
                    <Textarea
                      placeholder="Full content (optional)"
                      value={editingBlog.content || ""}
                      onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                      rows={6}
                    />
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

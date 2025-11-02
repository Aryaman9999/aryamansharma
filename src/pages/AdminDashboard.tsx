import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Mail, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmailSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchSubscribers();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin-login");
      return;
    }

    // Verify admin role
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

    setLoading(false);
  };

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from("email_list")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
      return;
    }

    setSubscribers(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDeleteSubscriber = async (id: string) => {
    const { error } = await supabase
      .from("email_list")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete subscriber");
      return;
    }

    toast.success("Subscriber removed");
    fetchSubscribers();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Total Subscribers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{subscribers.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Email List</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage your subscribers</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Subscribers</CardTitle>
            <CardDescription>
              People who signed up for your newsletter or updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscribers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No subscribers yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">
                        {subscriber.email}
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;

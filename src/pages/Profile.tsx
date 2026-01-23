import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, QrCode, TrendingUp, LogOut } from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  total_scans: number;
  total_energy_generated: number;
  created_at: string;
}

interface Scan {
  id: string;
  energy_generated: number;
  scanned_at: string;
  location: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load recent scans
      const { data: scansData, error: scansError } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", session.user.id)
        .order("scanned_at", { ascending: false })
        .limit(5);

      if (scansError) throw scansError;
      setRecentScans(scansData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {profile?.full_name || "User Profile"}
            </h1>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Scans
                </span>
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {profile?.total_scans || 0}
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Energy Generated
                </span>
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {Number(profile?.total_energy_generated || 0).toFixed(2)} kWh
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Member Since
                </span>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </Card>
          </div>

          {/* Recent Scans */}
          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            {recentScans.length > 0 ? (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {scan.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(scan.scanned_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent">
                        +{Number(scan.energy_generated).toFixed(2)} kWh
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No scans yet. Start using the turnstile to see your activity!</p>
              </div>
            )}
          </Card>

          <div className="mt-6 text-center">
            <Button onClick={() => navigate("/scanner")} size="lg">
              <QrCode className="mr-2 h-5 w-5" />
              Scan QR Code
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

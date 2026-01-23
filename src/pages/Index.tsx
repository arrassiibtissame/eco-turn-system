import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/MetricCard";
import { UsageChart } from "@/components/UsageChart";
import { Button } from "@/components/ui/button";
import { Zap, Users, TrendingUp, QrCode } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [totalScans, setTotalScans] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [uniqueScans, setUniqueScans] = useState(0);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get today's start time
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: scans } = await supabase
        .from("scans")
        .select("energy_generated, scanned_at")
        .gte("scanned_at", todayStart.toISOString());

      if (scans && scans.length > 0) {
        setTotalScans(scans.length);
        const energy = scans.reduce((sum: number, scan: any) => 
          sum + Number(scan.energy_generated), 0
        );
        setTotalEnergy(energy);
        setUniqueScans(scans.length);
      } else {
        // Reset to zero if no scans today
        setTotalScans(0);
        setTotalEnergy(0);
        setUniqueScans(0);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-start justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                <span>Sustainable Energy Generation</span>
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EcoTurn Dashboard
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Track your turnstile usage and electricity generation in real-time. 
                Every scan contributes to sustainable energy production.
              </p>
            </div>
            <Button onClick={() => navigate("/scanner")} size="lg">
              <QrCode className="mr-2 h-5 w-5" />
              Scan Now
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard
            title="Today's Scans"
            value={totalScans.toString()}
            subtitle="Turnstile uses today"
            icon={QrCode}
          />
          <MetricCard
            title="Today's Energy"
            value={totalEnergy.toFixed(1)}
            subtitle="kWh produced today"
            icon={Zap}
          />
          <MetricCard
            title="Total Scans Today"
            value={uniqueScans.toString()}
            subtitle="Unique scans today"
            icon={Users}
          />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          <UsageChart />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-primary/20 p-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">How It Works</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Each time someone scans their QR code and passes through the turnstile, 
              mechanical energy is converted into electricity. This energy is stored 
              and used to power facility lighting and equipment.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-accent/20 p-2">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Environmental Impact</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This month's energy generation is equivalent to reducing CO₂ emissions 
              by 142 kg and powering a typical home for 3.2 days. Every scan makes 
              a difference!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            EcoTurn System - Transforming movement into sustainable energy
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

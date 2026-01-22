import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";

export const UsageChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadChartData();
    
    // Refresh chart data every 30 seconds
    const interval = setInterval(loadChartData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadChartData = async () => {
    try {
      // Get data from last 7 days
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data: scans } = await supabase
        .from("scans")
        .select("energy_generated, scanned_at")
        .gte("scanned_at", sevenDaysAgo.toISOString())
        .order("scanned_at", { ascending: true });

      if (scans && scans.length > 0) {
        // Group by day
        const dailyData = new Map();
        
        scans.forEach((scan: any) => {
          const day = format(new Date(scan.scanned_at), "MMM dd");
          if (!dailyData.has(day)) {
            dailyData.set(day, { time: day, scans: 0, energy: 0 });
          }
          const existing = dailyData.get(day);
          existing.scans += 1;
          existing.energy += Number(scan.energy_generated);
        });

        setChartData(Array.from(dailyData.values()));
      } else {
        // Show empty state with last 7 days
        const emptyData = [];
        for (let i = 6; i >= 0; i--) {
          const day = subDays(new Date(), i);
          emptyData.push({
            time: format(day, "MMM dd"),
            scans: 0,
            energy: 0
          });
        }
        setChartData(emptyData);
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Usage & Energy Trends</h3>
          <p className="text-sm text-muted-foreground">Last 7 days activity</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Area 
              type="monotone" 
              dataKey="scans" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorScans)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="energy" 
              stroke="hsl(var(--accent))" 
              fillOpacity={1} 
              fill="url(#colorEnergy)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">Turnstile Scans</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-muted-foreground">Energy (kWh)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

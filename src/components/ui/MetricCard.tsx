import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-card/80">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          {trend && (
            <div className={`text-xs font-medium ${trend.isPositive ? "text-success" : "text-destructive"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </div>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};

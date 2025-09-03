import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
    label: string;
  };
  status?: 'success' | 'warning' | 'destructive' | 'default';
  className?: string;
}

export const MetricsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: IconComponent, 
  trend, 
  status = 'default',
  className 
}: MetricsCardProps) => {
  const statusStyles = {
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    destructive: 'border-destructive/20 bg-destructive/5',
    default: 'border-border'
  };

  const iconStyles = {
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
    default: 'text-primary bg-primary/10'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-elevated",
      statusStyles[status],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    trend.direction === 'up' && status === 'success' && "bg-success/10 text-success",
                    trend.direction === 'down' && status === 'destructive' && "bg-destructive/10 text-destructive",
                    trend.direction === 'stable' && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend.direction === 'up' && '↗'}
                  {trend.direction === 'down' && '↘'}
                  {trend.direction === 'stable' && '→'}
                  {trend.value}
                </Badge>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            iconStyles[status]
          )}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
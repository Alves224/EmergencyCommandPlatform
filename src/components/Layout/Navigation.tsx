import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Shield,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Map,
  Truck,
  DoorOpen,
  Users,
  BarChart3,
  Settings,
  Camera,
  Radio,
  Gauge
} from "lucide-react";

interface NavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isArabic: boolean;
}

const modules = [
  {
    id: 'dashboard',
    icon: Gauge,
    label: { en: 'Dashboard', ar: 'لوحة التحكم' },
    badge: null
  },
  {
    id: 'incidents',
    icon: AlertTriangle,
    label: { en: 'Incidents', ar: 'الحوادث' },
    badge: 2
  },
  {
    id: 'tasks',
    icon: CheckSquare,
    label: { en: 'Tasks & SOPs', ar: 'المهام والإجراءات' },
    badge: 5
  },
  {
    id: 'comms',
    icon: MessageSquare,
    label: { en: 'Comms Hub', ar: 'مركز الاتصالات' },
    badge: null
  },
  {
    id: 'situational',
    icon: Map,
    label: { en: 'Situational Awareness', ar: 'الوعي الموقفي' },
    badge: null
  },
  {
    id: 'dispatch',
    icon: Truck,
    label: { en: 'Dispatch & Resources', ar: 'الإرسال والموارد' },
    badge: null
  },
  {
    id: 'access',
    icon: DoorOpen,
    label: { en: 'Access & Perimeter', ar: 'الوصول والمحيط' },
    badge: null
  },
  {
    id: 'muster',
    icon: Users,
    label: { en: 'Muster & Headcount', ar: 'التجمع والعدد' },
    badge: null
  },
  {
    id: 'reporting',
    icon: BarChart3,
    label: { en: 'Reporting & AAR', ar: 'التقارير والمراجعة' },
    badge: null
  },
  {
    id: 'admin',
    icon: Settings,
    label: { en: 'Admin', ar: 'الإدارة' },
    badge: null
  }
];

export const Navigation = ({ activeModule, onModuleChange, isArabic }: NavigationProps) => {
  return (
    <nav className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Navigation Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-command rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              {isArabic ? "وحدات النظام" : "System Modules"}
            </h2>
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 p-4 space-y-2">
        {modules.map((module) => {
          const IconComponent = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isActive ? "bg-primary text-primary-foreground shadow-command" : "hover:bg-accent",
                isArabic && "flex-row-reverse"
              )}
              onClick={() => onModuleChange(module.id)}
            >
              <IconComponent className="w-4 h-4" />
              <span className="flex-1 text-left">
                {isArabic ? module.label.ar : module.label.en}
              </span>
              {module.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {module.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Integration Status */}
      <div className="p-4 border-t border-border space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground mb-3">
          {isArabic ? "حالة التكامل" : "Integration Status"}
        </h3>
        
        {[
          { icon: Camera, label: isArabic ? "الكاميرات" : "VIDEO", status: "online" },
          { icon: Radio, label: isArabic ? "الراديو" : "RADIO", status: "online" },
          { icon: Gauge, label: isArabic ? "المستشعرات" : "OT/SCADA", status: "limited" },
          { icon: DoorOpen, label: isArabic ? "التحكم" : "ACCESS", status: "offline" }
        ].map((integration, index) => {
          const IconComponent = integration.icon;
          const statusColor = 
            integration.status === 'online' ? 'text-success' :
            integration.status === 'limited' ? 'text-warning' :
            'text-muted-foreground';
          
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <IconComponent className={cn("w-3 h-3", statusColor)} />
              <span className="text-muted-foreground">{integration.label}</span>
              <div className={cn("w-2 h-2 rounded-full ml-auto", 
                integration.status === 'online' ? 'bg-success animate-pulse' :
                integration.status === 'limited' ? 'bg-warning' :
                'bg-muted-foreground/30'
              )} />
            </div>
          );
        })}
      </div>
    </nav>
  );
};
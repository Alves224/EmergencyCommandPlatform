import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricsCard } from "./MetricsCard";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Shield, 
  Radio, 
  Camera,
  Map,
  Activity,
  TrendingUp
} from "lucide-react";
import commandCenterHero from "@/assets/command-center-hero.jpg";

interface DashboardViewProps {
  isArabic: boolean;
}

export const DashboardView = ({ isArabic }: DashboardViewProps) => {
  const currentIncidents = [
    {
      id: '40a27cb5-a26d-4258-b4c3-206aae8ac4f0',
      type: 'Fire',
      priority: 'High',
      site: 'YST',
      status: 'Open',
      openedAt: '2025-09-03T19:55:31.770534Z',
      commander: 'Incident Commander'
    }
  ];

  const recentActivities = [
    { 
      time: '19:55', 
      action: isArabic ? 'تم إنشاء حادث حريق في YST' : 'Fire incident created at YST',
      type: 'incident',
      priority: 'high'
    },
    { 
      time: '19:54', 
      action: isArabic ? 'تم تفعيل فريق Y06' : 'Unit Y06 activated',
      type: 'dispatch',
      priority: 'medium'
    },
    { 
      time: '19:52', 
      action: isArabic ? 'تحديث حالة النظام' : 'System status updated',
      type: 'system',
      priority: 'low'
    },
    { 
      time: '19:50', 
      action: isArabic ? 'اكتمال دورية المحيط' : 'Perimeter patrol completed',
      type: 'patrol',
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-command p-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={commandCenterHero} 
            alt="Command Center" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? "منصة قيادة الطوارئ" : "YSOD Emergency Command Platform"}
          </h1>
          <p className="text-primary-foreground/90 text-lg mb-4">
            {isArabic ? 
              "نظام متكامل لإدارة الأحداث والاستجابة الأمنية" : 
              "Unified incident management and security response system"}
          </p>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Activity className="w-3 h-3 mr-1" />
              {isArabic ? "تشغيلي" : "Operational"}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Shield className="w-3 h-3 mr-1" />
              {isArabic ? "آمن" : "Secure"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title={isArabic ? "الحوادث النشطة" : "Active Incidents"}
          value={1}
          subtitle={isArabic ? "حادث واحد" : "incident"}
          icon={AlertTriangle}
          status="warning"
          trend={{ direction: 'stable', value: '0', label: isArabic ? 'منذ الصباح' : 'since morning' }}
        />
        
        <MetricsCard
          title={isArabic ? "الوحدات المتاحة" : "Available Units"}
          value={8}
          subtitle={isArabic ? "من 12" : "of 12"}
          icon={Shield}
          status="success"
          trend={{ direction: 'up', value: '+2', label: isArabic ? 'منذ الأمس' : 'since yesterday' }}
        />
        
        <MetricsCard
          title={isArabic ? "متوسط وقت الاستجابة" : "Avg Response Time"}
          value="4.2"
          subtitle={isArabic ? "دقائق" : "minutes"}
          icon={Clock}
          status="success"
          trend={{ direction: 'down', value: '-0.8', label: isArabic ? 'تحسن' : 'improved' }}
        />
        
        <MetricsCard
          title={isArabic ? "أشخاص في الموقع" : "Personnel on Site"}
          value={247}
          subtitle={isArabic ? "شخص" : "people"}
          icon={Users}
          status="default"
          trend={{ direction: 'up', value: '+12', label: isArabic ? 'الوردية النهارية' : 'day shift' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Incidents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                {isArabic ? "الحوادث النشطة" : "Active Incidents"}
                <Badge variant="secondary" className="ml-auto">
                  {currentIncidents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentIncidents.length > 0 ? (
                <div className="space-y-4">
                  {currentIncidents.map((incident) => (
                    <div key={incident.id} className="p-4 border border-border rounded-lg bg-warning/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {isArabic ? "عالي" : incident.priority}
                          </Badge>
                          <Badge variant="outline">
                            {incident.type}
                          </Badge>
                          <Badge variant="secondary">
                            {incident.site}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(incident.openedAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2">
                        {isArabic ? 
                          `حريق في منطقة ${incident.site} - تحت السيطرة` :
                          `Fire incident at ${incident.site} - Under control`
                        }
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {isArabic ? "القائد:" : "Commander:"} {incident.commander}
                        </span>
                        <span>
                          {isArabic ? "الحالة:" : "Status:"} 
                          <Badge variant="outline" className="ml-1 text-xs">
                            {isArabic ? "مفتوح" : incident.status}
                          </Badge>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p>{isArabic ? "لا توجد حوادث نشطة" : "No active incidents"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {isArabic ? "النشاط الأخير" : "Recent Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.priority === 'high' ? 'bg-destructive' :
                    activity.priority === 'medium' ? 'bg-warning' :
                    'bg-success'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {isArabic ? "حالة الأنظمة" : "System Status"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                name: isArabic ? "الكاميرات" : "Video Systems", 
                icon: Camera, 
                status: 'online', 
                count: '24/25' 
              },
              { 
                name: isArabic ? "أنظمة الراديو" : "Radio Systems", 
                icon: Radio, 
                status: 'online', 
                count: '12/12' 
              },
              { 
                name: isArabic ? "المستشعرات" : "OT Sensors", 
                icon: Activity, 
                status: 'limited', 
                count: '18/24' 
              },
              { 
                name: isArabic ? "التحكم بالوصول" : "Access Control", 
                icon: Map, 
                status: 'offline', 
                count: '0/8' 
              }
            ].map((system, index) => {
              const IconComponent = system.icon;
              const statusColor = 
                system.status === 'online' ? 'text-success' :
                system.status === 'limited' ? 'text-warning' :
                'text-muted-foreground';
              
              return (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <IconComponent className={`w-8 h-8 ${statusColor}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{system.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{system.count}</p>
                      <div className={`w-2 h-2 rounded-full ${
                        system.status === 'online' ? 'bg-success' :
                        system.status === 'limited' ? 'bg-warning' :
                        'bg-muted-foreground/30'
                      }`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        Saudi Aramco: Company General Use
      </div>
    </div>
  );
};
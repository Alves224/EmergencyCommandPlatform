import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Clock,
  User,
  MapPin,
  Eye,
  Edit,
  Archive
} from "lucide-react";

interface IncidentsViewProps {
  isArabic: boolean;
}

const mockIncidents = [
  {
    id: '40a27cb5-a26d-4258-b4c3-206aae8ac4f0',
    type: 'Fire',
    priority: 'High',
    status: 'Open',
    site: 'YST',
    geo: { lat: 23.9897, lng: 38.2226 },
    openedAt: '2025-09-03T19:55:31.770534Z',
    commanderId: '875e23ef-7cc3-4fe4-8ba9-bef13d456db0',
    commander: 'Incident Commander',
    description: 'Fire incident in process unit - under control'
  },
  {
    id: 'mock-incident-2',
    type: 'Security',
    priority: 'Medium',
    status: 'Contained',
    site: 'NGL',
    geo: { lat: 24.0005, lng: 38.2001 },
    openedAt: '2025-09-03T18:30:00.000Z',
    commanderId: 'mock-commander-2',
    commander: 'Security Supervisor',
    description: 'Perimeter breach detected - resolved'
  },
  {
    id: 'mock-incident-3',
    type: 'Environmental',
    priority: 'Low',
    status: 'Closed',
    site: 'COT',
    geo: { lat: 24.0052, lng: 38.2103 },
    openedAt: '2025-09-03T16:45:00.000Z',
    commanderId: 'mock-commander-3',
    commander: 'Dispatcher 1',
    description: 'Minor oil spill - cleaned up'
  }
];

export const IncidentsView = ({ isArabic }: IncidentsViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Contained': return 'secondary';
      case 'Closed': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isArabic ? "إدارة الحوادث" : "Incident Management"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 
              "مراقبة ومتابعة جميع الحوادث الأمنية والتشغيلية" : 
              "Monitor and manage all security and operational incidents"}
          </p>
        </div>
        <Button className="bg-gradient-command hover:bg-primary/90 shadow-command">
          <Plus className="w-4 h-4 mr-2" />
          {isArabic ? "حادث جديد" : "New Incident"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? "البحث في الحوادث..." : "Search incidents..."}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isArabic ? "حالة الحادث" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? "جميع الحالات" : "All Statuses"}</SelectItem>
                <SelectItem value="Open">{isArabic ? "مفتوح" : "Open"}</SelectItem>
                <SelectItem value="Contained">{isArabic ? "محتوى" : "Contained"}</SelectItem>
                <SelectItem value="Closed">{isArabic ? "مغلق" : "Closed"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isArabic ? "الأولوية" : "Priority"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? "جميع الأولويات" : "All Priorities"}</SelectItem>
                <SelectItem value="High">{isArabic ? "عالي" : "High"}</SelectItem>
                <SelectItem value="Medium">{isArabic ? "متوسط" : "Medium"}</SelectItem>
                <SelectItem value="Low">{isArabic ? "منخفض" : "Low"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-elevated transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={getPriorityColor(incident.priority)}>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {isArabic ? 
                        (incident.priority === 'High' ? 'عالي' : incident.priority === 'Medium' ? 'متوسط' : 'منخفض') :
                        incident.priority
                      }
                    </Badge>
                    <Badge variant="outline">
                      {incident.type}
                    </Badge>
                    <Badge variant="secondary">
                      {incident.site}
                    </Badge>
                    <Badge variant={getStatusColor(incident.status)}>
                      {isArabic ?
                        (incident.status === 'Open' ? 'مفتوح' : incident.status === 'Contained' ? 'محتوى' : 'مغلق') :
                        incident.status
                      }
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-foreground font-medium">
                    {isArabic ? 
                      `حادث ${incident.type} في ${incident.site}` :
                      incident.description
                    }
                  </p>

                  {/* Details */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(incident.openedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {incident.commander}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {incident.geo.lat.toFixed(4)}, {incident.geo.lng.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {incident.status === 'Closed' && (
                    <Button variant="ghost" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {isArabic ? "لم يتم العثور على حوادث" : "No incidents found"}
            </h3>
            <p className="text-muted-foreground">
              {isArabic ? 
                "لا توجد حوادث تطابق معايير البحث المحددة" :
                "No incidents match the current search criteria"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        Saudi Aramco: Company General Use
      </div>
    </div>
  );
};
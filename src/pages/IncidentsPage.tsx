import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Clock, AlertTriangle } from 'lucide-react';
import { IncidentTimeline } from '@/components/IncidentTimeline';
import { CameraWall } from '@/components/CameraWall';
import { useI18n } from '@/providers/I18nProvider';
import type { Incident, TimelineEntry, Camera, User } from '@/types';

export default function IncidentsPage() {
  const { t } = useI18n();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Contained' | 'Closed'>('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incidentsRes, timelineRes, camerasRes, usersRes] = await Promise.all([
        fetch('/seeds/incidents.json'),
        fetch('/seeds/incident_timeline.json'),
        fetch('/seeds/cameras.json'),
        fetch('/seeds/users.json')
      ]);

      setIncidents(await incidentsRes.json());
      setTimeline(await timelineRes.json());
      setCameras(await camerasRes.json());
      setUsers(await usersRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.site.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Contained': return 'secondary';
      case 'Closed': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="flex h-full">
      {/* Incidents List */}
      <div className="w-1/3 border-r border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('incidents.title')}</h1>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('incidents.new')}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Open">{t('incidents.status.open')}</SelectItem>
              <SelectItem value="Contained">{t('incidents.status.contained')}</SelectItem>
              <SelectItem value="Closed">{t('incidents.status.closed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Incidents List */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredIncidents.map((incident) => (
            <Card 
              key={incident.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedIncident?.id === incident.id ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => setSelectedIncident(incident)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{incident.type}</span>
                  </div>
                  <Badge variant={getPriorityColor(incident.priority)}>
                    {incident.priority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{incident.site}</span>
                    <Badge variant={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.openedAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Incident Details */}
      <div className="flex-1 flex flex-col">
        {selectedIncident ? (
          <>
            {/* Incident Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">
                  {selectedIncident.type} - {selectedIncident.site}
                </h2>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(selectedIncident.priority)}>
                    {selectedIncident.priority}
                  </Badge>
                  <Badge variant={getStatusColor(selectedIncident.status)}>
                    {selectedIncident.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Opened: {new Date(selectedIncident.openedAt).toLocaleString()}
                {selectedIncident.geo && (
                  <span className="ml-4">
                    Location: {selectedIncident.geo.lat.toFixed(4)}, {selectedIncident.geo.lng.toFixed(4)}
                  </span>
                )}
              </p>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 grid grid-cols-2">
              <div className="p-4 border-r border-border">
                <h3 className="text-lg font-semibold mb-4">{t('timeline.title')}</h3>
                <IncidentTimeline 
                  entries={timeline.filter(e => e.incidentId === selectedIncident.id)}
                  users={users}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">{t('cameras.title')}</h3>
                <CameraWall 
                  cameras={cameras.filter(c => c.site === selectedIncident.site).slice(0, 4)}
                  onBookmark={(cameraId) => console.log('Bookmark camera:', cameraId)}
                  onPTZ={(cameraId, cmd) => console.log('PTZ command:', cameraId, cmd)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select an incident to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, User, Truck, Shield, AlertTriangle } from 'lucide-react';
import { GoogleMap } from '@/components/GoogleMap';
import { useI18n } from '@/providers/I18nProvider';
import type { Unit, Asset, Incident } from '@/types';

export default function DispatchPage() {
  const { t } = useI18n();
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<string>('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [unitsRes, assetsRes, incidentsRes] = await Promise.all([
        fetch('/seeds/units.json'),
        fetch('/seeds/assets.json'),
        fetch('/seeds/incidents.json')
      ]);

      setUnits(await unitsRes.json());
      setAssets(await assetsRes.json());
      setIncidents(await incidentsRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'default';
      case 'EnRoute': return 'secondary';
      case 'OnScene': return 'destructive';
      case 'Busy': return 'outline';
      case 'OffDuty': return 'outline';
      default: return 'outline';
    }
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'VehiclePatrol': return Truck;
      case 'FootPatrol': return User;
      case 'FixedPost': return Shield;
      default: return MapPin;
    }
  };

  const dispatchUnits = () => {
    if (!selectedIncident || selectedUnits.length === 0) return;

    setUnits(prev => prev.map(unit => {
      if (selectedUnits.includes(unit.id)) {
        return { ...unit, status: 'Busy' as const };
      }
      return unit;
    }));

    setSelectedUnits([]);
    console.log('Dispatched units:', selectedUnits, 'to incident:', selectedIncident);
  };

  const getMapMarkers = () => {
    const markers = [];

    // Add unit markers
    units.forEach(unit => {
      if (unit.lastGeo) {
        const UnitIcon = getUnitIcon(unit.type);
        markers.push({
          id: unit.id,
          type: 'unit',
          position: unit.lastGeo,
          title: `${unit.callsign} - ${unit.type}`,
          status: unit.status,
          icon: UnitIcon
        });
      }
    });

    // Add incident markers
    incidents.forEach(incident => {
      if (incident.geo && incident.status === 'Open') {
        markers.push({
          id: incident.id,
          type: 'incident',
          position: incident.geo,
          title: `${incident.type} - ${incident.site}`,
          priority: incident.priority
        });
      }
    });

    return markers;
  };

  return (
    <div className="h-full flex">
      {/* Control Panel */}
      <div className="w-96 border-r border-border p-4 space-y-4">
        <h1 className="text-2xl font-bold">{t('nav.dispatch')}</h1>

        {/* Dispatch Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dispatch Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedIncident} onValueChange={setSelectedIncident}>
              <SelectTrigger>
                <SelectValue placeholder="Select incident..." />
              </SelectTrigger>
              <SelectContent>
                {incidents
                  .filter(i => i.status === 'Open')
                  .map(incident => (
                    <SelectItem key={incident.id} value={incident.id}>
                      {incident.type} - {incident.site}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="text-sm font-medium">Available Units:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {units
                .filter(u => u.status === 'Available')
                .map(unit => {
                  const UnitIcon = getUnitIcon(unit.type);
                  return (
                    <div
                      key={unit.id}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        selectedUnits.includes(unit.id) 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedUnits(prev => 
                          prev.includes(unit.id)
                            ? prev.filter(id => id !== unit.id)
                            : [...prev, unit.id]
                        );
                      }}
                    >
                      <UnitIcon className="w-4 h-4" />
                      <span className="font-medium">{unit.callsign}</span>
                      <Badge variant="outline" className="ml-auto">
                        {unit.type}
                      </Badge>
                    </div>
                  );
                })}
            </div>

            <Button 
              onClick={dispatchUnits}
              disabled={!selectedIncident || selectedUnits.length === 0}
              className="w-full"
            >
              Dispatch ({selectedUnits.length}) Units
            </Button>
          </CardContent>
        </Card>

        {/* Unit Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Unit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Available', 'Busy', 'OffDuty', 'Emergency'].map(status => {
                const count = units.filter(u => u.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm">{status}</span>
                    <Badge variant={getStatusColor(status)}>
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Tabs defaultValue="map" className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent">
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="units">Units List</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="flex-1 p-0 m-0">
            <GoogleMap
              markers={getMapMarkers()}
              center={{ lat: 24.0, lng: 38.2 }}
              zoom={12}
              onMarkerClick={(marker) => console.log('Marker clicked:', marker)}
            />
          </TabsContent>

          <TabsContent value="units" className="flex-1 p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Units Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map(unit => {
                  const UnitIcon = getUnitIcon(unit.type);
                  return (
                    <Card key={unit.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <UnitIcon className="w-5 h-5" />
                            <span className="font-semibold">{unit.callsign}</span>
                          </div>
                          <Badge variant={getStatusColor(unit.status)}>
                            {unit.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Type: {unit.type}</div>
                          <div>Site: {unit.site}</div>
                          {unit.lastGeo && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {unit.lastGeo.lat.toFixed(4)}, {unit.lastGeo.lng.toFixed(4)}
                            </div>
                          )}
                          <div>Capabilities: {unit.capabilities.join(', ')}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="flex-1 p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Asset Registry</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map(asset => (
                  <Card key={asset.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{asset.tag}</span>
                        <Badge variant={asset.status === 'InService' ? 'default' : 'outline'}>
                          {asset.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Type: {asset.type}</div>
                        <div>Site: {asset.site}</div>
                        {asset.assignedTo && (
                          <div>Assigned: {asset.assignedTo}</div>
                        )}
                        {asset.metadataJSON && Object.keys(asset.metadataJSON).length > 0 && (
                          <div>
                            Metadata: {JSON.stringify(asset.metadataJSON)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
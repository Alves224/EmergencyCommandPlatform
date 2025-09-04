import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Camera as CameraIcon, Shield, Users, Activity } from 'lucide-react';
import { GoogleMap } from '@/components/GoogleMap';
import { CameraWall } from '@/components/CameraWall';
import { useI18n } from '@/providers/I18nProvider';
import type { Incident, Camera, Unit, Gate, Geofence, Sensor } from '@/types';

export default function SituationalAwarenessPage() {
  const { t } = useI18n();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedLayers, setSelectedLayers] = useState({
    incidents: true,
    units: true,
    cameras: true,
    gates: true,
    geofences: true,
    sensors: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incidentsRes, camerasRes, unitsRes, gatesRes, geofencesRes, sensorsRes] = await Promise.all([
        fetch('/seeds/incidents.json'),
        fetch('/seeds/cameras.json'),
        fetch('/seeds/units.json'),
        fetch('/seeds/gates.json'),
        fetch('/seeds/geofences.json'),
        fetch('/seeds/sensors.json')
      ]);

      setIncidents(await incidentsRes.json());
      setCameras(await camerasRes.json());
      setUnits(await unitsRes.json());
      setGates(await gatesRes.json());
      setGeofences(await geofencesRes.json());
      setSensors(await sensorsRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const toggleLayer = (layer: keyof typeof selectedLayers) => {
    setSelectedLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const getMapMarkers = () => {
    const markers = [];

    if (selectedLayers.incidents) {
      incidents.forEach(incident => {
        if (incident.geo) {
          markers.push({
            id: incident.id,
            type: 'incident',
            position: incident.geo,
            title: `${incident.type} - ${incident.site}`,
            status: incident.status,
            priority: incident.priority
          });
        }
      });
    }

    if (selectedLayers.units) {
      units.forEach(unit => {
        if (unit.lastGeo) {
          markers.push({
            id: unit.id,
            type: 'unit',
            position: unit.lastGeo,
            title: `${unit.callsign} - ${unit.type}`,
            status: unit.status
          });
        }
      });
    }

    if (selectedLayers.cameras) {
      cameras.forEach(camera => {
        markers.push({
          id: camera.id,
          type: 'camera',
          position: camera.location,
          title: camera.name,
          ptzCapable: camera.ptzCapable
        });
      });
    }

    if (selectedLayers.gates) {
      gates.forEach(gate => {
        markers.push({
          id: gate.id,
          type: 'gate',
          position: gate.location,
          title: gate.name,
          controlPolicy: gate.controlPolicy
        });
      });
    }

    return markers;
  };

  const onMarkerClick = useCallback((marker: any) => {
    console.log('Marker clicked:', marker);
  }, []);

  return (
    <div className="h-full flex">
      {/* Map Controls */}
      <div className="w-80 border-r border-border p-4 space-y-4">
        <h1 className="text-2xl font-bold">{t('nav.situational')}</h1>
        
        {/* Layer Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Map Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(selectedLayers).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize">{key}</span>
                <Button
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLayer(key as keyof typeof selectedLayers)}
                >
                  {enabled ? "On" : "Off"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Live Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4" />
                Open Incidents
              </span>
              <Badge variant="destructive">
                {incidents.filter(i => i.status === 'Open').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                Units Available
              </span>
              <Badge variant="default">
                {units.filter(u => u.status === 'Available').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <CameraIcon className="w-4 h-4" />
                Cameras Online
              </span>
              <Badge variant="secondary">
                {cameras.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                Gates Secure
              </span>
              <Badge variant="outline">
                {gates.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Tabs defaultValue="map" className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent">
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="cameras">Camera Wall</TabsTrigger>
            <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="flex-1 p-0 m-0">
            <GoogleMap
              markers={getMapMarkers()}
              onMarkerClick={onMarkerClick}
              center={{ lat: 24.0, lng: 38.2 }}
              zoom={12}
            />
          </TabsContent>

          <TabsContent value="cameras" className="flex-1 p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t('cameras.title')}</h2>
              <CameraWall 
                cameras={cameras}
                onBookmark={(cameraId) => console.log('Bookmark camera:', cameraId)}
                onPTZ={(cameraId, cmd) => console.log('PTZ command:', cameraId, cmd)}
              />
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="flex-1 p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Sensor Telemetry</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensors.map((sensor) => (
                  <Card key={sensor.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">{sensor.type}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Site: {sensor.site}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Location: {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
                        </div>
                        <div className="text-2xl font-mono">
                          -- {/* Placeholder for real sensor data */}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Endpoint: {sensor.readOnlyEndpoint}
                        </div>
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
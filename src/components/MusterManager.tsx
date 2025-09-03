// YSOD Emergency Command Platform - Muster & Headcount Manager
// Personnel accountability system for emergency response
// Saudi Aramco: Company General Use

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  MapPin, 
  Scan, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Download,
  UserCheck
} from 'lucide-react'
import type { MusterZone, HeadcountRecord, Geofence } from '@/types'
import { useI18n } from '@/providers/I18nProvider'
import { pointInPolygon } from '@/lib/geo'

interface MusterManagerProps {
  zones: MusterZone[]
  geofences: Geofence[]
  records: HeadcountRecord[]
  onCheckIn?: (zoneId: string, personId: string, coords?: { lat: number; lng: number }) => void
  onExportReport?: () => void
  onAllClear?: () => void
}

export function MusterManager({ 
  zones, 
  geofences, 
  records, 
  onCheckIn, 
  onExportReport,
  onAllClear 
}: MusterManagerProps) {
  const { t } = useI18n()
  const [scanInput, setScanInput] = useState('')
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Calculate headcount per zone
  const zoneCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const record of records) {
      counts.set(record.zoneId, (counts.get(record.zoneId) || 0) + 1)
    }
    return counts
  }, [records])

  // Get GPS location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('GPS error:', error)
        }
      )
    }
  }

  // Handle check-in
  const handleCheckIn = (zoneId: string) => {
    if (!scanInput.trim()) return

    const personId = scanInput.trim()
    
    // Validate location if GPS is available
    if (currentLocation) {
      const zone = zones.find(z => z.id === zoneId)
      const geofence = zone?.geofenceId ? geofences.find(g => g.id === zone.geofenceId) : null
      
      if (geofence && !pointInPolygon(currentLocation, geofence.polygon)) {
        alert('You are not within the designated muster zone')
        return
      }
    }

    onCheckIn?.(zoneId, personId, currentLocation || undefined)
    setScanInput('')
  }

  // Check if all zones have minimum personnel
  const allClearStatus = useMemo(() => {
    const totalPersonnel = records.length
    const zonesWithPersonnel = Array.from(zoneCounts.keys()).length
    return {
      total: totalPersonnel,
      zones: zonesWithPersonnel,
      canClear: totalPersonnel > 0 && zonesWithPersonnel === zones.length
    }
  }, [records, zoneCounts, zones])

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{records.length}</div>
            <div className="text-sm text-muted-foreground">Total Personnel</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">{Array.from(zoneCounts.keys()).length}</div>
            <div className="text-sm text-muted-foreground">Active Zones</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">
              {records.length > 0 ? Math.round((Date.now() - new Date(records[0].time).getTime()) / 60000) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Minutes Elapsed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            {allClearStatus.canClear ? (
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
            ) : (
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning" />
            )}
            <div className="text-sm font-medium">
              {allClearStatus.canClear ? 'Ready for All Clear' : 'Muster in Progress'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Muster Zones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t('muster.zones')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {zones.map((zone) => {
                  const count = zoneCounts.get(zone.id) || 0
                  const geofence = zone.geofenceId ? geofences.find(g => g.id === zone.geofenceId) : null
                  
                  return (
                    <div key={zone.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{zone.name}</h4>
                          <p className="text-xs text-muted-foreground">{zone.site}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={count > 0 ? 'default' : 'secondary'}>
                            <Users className="w-3 h-3 mr-1" />
                            {count}
                          </Badge>
                          {geofence && (
                            <Badge variant="outline" className="text-xs">
                              GPS
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant={selectedZone === zone.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedZone(zone.id)}
                        className="w-full"
                      >
                        {t('muster.checkin')} {zone.name}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Check-in Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              {t('muster.scan')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Scan badge or enter Employee ID"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && selectedZone && scanInput.trim()) {
                    handleCheckIn(selectedZone)
                  }
                }}
              />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={!navigator.geolocation}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Get GPS
                </Button>
                
                {currentLocation && (
                  <Badge variant="default" className="text-xs">
                    GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              disabled={!selectedZone || !scanInput.trim()}
              onClick={() => selectedZone && handleCheckIn(selectedZone)}
              className="w-full"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Check In Personnel
            </Button>

            {selectedZone && (
              <div className="text-sm text-muted-foreground">
                Selected: {zones.find(z => z.id === selectedZone)?.name}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recent Check-ins
                <Badge variant="secondary">{records.length}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onExportReport}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                
                <Button 
                  variant={allClearStatus.canClear ? 'default' : 'secondary'}
                  size="sm"
                  disabled={!allClearStatus.canClear}
                  onClick={onAllClear}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t('muster.all_clear')}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {[...records]
                  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                  .slice(0, 20)
                  .map((record) => {
                    const zone = zones.find(z => z.id === record.zoneId)
                    return (
                      <div key={record.id} className="flex items-center justify-between p-2 border border-border rounded">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-success" />
                          <span className="font-medium text-sm">{record.personId}</span>
                          <Badge variant="outline" className="text-xs">
                            {zone?.name || 'Unknown Zone'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(record.time).toLocaleTimeString()}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
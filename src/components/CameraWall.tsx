// YSOD Emergency Command Platform - Camera Wall Component
// Live video feeds with PTZ controls and timeline bookmarking
// Saudi Aramco: Company General Use

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  ZoomIn, 
  ZoomOut,
  Play,
  Pause,
  Maximize
} from 'lucide-react'
import type { Camera as CameraType } from '@/types'
import { useI18n } from '@/providers/I18nProvider'
import { formatCoordinates } from '@/lib/geo'

interface CameraWallProps {
  cameras: CameraType[]
  onBookmark?: (cameraId: string) => void
  onPTZ?: (cameraId: string, cmd: 'left' | 'right' | 'up' | 'down' | 'zoomIn' | 'zoomOut') => void
  onFullscreen?: (cameraId: string) => void
  columns?: number
}

export function CameraWall({ 
  cameras, 
  onBookmark, 
  onPTZ, 
  onFullscreen,
  columns = 3 
}: CameraWallProps) {
  const { t } = useI18n()
  const [playingCameras, setPlayingCameras] = useState<Set<string>>(new Set())

  const togglePlay = (cameraId: string) => {
    setPlayingCameras(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cameraId)) {
        newSet.delete(cameraId)
      } else {
        newSet.add(cameraId)
      }
      return newSet
    })
  }

  const PTZButton = ({ 
    cameraId, 
    command, 
    icon: Icon, 
    disabled = false 
  }: { 
    cameraId: string
    command: 'left' | 'right' | 'up' | 'down' | 'zoomIn' | 'zoomOut'
    icon: React.ElementType
    disabled?: boolean
  }) => (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={() => onPTZ?.(cameraId, command)}
      className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-black/40"
    >
      <Icon className="w-4 h-4" />
    </Button>
  )

  if (cameras.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Camera className="w-12 h-12 mx-auto mb-4" />
          <p>No cameras available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`grid gap-3 ${
      columns === 1 ? 'grid-cols-1' :
      columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
      columns === 3 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' :
      'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
    }`}>
      {cameras.map((camera) => {
        const isPlaying = playingCameras.has(camera.id)
        
        return (
          <Card key={camera.id} className="overflow-hidden group">
            <CardContent className="p-0">
              {/* Video Feed */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {/* Mock video player - replace with actual HLS/WebRTC implementation */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{camera.name}</p>
                    <p className="text-xs">{camera.site}</p>
                  </div>
                </div>

                {/* Video controls overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Play/Pause */}
                  <div className="absolute top-4 left-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePlay(camera.id)}
                      className="text-white/80 hover:text-white hover:bg-black/40"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Fullscreen */}
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFullscreen?.(camera.id)}
                      className="text-white/80 hover:text-white hover:bg-black/40"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* PTZ Controls */}
                  {camera.ptzCapable && onPTZ && (
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-black/60 rounded-lg p-2 grid grid-cols-3 gap-1">
                        {/* Top row */}
                        <div></div>
                        <PTZButton cameraId={camera.id} command="up" icon={ChevronUp} />
                        <div></div>
                        
                        {/* Middle row */}
                        <PTZButton cameraId={camera.id} command="left" icon={ChevronLeft} />
                        <div></div>
                        <PTZButton cameraId={camera.id} command="right" icon={ChevronRight} />
                        
                        {/* Bottom row */}
                        <PTZButton cameraId={camera.id} command="zoomOut" icon={ZoomOut} />
                        <PTZButton cameraId={camera.id} command="down" icon={ChevronDown} />
                        <PTZButton cameraId={camera.id} command="zoomIn" icon={ZoomIn} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status indicators */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {isPlaying && (
                    <Badge variant="default" className="text-xs bg-red-600">
                      LIVE
                    </Badge>
                  )}
                  {camera.ptzCapable && (
                    <Badge variant="secondary" className="text-xs">
                      PTZ
                    </Badge>
                  )}
                </div>
              </div>

              {/* Camera info and controls */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{camera.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatCoordinates(camera.location.lat, camera.location.lng)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {camera.site}
                  </Badge>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {camera.ptzCapable ? 'PTZ Camera' : 'Fixed Camera'}
                  </div>
                  
                  {onBookmark && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBookmark(camera.id)}
                      className="h-8 px-2"
                    >
                      <Bookmark className="w-3 h-3 mr-1" />
                      <span className="text-xs">{t('cameras.bookmark')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
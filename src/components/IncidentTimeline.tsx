// YSOD Emergency Command Platform - Incident Timeline Component
// Immutable hash-chained timeline with integrity verification
// Saudi Aramco: Company General Use

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, ShieldAlert, Eye, EyeOff, Hash } from 'lucide-react'
import type { TimelineEntry, User } from '@/types'
import { useI18n } from '@/providers/I18nProvider'
import { verifyTimelineIntegrity } from '@/lib/hashChain'

interface IncidentTimelineProps {
  entries: TimelineEntry[]
  users: User[]
  showHashes?: boolean
}

export function IncidentTimeline({ entries, users, showHashes = false }: IncidentTimelineProps) {
  const { t } = useI18n()
  const [hashesVisible, setHashesVisible] = useState(showHashes)
  const [integrity, setIntegrity] = useState<{ valid: boolean; error?: string }>({ valid: true })

  const sortedEntries = useMemo(() => 
    [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), 
    [entries]
  )

  const userMap = useMemo(() => 
    new Map(users.map((u) => [u.id, u])), 
    [users]
  )

  // Verify timeline integrity on load
  React.useEffect(() => {
    if (entries.length > 0) {
      verifyTimelineIntegrity(entries).then(setIntegrity)
    }
  }, [entries])

  const getActionIcon = (actionType: TimelineEntry['actionType']) => {
    switch (actionType) {
      case 'Created': return '🆕'
      case 'StatusChanged': return '🔄'
      case 'AssignUnits': return '👥'
      case 'Note': return '📝'
      case 'MediaAttached': return '📎'
      case 'CameraBookmarked': return '📹'
      case 'PTZCommand': return '🎮'
      case 'ControlRequested': return '🔐'
      case 'ControlApproved': return '✅'
      case 'ControlExecuted': return '⚡'
      default: return '📋'
    }
  }

  const formatActionType = (actionType: TimelineEntry['actionType']) => {
    return t(`timeline.actions.${actionType.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase()}`)
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>{t('timeline.no_entries')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {integrity.valid ? (
              <Shield className="w-5 h-5 text-success" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-destructive" />
            )}
            {t('timeline.title')}
            <Badge variant={integrity.valid ? 'default' : 'destructive'} className="text-xs">
              {integrity.valid ? t('timeline.hash_verified') : t('timeline.hash_corrupted')}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHashesVisible(!hashesVisible)}
            className="text-xs"
          >
            {hashesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <Hash className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {sortedEntries.map((entry, idx) => {
              const user = userMap.get(entry.actorId)
              const isLast = idx === sortedEntries.length - 1

              return (
                <div key={entry.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                        {getActionIcon(entry.actionType)}
                      </div>
                      {!isLast && <div className="w-px h-6 bg-border mt-2" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {user?.name || 'Unknown User'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {formatActionType(entry.actionType)}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="bg-muted/40 rounded-md p-3">
                        <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(entry.detailsJSON, null, 2)}
                        </pre>
                      </div>

                      {/* Media attachments */}
                      {entry.media && entry.media.length > 0 && (
                        <div className="flex gap-2">
                          {entry.media.map((media, mediaIdx) => (
                            <Badge key={mediaIdx} variant="outline" className="text-xs">
                              {media.kind}: {media.url}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Hash information */}
                      {hashesVisible && (
                        <div className="text-[10px] text-muted-foreground space-y-1 font-mono">
                          <div className="break-all">
                            <span className="font-semibold">Prev:</span> {entry.prevHash || 'null'}
                          </div>
                          <div className="break-all">
                            <span className="font-semibold">Hash:</span> {entry.hash}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isLast && <Separator className="my-2" />}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
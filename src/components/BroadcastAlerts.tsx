// Emergency Command Platform - Broadcast Alerts Component
// Multi-channel emergency communications

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RadioIcon, MessageSquare, Mail, Smartphone, AlertTriangle } from 'lucide-react'
import type { Notification, SiteCode, UserRole, User } from '@/types'
import { useI18n } from '@/providers/I18nProvider'
import { canBroadcast } from '@/lib/abac'

interface BroadcastAlertsProps {
  currentUser?: User
  onSendBroadcast?: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>
  recentAlerts?: Notification[]
}

const SITE_OPTIONS: (SiteCode | 'ALL')[] = ['ALL', 'SITE-A', 'SITE-B', 'SITE-C', 'SITE-D', 'SITE-E', 'SITE-F']
const ROLE_OPTIONS: (UserRole | 'ALL')[] = ['ALL', 'IncidentCommander', 'Dispatcher', 'FieldResponder', 'SecuritySupervisor', 'ComplianceLegal', 'Viewer']

export function BroadcastAlerts({ currentUser, onSendBroadcast, recentAlerts = [] }: BroadcastAlertsProps) {
  const { t } = useI18n()
  const [site, setSite] = useState<SiteCode | 'ALL'>('ALL')
  const [role, setRole] = useState<UserRole | 'ALL'>('ALL')
  const [channel, setChannel] = useState<'push' | 'sms' | 'email'>('push')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSend = canBroadcast(currentUser) && message.trim().length > 0

  const handleSendBroadcast = async () => {
    if (!canSend || !onSendBroadcast) return

    setIsSubmitting(true)
    try {
      await onSendBroadcast({
        site: site === 'ALL' ? undefined : site,
        role: role === 'ALL' ? undefined : role,
        channel,
        message: message.trim()
      })
      
      // Reset form
      setMessage('')
      setPriority('normal')
    } catch (error) {
      console.error('Failed to send broadcast:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push': return <Smartphone className="w-4 h-4" />
      case 'sms': return <MessageSquare className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      default: return <RadioIcon className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Broadcast Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RadioIcon className="w-5 h-5" />
            {t('broadcast.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canSend && message.trim().length === 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Enter a message to send broadcast alerts to personnel
              </p>
            </div>
          )}

          {currentUser && !canBroadcast(currentUser) && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
              <p className="text-sm text-warning-foreground">
                Insufficient permissions to send broadcast alerts
              </p>
            </div>
          )}

          {/* Targeting */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('broadcast.site')}</label>
              <Select value={site} onValueChange={(v: any) => setSite(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITE_OPTIONS.map(s => (
                    <SelectItem key={s} value={s}>
                      {s === 'ALL' ? t('broadcast.all') : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('broadcast.role')}</label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(r => (
                    <SelectItem key={r} value={r}>
                      {r === 'ALL' ? t('broadcast.all') : r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('broadcast.channel')}</label>
              <Select value={channel} onValueChange={(v: any) => setChannel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('broadcast.message')}</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your broadcast message..."
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{message.length}/500 characters</span>
              {priority !== 'normal' && (
                <Badge variant={getPriorityColor(priority)} className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {priority.toUpperCase()} PRIORITY
                </Badge>
              )}
            </div>
          </div>

          {/* Send Button */}
          <Button 
            disabled={!canSend || isSubmitting} 
            onClick={handleSendBroadcast}
            className="w-full md:w-auto"
          >
            {getChannelIcon(channel)}
            <span className="ml-2">
              {isSubmitting ? 'Sending...' : t('broadcast.send')}
            </span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Broadcasts
              <Badge variant="secondary">{recentAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(alert.channel)}
                      <span className="text-sm font-medium">
                        {alert.site || 'ALL'} • {alert.role || 'ALL'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

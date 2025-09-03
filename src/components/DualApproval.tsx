// YSOD Emergency Command Platform - Dual Approval Component
// Secure control actions requiring two authorized approvers
// Saudi Aramco: Company General Use

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldCheck, ShieldX, Clock } from 'lucide-react'
import type { User, DualApprovalRequest } from '@/types'
import { useI18n } from '@/providers/I18nProvider'
import { canApprove, requireRole } from '@/lib/abac'

interface DualApprovalProps {
  currentUser?: User
  supervisors: User[]
  commanders: User[]
  onSubmitRequest?: (request: Omit<DualApprovalRequest, 'id' | 'createdAt' | 'status'>) => void
  pendingRequests?: DualApprovalRequest[]
}

export function DualApproval({ 
  currentUser, 
  supervisors, 
  commanders, 
  onSubmitRequest,
  pendingRequests = []
}: DualApprovalProps) {
  const { t } = useI18n()
  const [gateId, setGateId] = useState('')
  const [action, setAction] = useState<'lock' | 'unlock' | 'announce' | 'emergency_open'>('lock')
  const [approverSupervisor, setApproverSupervisor] = useState('')
  const [approverCommander, setApproverCommander] = useState('')

  const canRequest = useMemo(() => 
    requireRole(currentUser, ['Dispatcher', 'SecuritySupervisor', 'IncidentCommander']), 
    [currentUser]
  )

  const isFormValid = gateId.trim() && approverSupervisor && approverCommander

  const handleSubmitRequest = async () => {
    if (!isFormValid || !currentUser) return

    const request: Omit<DualApprovalRequest, 'id' | 'createdAt' | 'status'> = {
      requesterId: currentUser.id,
      gateId: gateId.trim(),
      action,
      approvals: [
        { userId: approverSupervisor, role: 'SecuritySupervisor' },
        { userId: approverCommander, role: 'IncidentCommander' }
      ]
    }

    try {
      await onSubmitRequest?.(request)
      
      // Reset form
      setGateId('')
      setApproverSupervisor('')
      setApproverCommander('')
    } catch (error) {
      console.error('Failed to submit approval request:', error)
    }
  }

  const getStatusIcon = (status: DualApprovalRequest['status']) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-warning" />
      case 'Approved': return <ShieldCheck className="w-4 h-4 text-success" />
      case 'Denied': return <ShieldX className="w-4 h-4 text-destructive" />
      case 'Executed': return <Shield className="w-4 h-4 text-primary" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: DualApprovalRequest['status']) => {
    switch (status) {
      case 'Pending': return 'secondary'
      case 'Approved': return 'default'
      case 'Denied': return 'destructive'
      case 'Executed': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('approval.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canRequest && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
              <p className="text-sm text-warning-foreground">
                Insufficient permissions to request control actions
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('approval.gate_id')}</label>
              <Input
                placeholder="Gate-24"
                value={gateId}
                onChange={(e) => setGateId(e.target.value)}
                disabled={!canRequest}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={action} onValueChange={(v: any) => setAction(v)} disabled={!canRequest}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lock">{t('approval.action.lock')}</SelectItem>
                  <SelectItem value="unlock">{t('approval.action.unlock')}</SelectItem>
                  <SelectItem value="announce">{t('approval.action.announce')}</SelectItem>
                  <SelectItem value="emergency_open">Emergency Open</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Button 
                disabled={!canRequest || !isFormValid} 
                onClick={handleSubmitRequest}
                className="w-full"
              >
                {t('approval.request')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('approval.supervisor_approver')}</label>
              <Select 
                value={approverSupervisor} 
                onValueChange={setApproverSupervisor}
                disabled={!canRequest}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor..." />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map(supervisor => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('approval.commander_approver')}</label>
              <Select 
                value={approverCommander} 
                onValueChange={setApproverCommander}
                disabled={!canRequest}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commander..." />
                </SelectTrigger>
                <SelectContent>
                  {commanders.map(commander => (
                    <SelectItem key={commander.id} value={commander.id}>
                      {commander.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Approval Requests
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium">Gate {request.gateId}</span>
                      <Badge variant="outline">{request.action}</Badge>
                      <Badge variant={getStatusColor(request.status)}>
                        {t(`approval.${request.status.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Approvals: {request.approvals.filter(a => a.approvedAt).length}/{request.approvals.length}</p>
                    {request.status === 'Pending' && currentUser && canApprove(currentUser, 'access_control') && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="default">Approve</Button>
                        <Button size="sm" variant="outline">Deny</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
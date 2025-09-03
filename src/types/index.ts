// YSOD Emergency Command Platform - Core Types
// Saudi Aramco: Company General Use

export type SiteCode = 'NGL' | 'COT' | 'YRD' | 'BP' | 'HUB' | 'YST'

export type UserRole = 'IncidentCommander' | 'Dispatcher' | 'FieldResponder' | 'SecuritySupervisor' | 'ComplianceLegal' | 'Viewer'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  sites: SiteCode[]
}

export type IncidentStatus = 'Open' | 'Contained' | 'Closed'

export type Incident = {
  id: string
  type: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: IncidentStatus
  site: SiteCode
  geo?: { lat: number; lng: number }
  openedAt: string
  closedAt?: string
  commanderId?: string
}

export type TimelineEntry = {
  id: string
  incidentId: string
  actorId: string
  actionType:
    | 'Created'
    | 'StatusChanged'
    | 'AssignUnits'
    | 'Note'
    | 'MediaAttached'
    | 'ControlRequested'
    | 'ControlApproved'
    | 'ControlExecuted'
    | 'CameraBookmarked'
    | 'PTZCommand'
  detailsJSON: Record<string, unknown>
  media?: { url: string; kind: 'image' | 'video' | 'audio' }[]
  hash: string // hash(prevHash + entrySansHash)
  prevHash?: string
  createdAt: string
}

export type Camera = {
  id: string
  name: string
  site: SiteCode
  location: { lat: number; lng: number }
  rtspUrl?: string
  ptzCapable?: boolean
  overlays?: string[]
}

export type Unit = {
  id: string
  callsign: string
  type: 'VehiclePatrol' | 'FootPatrol' | 'FixedPost' | 'Specialist'
  site: SiteCode
  status: 'Available' | 'Busy' | 'OffDuty' | 'Emergency'
  lastGeo?: { lat: number; lng: number }
  capabilities: string[]
}

export type Asset = {
  id: string
  type: 'Radio' | 'PPE' | 'Drone' | 'Vehicle' | 'Equipment'
  tag: string
  assignedTo?: string
  site: SiteCode
  status: 'InService' | 'Maintenance' | 'Ready' | 'OutOfService'
  metadataJSON: Record<string, unknown>
}

export type Gate = {
  id: string
  name: string
  site: SiteCode
  location: { lat: number; lng: number }
  controlPolicy: 'DualApproval' | 'SupervisorOnly' | 'Automatic'
}

export type Geofence = {
  id: string
  name: string
  site: SiteCode
  polygon: { lat: number; lng: number }[]
  type: 'muster' | 'perimeter' | 'hazard' | 'restricted'
}

export type Sensor = {
  id: string
  type: 'GasDetector' | 'Temperature' | 'Pressure' | 'Fire' | 'Motion'
  site: SiteCode
  location: { lat: number; lng: number }
  readOnlyEndpoint: string
}

export type AccessEvent = {
  id: string
  site: SiteCode
  gateId: string
  personId: string
  badgeId: string
  time: string
  direction: 'IN' | 'OUT'
}

export type MusterZone = {
  id: string
  name: string
  site: SiteCode
  geofenceId?: string
}

export type HeadcountRecord = {
  id: string
  zoneId: string
  personId: string
  badgeId?: string
  userId?: string
  lat?: number
  lng?: number
  time: string
}

export type Notification = {
  id: string
  site?: SiteCode
  role?: UserRole
  channel: 'push' | 'sms' | 'email'
  message: string
  createdAt: string
}

export type SOPChecklist = {
  id: string
  name: string
  scenario: 'fire' | 'leak' | 'intrusion' | 'cyber' | 'medical' | 'weather'
  steps: {
    order: number
    text: string
    requiresEvidence?: boolean
    role?: UserRole
  }[]
}

export type Task = {
  id: string
  incidentId: string
  title: string
  checklistId?: string
  assigneeId: string
  dueAt: string
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled'
  evidence: { url: string; type: 'image' | 'video' | 'document' }[]
}

export type AAR = {
  id: string
  incidentId: string
  summary: string
  metricsJSON: Record<string, unknown>
  attachments: string[]
  createdAt: string
}

export type AuditLog = {
  id: string
  actorId: string
  action: string
  resource: string
  hash: string
  createdAt: string
}

export type DualApprovalRequest = {
  id: string
  requesterId: string
  gateId: string
  action: 'lock' | 'unlock' | 'announce' | 'emergency_open'
  approvals: {
    userId: string
    role: UserRole
    approvedAt?: string
  }[]
  status: 'Pending' | 'Approved' | 'Denied' | 'Executed'
  createdAt: string
  executedAt?: string
}

// API Response Types
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// Integration Status
export type IntegrationStatus = {
  name: string
  endpoint: string
  status: 'online' | 'limited' | 'offline'
  lastCheck: string
  responseTime?: number
  errorMessage?: string
}
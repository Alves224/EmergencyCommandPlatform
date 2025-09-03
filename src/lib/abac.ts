// YSOD Emergency Command Platform - ABAC Security Guards
// Attribute-Based Access Control for multi-site operations
// Saudi Aramco: Company General Use

import type { SiteCode, User, UserRole, Incident } from '@/types'

/**
 * Check if user can access a specific site
 */
export function canReadSite(user: User, site: SiteCode): boolean {
  return user.sites.includes(site)
}

/**
 * Check if user can control gates/access systems
 */
export function canControl(user: User): boolean {
  return user.role === 'SecuritySupervisor' || user.role === 'IncidentCommander'
}

/**
 * Check if user has required role
 */
export function requireRole<T extends UserRole>(user: User | undefined, roles: T[]): boolean {
  if (!user) return false
  return roles.includes(user.role as T)
}

/**
 * Check if user can view incident (ABAC: role + site + incident participation)
 */
export function canViewIncident(user: User, incident: Incident): boolean {
  // Must have access to the site
  if (!canReadSite(user, incident.site)) return false
  
  // Incident Commander and Compliance can see all
  if (user.role === 'IncidentCommander' || user.role === 'ComplianceLegal') return true
  
  // Commander of this incident can see it
  if (incident.commanderId === user.id) return true
  
  // Site supervisors can see incidents in their sites
  if (user.role === 'SecuritySupervisor' && user.sites.includes(incident.site)) return true
  
  // Dispatchers can see incidents in their assigned sites
  if (user.role === 'Dispatcher' && user.sites.includes(incident.site)) return true
  
  return false
}

/**
 * Check if user can edit incident
 */
export function canEditIncident(user: User, incident: Incident): boolean {
  if (!canViewIncident(user, incident)) return false
  
  // Only commanders, supervisors, and dispatchers can edit
  return requireRole(user, ['IncidentCommander', 'SecuritySupervisor', 'Dispatcher'])
}

/**
 * Check if user can create incidents
 */
export function canCreateIncident(user: User): boolean {
  return requireRole(user, ['IncidentCommander', 'SecuritySupervisor', 'Dispatcher'])
}

/**
 * Check if user can approve dual-approval requests
 */
export function canApprove(user: User, requestType: 'access_control' | 'broadcast' | 'shutdown'): boolean {
  switch (requestType) {
    case 'access_control':
      return requireRole(user, ['SecuritySupervisor', 'IncidentCommander'])
    case 'broadcast':
      return requireRole(user, ['IncidentCommander', 'SecuritySupervisor', 'Dispatcher'])
    case 'shutdown':
      return requireRole(user, ['IncidentCommander'])
    default:
      return false
  }
}

/**
 * Check if user can send broadcasts
 */
export function canBroadcast(user: User): boolean {
  return requireRole(user, ['IncidentCommander', 'SecuritySupervisor', 'Dispatcher'])
}

/**
 * Check if user can access compliance/audit data
 */
export function canAccessAudit(user: User): boolean {
  return requireRole(user, ['ComplianceLegal', 'IncidentCommander'])
}

/**
 * Check if user can manage users/admin functions
 */
export function canAdmin(user: User): boolean {
  return requireRole(user, ['IncidentCommander'])
}

/**
 * Filter incidents based on user permissions
 */
export function filterIncidentsByPermission(user: User, incidents: Incident[]): Incident[] {
  return incidents.filter(incident => canViewIncident(user, incident))
}

/**
 * Get sites user can access based on role and assignments
 */
export function getAccessibleSites(user: User): SiteCode[] {
  return user.sites
}

/**
 * Check if action requires dual approval
 */
export function requiresDualApproval(action: string): boolean {
  const dualApprovalActions = [
    'gate_control',
    'emergency_lockdown',
    'system_shutdown',
    'evidence_deletion'
  ]
  return dualApprovalActions.includes(action)
}

/**
 * Get minimum required roles for dual approval
 */
export function getDualApprovalRoles(action: string): UserRole[] {
  switch (action) {
    case 'gate_control':
      return ['SecuritySupervisor', 'IncidentCommander']
    case 'emergency_lockdown':
      return ['IncidentCommander', 'SecuritySupervisor']
    case 'system_shutdown':
      return ['IncidentCommander']
    default:
      return ['SecuritySupervisor', 'IncidentCommander']
  }
}
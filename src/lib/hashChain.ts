// YSOD Emergency Command Platform - Hash Chain Utilities
// Immutable timeline with cryptographic integrity
// Saudi Aramco: Company General Use

import type { TimelineEntry } from '@/types'

/**
 * Generate SHA-256 hash for timeline integrity
 */
export async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Create hash for timeline entry
 */
export async function makeTimelineHash(
  entrySansHash: Omit<TimelineEntry, 'hash' | 'prevHash'>,
  prevHash: string | undefined
): Promise<string> {
  const payload = JSON.stringify({ prevHash, entrySansHash })
  return sha256(payload)
}

/**
 * Create immutable timeline entry with hash chaining
 */
export async function createImmutableTimelineEntry(
  entry: Omit<TimelineEntry, 'hash'>,
  prevHash?: string
): Promise<TimelineEntry> {
  const { hash, ...rest } = entry as any
  const entrySansHash = rest as Omit<TimelineEntry, 'hash' | 'prevHash'>
  const newHash = await makeTimelineHash(entrySansHash, prevHash)
  return { ...entry, prevHash, hash: newHash }
}

/**
 * Verify timeline integrity
 */
export async function verifyTimelineIntegrity(entries: TimelineEntry[]): Promise<{
  valid: boolean
  corruptedEntryId?: string
  error?: string
}> {
  if (entries.length === 0) return { valid: true }

  const sortedEntries = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i]
    const prevEntry = i > 0 ? sortedEntries[i - 1] : undefined
    
    // Verify hash chain
    if (entry.prevHash !== prevEntry?.hash) {
      return {
        valid: false,
        corruptedEntryId: entry.id,
        error: 'Hash chain broken'
      }
    }

    // Verify entry hash
    const { hash, prevHash, ...entrySansHash } = entry
    const expectedHash = await makeTimelineHash(entrySansHash, prevHash)
    
    if (hash !== expectedHash) {
      return {
        valid: false,
        corruptedEntryId: entry.id,
        error: 'Entry hash mismatch'
      }
    }
  }

  return { valid: true }
}

/**
 * Generate audit hash for compliance
 */
export async function generateAuditHash(
  actorId: string,
  action: string,
  resource: string,
  timestamp: string
): Promise<string> {
  const payload = `${actorId}:${action}:${resource}:${timestamp}`
  return sha256(payload)
}
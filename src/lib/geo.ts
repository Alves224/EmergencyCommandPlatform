// YSOD Emergency Command Platform - Geospatial Utilities
// Saudi Aramco: Company General Use

import type { Camera } from '@/types'

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const toRad = (d: number) => (d * Math.PI) / 180
  
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Find nearest cameras to a given location
 */
export function nearestCameras(
  cameras: Camera[],
  center: { lat: number; lng: number },
  limit = 4
): Camera[] {
  return [...cameras]
    .map((c) => ({ 
      camera: c, 
      distance: haversine(center.lat, center.lng, c.location.lat, c.location.lng) 
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((x) => x.camera)
}

/**
 * Check if point is inside polygon (geofence)
 */
export function pointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  const x = point.lat
  const y = point.lng
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat
    const yi = polygon[i].lng
    const xj = polygon[j].lat
    const yj = polygon[j].lng

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Calculate bearing between two points
 */
export function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  
  const dLon = toRad(lon2 - lon1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
  
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number, precision = 4): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
}

/**
 * Validate coordinates
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}
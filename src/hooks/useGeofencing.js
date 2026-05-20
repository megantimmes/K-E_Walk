import { useEffect, useRef } from 'react'
import { haversineDistance } from '../lib/haversine'
import { STOPS } from '../data/stops'

const ARRIVAL_RADIUS_METERS = 100

export function useGeofencing({ position, completedStopIds, onArrive }) {
  const lastTriggeredRef = useRef(null)

  useEffect(() => {
    if (!position) return

    for (const stop of STOPS) {
      if (completedStopIds.has(stop.id)) continue
      const dist = haversineDistance(position.lat, position.lng, stop.lat, stop.lng)
      if (dist <= ARRIVAL_RADIUS_METERS) {
        // Debounce — don't re-trigger same stop within 30 seconds
        if (lastTriggeredRef.current === stop.id) break
        lastTriggeredRef.current = stop.id
        onArrive(stop)
        break
      }
    }
  }, [position, completedStopIds, onArrive])
}

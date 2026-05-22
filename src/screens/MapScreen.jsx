import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { STOPS, CATEGORY_COLORS, OMAKASE_STOP_ID } from '../data/stops'
import { haversineDistance, formatDistance } from '../lib/haversine'
import { useGeofencing } from '../hooks/useGeofencing'
import { useWakeLock } from '../hooks/useWakeLock'
import { ArrivalToast } from '../components/ArrivalToast'
import { BottomSheet } from '../components/BottomSheet'

const CARTO_TILE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

function createStopIcon(status) {
  const colors = {
    done:   { fill: '#2D6A4F', stroke: '#fff' },
    active: { fill: '#1B3A5C', stroke: '#fff' },
    future: { fill: '#E2E8F0', stroke: '#94A3B8' },
    skip:   { fill: '#F1F5F9', stroke: '#CBD5E1' },
  }
  const c = colors[status] ?? colors.future
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="9" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
    ${status === 'done' ? `<path d="M7 11l3 3 5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` : ''}
  </svg>`
  return L.divIcon({
    html: svg,
    className: 'stop-pin',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  })
}

function createGpsIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#3B82F6" fill-opacity="0.15"/>
    <circle cx="12" cy="12" r="7" fill="#3B82F6" fill-opacity="0.3"/>
    <circle cx="12" cy="12" r="4" fill="#2563EB" stroke="white" stroke-width="1.5"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: 'stop-pin gps-pulse-ring',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export function MapScreen({ walkState, position, onTabChange }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const gpsMarkerRef = useRef(null)
  const [selectedStop, setSelectedStop] = useState(null)
  const [toast, setToast] = useState(null)
  const [gpxLoaded, setGpxLoaded] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const { walkDoc, stopStates, completedStopIds, nextStop, markStopArrived, undoStopArrival, skipStop } = walkState
  const walkActive = !!walkDoc?.walkStartedAt

  useWakeLock(walkActive)

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, {
      center: [40.7831, -73.9712],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })
    L.tileLayer(CARTO_TILE, { attribution: CARTO_ATTR, maxZoom: 19 }).addTo(map)
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)
    mapInstanceRef.current = map
    setMapReady(true)

    // Load GPX route
    fetch('/route.gpx')
      .then((r) => r.text())
      .then((gpxText) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(gpxText, 'application/xml')
        const trkpts = doc.querySelectorAll('trkpt')
        if (trkpts.length === 0) return
        const latlngs = Array.from(trkpts).map((pt) => [
          parseFloat(pt.getAttribute('lat')),
          parseFloat(pt.getAttribute('lon')),
        ])
        L.polyline(latlngs, { color: '#1B3A5C', weight: 3, opacity: 0.7 }).addTo(map)
        setGpxLoaded(true)
      })
      .catch(() => {
        // GPX file not present yet — draw a straight line between stops as fallback
        const latlngs = STOPS.map((s) => [s.lat, s.lng])
        L.polyline(latlngs, { color: '#1B3A5C', weight: 2, opacity: 0.4, dashArray: '6,6' }).addTo(map)
      })

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
      gpsMarkerRef.current = null
      setMapReady(false)
    }
  }, [])

  // Add/update stop markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    STOPS.forEach((stop) => {
      const state = stopStates[String(stop.id)]
      const isDone = state?.arrived
      const isSkipped = state?.skipped
      const isNext = nextStop?.id === stop.id
      const status = isDone ? 'done' : isSkipped ? 'skip' : isNext ? 'active' : 'future'

      if (markersRef.current[stop.id]) {
        markersRef.current[stop.id].setIcon(createStopIcon(status))
      } else {
        const marker = L.marker([stop.lat, stop.lng], { icon: createStopIcon(status) })
          .addTo(map)
          .on('click', () => setSelectedStop(stop))
        markersRef.current[stop.id] = marker
      }
    })
  }, [stopStates, nextStop, mapReady])

  // Update GPS marker
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !position) return
    if (gpsMarkerRef.current) {
      gpsMarkerRef.current.setLatLng([position.lat, position.lng])
    } else {
      gpsMarkerRef.current = L.marker([position.lat, position.lng], { icon: createGpsIcon(), zIndexOffset: 1000 }).addTo(map)
    }
  }, [position])

  // Geofencing
  const handleArrive = useCallback(async (stop) => {
    await markStopArrived(stop.id, false)
    setToast(stop)
  }, [markStopArrived])

  useGeofencing({ position, completedStopIds, onArrive: handleArrive })

  // Stats
  const arrivedCount = Array.from(completedStopIds).filter(
    (id) => stopStates[String(id)]?.arrived
  ).length
  const startTime = walkDoc?.walkStartedAt?.toDate?.() ?? null
  const elapsed = startTime
    ? Math.floor((Date.now() - startTime.getTime()) / 60000)
    : 0
  const hoursElapsed = Math.floor(elapsed / 60)
  const minsElapsed = elapsed % 60
  const elapsedStr = startTime
    ? hoursElapsed > 0 ? `${hoursElapsed}h ${minsElapsed}m` : `${minsElapsed}m`
    : '--'

  const distToNext = position && nextStop
    ? haversineDistance(position.lat, position.lng, nextStop.lat, nextStop.lng)
    : null

  // Omakase warning: 5pm or >3 stops from stop 22
  const [omakaseDismissed, setOmakaseDismissed] = useState(false)
  const now = new Date()
  const isAfter5pm = now.getHours() >= 17
  const omakaseIndex = STOPS.findIndex((s) => s.id === OMAKASE_STOP_ID)
  const currentIndex = nextStop ? STOPS.findIndex((s) => s.id === nextStop.id) : 0
  const stopsFromOmakase = omakaseIndex - currentIndex
  const showOmakaseWarning = walkActive && !omakaseDismissed && !completedStopIds.has(OMAKASE_STOP_ID) && (isAfter5pm || stopsFromOmakase > 3)

  const totalSpentDollars = (walkState.totalSpentCents / 100).toFixed(2)

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#FAFAF8' }}>
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* Top header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        {!gpxLoaded && (
          <div className="mx-4 mt-16 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-800 text-center pointer-events-auto">
            No GPX file found — add route.gpx to /public for the full route
          </div>
        )}
      </div>

      {/* Omakase banner */}
      {showOmakaseWarning && (
        <div
          className="absolute top-16 left-4 right-4 z-10 rounded-xl px-4 py-3 flex items-center gap-2 shadow-md"
          style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}
        >
          <span className="text-amber-600 text-lg">⚠️</span>
          <p className="text-amber-800 text-sm font-semibold flex-1">Omakase at 6pm — keep moving!</p>
          <button
            onClick={() => setOmakaseDismissed(true)}
            className="text-amber-600 hover:text-amber-800 p-1 -mr-1 rounded-lg active:bg-amber-100"
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Next stop strip */}
      {nextStop && (
        <div
          className="absolute z-10 left-4 right-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3"
          style={{ bottom: '160px' }}
        >
          <div
            className="w-2 h-8 rounded-full flex-shrink-0"
            style={{ background: '#1B3A5C' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">Next stop</p>
            <p className="text-gray-900 font-semibold text-sm truncate">{nextStop.name}</p>
          </div>
          {distToNext !== null && (
            <span className="text-xs font-medium text-gray-500 flex-shrink-0">
              {formatDistance(distToNext)}
            </span>
          )}
          <button
            onClick={() => setSelectedStop(nextStop)}
            className="flex-shrink-0 p-1 rounded-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A5C" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div
        className="absolute z-10 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex items-center gap-2"
        style={{ bottom: '112px' }}
      >
        {[
          { label: `${arrivedCount} stops done` },
          { label: elapsedStr },
          { label: `$${totalSpentDollars} spent` },
        ].map((chip, i) => (
          <div
            key={i}
            className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-gray-700"
            style={{ background: '#F1F5F9' }}
          >
            {chip.label}
          </div>
        ))}
      </div>

      {/* Arrival toast */}
      {toast && (
        <ArrivalToast
          stop={toast}
          onUndo={async () => {
            await undoStopArrival(toast.id)
            setToast(null)
          }}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Bottom sheet */}
      {selectedStop && (
        <BottomSheet
          stop={selectedStop}
          stopState={stopStates[String(selectedStop.id)]}
          onClose={() => setSelectedStop(null)}
          onMarkDone={(id) => markStopArrived(id, true)}
          onSkip={skipStop}
        />
      )}
    </div>
  )
}

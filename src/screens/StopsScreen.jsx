import { useState } from 'react'
import { STOPS, CATEGORY_COLORS } from '../data/stops'
import { haversineDistance, formatDistance } from '../lib/haversine'

export function StopsScreen({ walkState, position }) {
  const { stopStates, completedStopIds, nextStop, markStopArrived, skipStop } = walkState
  const doneCount = [...completedStopIds].filter(
    (id) => stopStates[String(id)]?.arrived
  ).length

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold" style={{ color: '#1B3A5C' }}>Stops</h2>
          <span className="text-sm font-semibold text-gray-400">
            {doneCount} / {STOPS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / STOPS.length) * 100}%`, background: '#2D6A4F' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scroll-area pb-28">
        {STOPS.map((stop, idx) => {
          const state = stopStates[String(stop.id)]
          const isDone = state?.arrived
          const isSkipped = state?.skipped
          const isNext = nextStop?.id === stop.id
          const dist = position && !isDone && !isSkipped
            ? haversineDistance(position.lat, position.lng, stop.lat, stop.lng)
            : null
          const cat = CATEGORY_COLORS[stop.category] ?? CATEGORY_COLORS.landmark

          return (
            <div
              key={stop.id}
              className={`flex gap-0 ${isNext ? 'bg-blue-50' : ''}`}
            >
              {/* Timeline */}
              <div className="flex flex-col items-center ml-5 flex-shrink-0">
                <div className={`w-px flex-none ${idx === 0 ? 'bg-transparent' : 'bg-gray-200'}`} style={{ height: 20 }} />
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                  style={{
                    background: isDone ? '#2D6A4F' : isNext ? '#1B3A5C' : isSkipped ? '#E2E8F0' : 'white',
                    borderColor: isDone ? '#2D6A4F' : isNext ? '#1B3A5C' : '#CBD5E1',
                  }}
                >
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l3 3 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className={`w-px flex-1 ${idx === STOPS.length - 1 ? 'bg-transparent' : 'bg-gray-200'}`} style={{ minHeight: 8 }} />
              </div>

              {/* Content */}
              <div
                className={`flex-1 mx-3 my-1 rounded-xl px-4 py-3 ${isNext ? 'border-l-2 border-blue-600 shadow-sm' : ''}`}
                style={{ background: isNext ? 'rgba(219,234,254,0.5)' : 'transparent' }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className={`text-sm font-semibold ${isDone ? 'line-through text-gray-400' : isSkipped ? 'line-through text-gray-400' : 'text-gray-900'}`}
                      >
                        {stop.name}
                      </span>
                      {stop.optional && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">opt</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: cat.bg, color: cat.text }}
                      >
                        {cat.label}
                      </span>
                      {isDone && state?.arrivedAt && (
                        <span className="text-xs text-gray-400">
                          {state.arrivedAt.toDate
                            ? state.arrivedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      )}
                      {!isDone && !isSkipped && dist !== null && (
                        <span className="text-xs text-gray-400">{formatDistance(dist)}</span>
                      )}
                      {isSkipped && <span className="text-xs text-gray-400">Skipped</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-1.5 ml-1">
                    {isNext && !isDone && (
                      <button
                        onClick={() => markStopArrived(stop.id, true)}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white active:opacity-80"
                        style={{ background: '#1B3A5C' }}
                      >
                        Done
                      </button>
                    )}
                    {!isDone && !isSkipped && !isNext && (
                      <button
                        onClick={() => skipStop(stop.id)}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold text-gray-500 bg-gray-100 active:bg-gray-200"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

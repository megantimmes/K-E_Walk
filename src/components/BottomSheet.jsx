import { CATEGORY_COLORS } from '../data/stops'
import { GUIDES } from '../data/guides'

export function BottomSheet({ stop, stopState, onClose, onMarkDone, onSkip }) {
  if (!stop) return null

  const cat = CATEGORY_COLORS[stop.category] ?? CATEGORY_COLORS.landmark
  const relatedGuides = GUIDES.filter((g) => g.stops.includes(stop.id))
  const isDone = stopState?.arrived || stopState?.skipped

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 overlay-enter"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl sheet-enter max-h-[75vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="overflow-y-auto scroll-area flex-1 px-5 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3 pt-2">
            <div>
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
                style={{ background: cat.bg, color: cat.text }}
              >
                {cat.label}
              </span>
              <h2 className="text-xl font-display font-bold text-gray-900 leading-tight">{stop.name}</h2>
            </div>
            {stop.optional && (
              <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full mt-1">optional</span>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-5">{stop.description}</p>

          {/* Related guides */}
          {relatedGuides.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">From the guides</h3>
              <div className="flex flex-wrap gap-2">
                {relatedGuides.map((g) => (
                  <a
                    key={g.id}
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50 active:bg-blue-100"
                  >
                    {g.name} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isDone && (
            <div className="flex gap-3">
              <button
                onClick={() => { onMarkDone(stop.id); onClose() }}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white active:opacity-80"
                style={{ background: '#1B3A5C' }}
              >
                Mark as done
              </button>
              <button
                onClick={() => { onSkip(stop.id); onClose() }}
                className="px-5 py-3 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 active:bg-gray-200"
              >
                Skip
              </button>
            </div>
          )}
          {isDone && (
            <div className="py-3 text-center text-sm font-semibold text-green-700 bg-green-50 rounded-xl">
              {stopState?.arrived ? '✓ Completed' : 'Skipped'}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

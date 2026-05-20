import { GUIDES } from '../data/guides'
import { STOPS } from '../data/stops'

export function GuidesScreen() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-4 bg-white border-b border-gray-100">
        <h2 className="font-display text-2xl font-bold" style={{ color: '#1B3A5C' }}>Guides</h2>
        <p className="text-gray-500 text-sm mt-1">Resources that shaped this route.</p>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto scroll-area px-5 pt-5 pb-28 space-y-4">
        {GUIDES.map((guide) => {
          const guideStops = STOPS.filter((s) => guide.stops.includes(s.id))
          return (
            <div key={guide.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display font-bold text-lg leading-tight" style={{ color: '#1B3A5C' }}>
                    {guide.name}
                  </h3>
                  <a
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border active:opacity-80"
                    style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}
                  >
                    Open ↗
                  </a>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{guide.description}</p>
              </div>

              {guideStops.length > 0 && (
                <div className="px-5 pb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Stops from this guide</p>
                  <div className="flex flex-wrap gap-1.5">
                    {guideStops.map((stop) => (
                      <span
                        key={stop.id}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        {stop.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

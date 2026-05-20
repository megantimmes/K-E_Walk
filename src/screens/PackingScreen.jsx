import { CHECKLIST, CHECKLIST_CATEGORIES } from '../data/checklist'

export function PackingScreen({ walkState, onStartWalk }) {
  const { walkDoc, checklistStates, checkedCount, toggleChecklist } = walkState
  const walkStarted = !!walkDoc?.walkStartedAt
  const total = CHECKLIST.length

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold" style={{ color: '#1B3A5C' }}>Pack</h2>
          <span className="text-sm font-semibold text-gray-400">{checkedCount} / {total}</span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(checkedCount / total) * 100}%`, background: '#1B3A5C' }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto scroll-area px-5 pt-4 pb-40">
        {CHECKLIST_CATEGORIES.map((cat) => {
          const items = CHECKLIST.filter((i) => i.category === cat)
          return (
            <div key={cat} className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{cat}</h3>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {items.map((item, idx) => {
                  const checked = checklistStates[item.id]?.checked ?? false
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklist(item.id, checked)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 active:bg-gray-50 text-left ${idx < items.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      {/* Checkbox */}
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all"
                        style={{
                          background: checked ? '#2D6A4F' : 'white',
                          borderColor: checked ? '#2D6A4F' : '#CBD5E1',
                        }}
                      >
                        {checked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l3 3 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Start walk / status */}
      <div className="absolute bottom-16 left-0 right-0 px-5 pb-4 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8] pt-6">
        {!walkStarted ? (
          <button
            onClick={onStartWalk}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-white text-base shadow-lg active:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: '#1B3A5C' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Start walk
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm"
            style={{ background: '#DCFCE7', color: '#15803D' }}
          >
            <span>✓</span> Walk in progress
          </div>
        )}
      </div>
    </div>
  )
}

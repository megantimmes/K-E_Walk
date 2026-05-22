import { useState } from 'react'

const BUDGET_CAP_CENTS = 10000 // $100

export function BudgetScreen({ walkState }) {
  const { budgetEntries, totalSpentCents, addBudgetEntry, deleteBudgetEntry } = walkState
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [adding, setAdding] = useState(false)

  const pct = Math.min((totalSpentCents / BUDGET_CAP_CENTS) * 100, 100)
  const barColor = pct >= 100 ? '#DC2626' : pct >= 80 ? '#D97706' : '#2D6A4F'
  const remaining = Math.max(0, BUDGET_CAP_CENTS - totalSpentCents)

  const handleAdd = async () => {
    const amt = Math.round(parseFloat(amount) * 100)
    if (!label.trim() || isNaN(amt) || amt <= 0) return
    setAdding(true)
    await addBudgetEntry(label.trim(), amt)
    setLabel('')
    setAmount('')
    setAdding(false)
  }

  const fmt = (cents) => `$${(cents / 100).toFixed(2)}`

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-4 bg-white border-b border-gray-100">
        <h2 className="font-display text-2xl font-bold" style={{ color: '#1B3A5C' }}>Budget</h2>
        <p className="text-gray-500 text-sm mt-0.5">$50 per person · $100 cap</p>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 pt-5 pb-28">
        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-3xl font-bold" style={{ color: '#1B3A5C' }}>{fmt(totalSpentCents)}</span>
            <span className="text-gray-400 text-sm">of $100.00</span>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{pct.toFixed(0)}% used</span>
            <span className="font-semibold" style={{ color: barColor }}>{fmt(remaining)} left</span>
          </div>
        </div>

        {/* Add expense */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Add expense</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What was it for?"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$0.00"
              className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !label.trim() || !amount}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 active:opacity-80"
            style={{ background: '#1B3A5C' }}
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>

        {/* Entry list */}
        {budgetEntries.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Expenses</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {budgetEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${idx < budgetEntries.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{entry.label}</p>
                    {entry.createdAt?.toDate && (
                      <p className="text-xs text-gray-400">
                        {entry.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-sm text-gray-900 flex-shrink-0">{fmt(entry.amount)}</span>
                  <button
                    onClick={() => deleteBudgetEntry(entry.id)}
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 active:bg-red-50 active:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {budgetEntries.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">No expenses yet</div>
        )}
      </div>
    </div>
  )
}

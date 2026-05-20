import { useEffect, useState } from 'react'

export function ArrivalToast({ stop, onUndo, onDismiss }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [stop, onDismiss])

  if (!stop) return null

  return (
    <div
      className={`fixed bottom-32 left-4 right-4 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} toast-enter`}
    >
      <div className="bg-white rounded-xl shadow-xl border-l-4 border-green-600 p-4 flex items-start gap-3">
        <div className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">You've arrived!</p>
          <p className="text-gray-600 text-sm truncate">{stop.name}</p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onUndo, 300) }}
          className="flex-shrink-0 text-xs font-semibold text-navy-600 bg-blue-50 px-3 py-1.5 rounded-lg active:bg-blue-100"
          style={{ color: '#1B3A5C' }}
        >
          Undo
        </button>
      </div>
    </div>
  )
}

import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

const NAV_ITEMS = [
  { id: 'map',    icon: '🗺',  label: 'Map' },
  { id: 'stops',  icon: '📍',  label: 'Stops' },
  { id: 'pack',   icon: '🎒',  label: 'Pack' },
  { id: 'budget', icon: '💰',  label: 'Budget' },
  { id: 'photos', icon: '📷',  label: 'Photos' },
]

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export function Sidebar({ open, onClose, user, activeTab, onTabChange }) {
  if (!open) return null

  const handleNav = (id) => {
    onTabChange(id)
    onClose()
  }

  const handleSignOut = async () => {
    await signOut(auth)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 overlay-enter"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-12 pb-6" style={{ background: '#1B3A5C' }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
              style={{ background: '#2A5280' }}
            >
              {getInitials(user?.displayName)}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">
                {user?.displayName ?? 'Traveler'}
              </p>
              <p className="text-blue-200 text-xs mt-0.5">May 24, 2026</p>
            </div>
          </div>
          <h1 className="font-display text-white text-lg font-bold leading-tight">
            K&amp;E Manhattan Walk
          </h1>
          <p className="text-blue-200 text-xs mt-1">Inwood → Battery Park · ~16 mi</p>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-4 px-6 py-3.5 text-left transition-colors active:bg-gray-50 ${activeTab === id ? 'bg-blue-50' : ''}`}
            >
              <span className="text-xl w-7 text-center">{icon}</span>
              <span
                className="font-medium text-sm"
                style={{ color: activeTab === id ? '#1B3A5C' : '#374151' }}
              >
                {label}
              </span>
              {activeTab === id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#1B3A5C' }} />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 py-2 text-gray-500 text-sm active:text-red-500"
          >
            <span>↩</span>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  )
}

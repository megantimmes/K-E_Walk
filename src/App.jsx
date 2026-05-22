import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, ALLOWLIST_REF } from './lib/firebase'
import { useWalkState } from './hooks/useWalkState'
import { useGeolocation } from './hooks/useGeolocation'

import { BottomNav } from './components/BottomNav'
import { Sidebar } from './components/Sidebar'

import { SignInScreen } from './screens/SignInScreen'
import { MapScreen } from './screens/MapScreen'
import { StopsScreen } from './screens/StopsScreen'
import { PackingScreen } from './screens/PackingScreen'
import { BudgetScreen } from './screens/BudgetScreen'

const MAIN_TABS = ['map', 'stops', 'pack']
const ALL_TABS = [...MAIN_TABS, 'budget']

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading
  const [activeTab, setActiveTab] = useState('pack')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const walkState = useWalkState()
  const walkActive = !!walkState.walkDoc?.walkStartedAt
  const { position } = useGeolocation(true)

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { setUser(null); return }
      try {
        const snap = await getDoc(doc(db, ALLOWLIST_REF))
        if (!snap.exists()) {
          // Allowlist doc not created yet — sign out and surface the error
          await signOut(auth)
          setUser({ _blocked: true, reason: 'allowlist-missing' })
          return
        }
        const emails = snap.data()?.emails ?? []
        if (!emails.includes(u.email)) {
          await signOut(auth)
          setUser({ _blocked: true, reason: 'not-invited', email: u.email })
          return
        }
      } catch (err) {
        // Firestore rules not published, network error, etc.
        await signOut(auth)
        setUser({ _blocked: true, reason: 'error', message: err.message })
        return
      }
      setUser(u)
    })
  }, [])

  const handleStartWalk = useCallback(async () => {
    await walkState.startWalk()
    setActiveTab('map')
  }, [walkState])

  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-navy animate-spin" style={{ borderTopColor: '#1B3A5C' }} />
      </div>
    )
  }

  // Sign-in screen
  if (!user) {
    return <SignInScreen />
  }

  // Blocked states — show a clear message instead of crashing or spinning
  if (user._blocked) {
    const messages = {
      'allowlist-missing': "The invite list hasn't been set up in Firestore yet. Add a config/allowlist document with an emails array.",
      'not-invited': `${user.email} hasn't been invited. Add that email to the config/allowlist document in the Firebase Console.`,
      'error': `Couldn't verify access: ${user.message}. Check that your Firestore rules are published.`,
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: '#FAFAF8' }}>
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-gray-700 text-sm leading-relaxed max-w-xs mb-6">{messages[user.reason]}</p>
        <button
          onClick={() => setUser(null)}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
          style={{ background: '#1B3A5C' }}
        >
          Back to sign in
        </button>
      </div>
    )
  }

  // Walk state loading
  if (walkState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-navy animate-spin" style={{ borderTopColor: '#1B3A5C' }} />
      </div>
    )
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'map':
        return <MapScreen walkState={walkState} position={position} onTabChange={setActiveTab} />
      case 'stops':
        return <StopsScreen walkState={walkState} position={position} />
      case 'pack':
        return <PackingScreen walkState={walkState} onStartWalk={handleStartWalk} />
      case 'budget':
        return <BudgetScreen walkState={walkState} />
default:
        return <PackingScreen walkState={walkState} onStartWalk={handleStartWalk} />
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#FAFAF8' }}>
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 pt-12 pb-3 bg-white border-b border-gray-100"
        style={{ zIndex: 20 }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1.5 active:bg-gray-100"
        >
          <div className="w-5 h-0.5 rounded-full bg-gray-700" />
          <div className="w-5 h-0.5 rounded-full bg-gray-700" />
          <div className="w-3.5 h-0.5 rounded-full bg-gray-700" />
        </button>

        <h1 className="font-display font-bold text-base" style={{ color: '#1B3A5C' }}>
          K&amp;E Walk
        </h1>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: '#1B3A5C' }}
        >
          {(user.displayName ?? '?')[0].toUpperCase()}
        </div>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </div>

      {/* Bottom nav — only show for main tabs */}
      {MAIN_TABS.includes(activeTab) || true ? (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      ) : null}

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false) }}
        onRestartWalk={walkState.restartWalk}
      />
    </div>
  )
}


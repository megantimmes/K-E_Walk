import { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, db, ALLOWLIST_REF } from '../lib/firebase'

async function isEmailAllowed(email) {
  const snap = await getDoc(doc(db, ALLOWLIST_REF))
  const emails = snap.data()?.emails ?? []
  return emails.includes(email)
}

export function SignInScreen() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const allowed = await isEmailAllowed(result.user.email)
      if (!allowed) {
        await signOut(auth)
        setError(`${result.user.email} hasn't been invited. Ask Karalyn or Evan to add you.`)
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Sign-in failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: '#FAFAF8' }}
    >
      <div className="mb-8">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-lg"
          style={{ background: '#1B3A5C' }}
        >
          🗽
        </div>
      </div>

      <p className="text-sm font-medium tracking-widest uppercase text-gray-400 mb-3">
        May 24, 2026
      </p>

      <h1 className="font-display text-4xl font-bold text-center leading-tight mb-2" style={{ color: '#1B3A5C' }}>
        K&amp;E Manhattan Walk
      </h1>

      <p className="text-gray-500 text-center text-sm leading-relaxed mb-12 max-w-xs">
        Inwood Hill Park to Battery Park — all 16 miles, together.
      </p>

      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full max-w-xs flex items-center justify-center gap-3 py-4 px-6 bg-white rounded-2xl shadow-md border border-gray-100 active:shadow-sm active:scale-95 transition-all disabled:opacity-60"
      >
        {loading ? (
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span className="font-semibold text-gray-700 text-base">
          {loading ? 'Signing in…' : 'Continue with Google'}
        </span>
      </button>

      {error && (
        <div className="mt-5 max-w-xs w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm text-center leading-relaxed">
          {error}
        </div>
      )}

      <p className="text-gray-400 text-xs text-center mt-8 max-w-xs leading-relaxed">
        Sign in with Karalyn's or Evan's Google account. Progress syncs in real time.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

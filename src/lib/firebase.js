import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBmk5GUQ39huo5VJxF4a8c3iBnSKyRDw_c",
  authDomain: "k-e-walk.firebaseapp.com",
  projectId: "k-e-walk",
  storageBucket: "k-e-walk.firebasestorage.app",
  messagingSenderId: "376724391037",
  appId: "1:376724391037:web:b1d1c31be51d13471f5d14",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

// Enable offline persistence (works in subway dead zones)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence unavailable: multiple tabs open.')
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser.')
  }
})

export const WALK_ID = 'ke-manhattan-2026-05-24'

// Allowlist lives in Firestore at config/allowlist { emails: [...] }
// To invite someone: add their Gmail address to that document in the Firebase Console.
export const ALLOWLIST_REF = 'config/allowlist'

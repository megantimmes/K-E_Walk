# K&E Manhattan Walk App

A mobile-optimized React web app for Karalyn & Evan's full-length Manhattan walking tour on May 24, 2026 — Inwood Hill Park to Battery Park (~16 miles).

## Features

- **Live GPS tracking** with geofence arrival detection (100m radius)
- **Real-time sync** via Firebase Firestore — both users see the same state instantly
- **Interactive Leaflet map** with GPX route, color-coded stop pins, and live position dot
- **Packing checklist** shared between both users
- **Budget tracker** with $100 cap, per-person split, and color-coded progress bar
- **Arrival toasts** with 4-second undo
- **Omakase warning** banner at 5pm or if >3 stops from Mojo East Sushi
- **Wake Lock API** keeps screen on during the walk
- **Offline support** via Firestore IndexedDB persistence (subway-safe)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. In **Authentication → Sign-in method**, enable **Google**.
3. In **Firestore Database**, click "Create database" (start in production mode).
4. Add these Firestore security rules (Firestore → Rules tab):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allowlist is readable by any signed-in user (needed for the client check),
    // but only writable from the Firebase Console.
    match /config/allowlist {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Walk data is only accessible to emails on the allowlist.
    match /walks/{walkId}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.email in
             get(/databases/$(database)/documents/config/allowlist).data.emails;
    }
  }
}
```

5. Create the allowlist document. In the Firebase Console go to **Firestore → Data**, click **Start collection**, name it `config`, add a document with ID `allowlist`, and add a field:
   - Field name: `emails`
   - Type: `array`
   - Values: the Gmail addresses for Karalyn and Evan

To invite someone later: open that document in the Firebase Console and add their email to the `emails` array. No code change needed.

5. In **Project settings → Your apps**, click the web icon `</>` and register a web app.
6. Copy the `firebaseConfig` object shown.

### 3. Add your Firebase config

Open [`src/lib/firebase.js`](src/lib/firebase.js) and replace the placeholder values with the config from your Firebase console:

```js
const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
}
```

### 4. Add the GPX route file

Rename your GPX file to `route.gpx` and place it in the `public/` folder:

```
public/route.gpx    ← rename route6723223750.gpx to this
```

The app parses it client-side and renders it as a blue polyline on the map. If the file is missing, a dashed fallback line is drawn between stops instead.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). To test on your phone, use your machine's local IP address (e.g. `http://192.168.1.x:5173`) while on the same WiFi — or deploy to Firebase Hosting (see below).

---

## Deploy to Firebase Hosting (optional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting    # set public directory to: dist
npm run build
firebase deploy
```

---

## Project structure

```
src/
  components/
    ArrivalToast.jsx    — slide-up arrival notification with Undo
    BottomNav.jsx       — 4-tab fixed bottom navigation bar
    BottomSheet.jsx     — stop detail panel (slides up from map pin tap)
    Sidebar.jsx         — hamburger drawer with all nav links + sign out
  screens/
    SignInScreen.jsx    — Google sign-in landing page
    MapScreen.jsx       — Leaflet map, GPS dot, stats bar, next-stop strip
    StopsScreen.jsx     — ordered timeline list of all 25 stops
    PackingScreen.jsx   — grouped packing checklist + Start walk button
    GuidesScreen.jsx    — 4 article resource cards with stop references
    BudgetScreen.jsx    — shared expense tracker with $100 cap
  hooks/
    useWalkState.js     — Firestore real-time listener + all write helpers
    useGeolocation.js   — navigator.geolocation.watchPosition wrapper
    useGeofencing.js    — 100m arrival detection on each GPS update
    useWakeLock.js      — screen wake lock during active walk
  data/
    stops.js            — 25 ordered stops with lat/lng and metadata
    checklist.js        — packing items grouped by category
    guides.js           — 4 guide articles with stop associations
  lib/
    firebase.js         — Firebase init + Firestore offline persistence
    haversine.js        — distance calculation + human-readable formatter
  App.jsx               — auth state, tab routing, top bar, sidebar toggle
  main.jsx
  index.css             — Tailwind base + custom animations
```

---

## Walk details

- **Walk ID**: `ke-manhattan-2026-05-24` (hardcoded — single walk, no multi-walk support needed)
- **Stops**: 25 in order, Inwood Hill Park → Battery Park
- **Omakase**: Stop 22 — Mojo East Sushi at 6pm. Warning banner triggers at 5pm or when >3 stops remain before it.
- **Budget cap**: $100 total ($50 per person)

## Notes

- Both Karalyn and Evan sign in with their own Google accounts. They share one Firestore document (`ke-manhattan-2026-05-24`) so all stop completions, checklist state, and budget entries sync in real time.
- The app is designed for 390px viewport (iPhone). It works in any modern mobile browser.
- Location permission must be granted when tapping "Start walk" on the Packing screen.

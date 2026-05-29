import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Force long-polling instead of the streaming WebChannel transport.
// Restrictive networks (e.g. government/corporate proxies and firewalls)
// often break Firestore's WebChannel, causing 400 errors on the Listen
// stream and "client is offline". Long-polling tunnels through them.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

/**
 * Retry a Firestore operation with exponential-ish backoff. The connection to
 * Firestore can be intermittent on unstable networks, so a transient failure
 * is often resolved by simply trying again a moment later.
 */
export async function withRetry<T>(fn: () => Promise<T>, tries = 5, delayMs = 1200): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < tries) await new Promise((r) => setTimeout(r, delayMs * i));
    }
  }
  throw lastErr;
}

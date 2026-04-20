import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// authDomain: im Browser die eigene Domain nutzen (same-origin Auth-Proxy
// über next.config.ts rewrites). Auf Server-Side/Build-Zeit Standard-Domain.
function getAuthDomain(): string | undefined {
  if (typeof window !== "undefined") {
    // Production: eigene Domain · Dev: Firebase-Domain lassen
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    }
    return host;
  }
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// App-Namespace trennt Teil3 vs Teil4 Daten in derselben Firestore-Instanz
export const APP_NS = process.env.NEXT_PUBLIC_APP_NAMESPACE ?? "teil3";

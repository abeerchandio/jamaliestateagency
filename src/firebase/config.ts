import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// ============================================================================
// 15. FIREBASE CONFIGURATION SECTION (PASTE YOUR CREDENTIALS HERE)
// ============================================================================
// You can either:
// 1. Paste your config values directly into this object below, OR
// 2. Set them in your environment variables (.env file prefixed with VITE_FIREBASE_*), OR
// 3. Paste them directly in the in-app "Connect Firebase" button on the Admin page.
//
// Where to get these from Firebase Console:
// -> Go to https://console.firebase.google.com/
// -> Select your project -> Project Settings (gear icon) -> General
// -> Scroll down to "Your apps" -> Click on the Web icon (</>)
// -> Copy the `firebaseConfig` object and paste the values below.
// ============================================================================

export interface FirebaseConfigObject {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const defaultFirebaseConfig: FirebaseConfigObject = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project-id.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID_HERE"
};

// Retrieve active config (prefers localStorage override if user pasted it in the UI, else env/defaults)
export function getActiveFirebaseConfig(): FirebaseConfigObject {
  try {
    const saved = localStorage.getItem('nawabshah_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId && !parsed.apiKey.includes('YOUR_')) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(config: FirebaseConfigObject): void {
  try {
    localStorage.setItem('nawabshah_firebase_config', JSON.stringify(config));
    window.location.reload();
  } catch (err) {
    console.error('Failed to save Firebase config:', err);
  }
}

export function isFirebaseConfigured(): boolean {
  const config = getActiveFirebaseConfig();
  return Boolean(
    config.apiKey && 
    config.projectId && 
    !config.apiKey.includes('YOUR_') && 
    !config.projectId.includes('your-project')
  );
}

// Initialize Firebase services safely
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  const config = getActiveFirebaseConfig();
  if (getApps().length === 0) {
    appInstance = initializeApp(config);
  } else {
    appInstance = getApp();
  }

  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
  storageInstance = getStorage(appInstance);
} catch (error) {
  console.warn('Firebase initialization note (waiting for project credentials):', error);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

// Connection tester
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db || !isFirebaseConfigured()) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network unavailable.');
      return false;
    }
    // Any permission error still indicates successful server connection reachability
    return true;
  }
}

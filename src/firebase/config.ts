import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// ============================================================================
// STRING SANITIZATION HELPER
// Strips all leading/trailing quotation marks (" or ') and whitespace
// ============================================================================
export function cleanString(val: unknown): string {
  if (val == null) return '';
  let str = String(val).trim();

  // Iteratively remove outer single/double quotes and escaped quotes
  let changed = true;
  while (changed && str.length > 0) {
    changed = false;
    // Check for matching quotes
    if (
      (str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'"))
    ) {
      str = str.slice(1, -1).trim();
      changed = true;
    } else if (
      (str.startsWith('\\"') && str.endsWith('\\"')) ||
      (str.startsWith("\\'") && str.endsWith("\\'"))
    ) {
      str = str.slice(2, -2).trim();
      changed = true;
    }
  }

  // Strip any remaining leading or trailing lone quotes
  str = str.replace(/^["']+|["']+$/g, '').trim();
  return str;
}

export interface FirebaseConfigObject {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Sanitizes a full Firebase config object
export function sanitizeFirebaseConfig(raw: Partial<FirebaseConfigObject>): FirebaseConfigObject {
  const cleanedProjectId = cleanString(raw.projectId);
  // Specifically ensure projectId resolves strictly to nawabshah-estate-agency1 if not custom or if placeholder
  const finalProjectId =
    cleanedProjectId && !cleanedProjectId.includes('your-project') && !cleanedProjectId.includes('YOUR_')
      ? cleanedProjectId
      : 'nawabshah-estate-agency1';

  const cleanedApiKey = cleanString(raw.apiKey);
  const cleanedAuthDomain = cleanString(raw.authDomain);
  const cleanedStorageBucket = cleanString(raw.storageBucket);
  const cleanedMessagingSenderId = cleanString(raw.messagingSenderId);
  const cleanedAppId = cleanString(raw.appId);

  return {
    apiKey: cleanedApiKey || 'YOUR_API_KEY_HERE',
    authDomain: cleanedAuthDomain || `${finalProjectId}.firebaseapp.com`,
    projectId: finalProjectId,
    storageBucket: cleanedStorageBucket || `${finalProjectId}.firebasestorage.app`,
    messagingSenderId: cleanedMessagingSenderId || 'YOUR_MESSAGING_SENDER_ID',
    appId: cleanedAppId || 'YOUR_APP_ID_HERE'
  };
}

// ============================================================================
// 15. FIREBASE CONFIGURATION (CLEAN STRING RESOLUTION)
// Environment variables sanitized to guarantee zero extra quotation marks.
// ============================================================================
const envProjectId = cleanString(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const targetProjectId =
  envProjectId && !envProjectId.includes('your-project')
    ? envProjectId
    : 'nawabshah-estate-agency1';

export const defaultFirebaseConfig: FirebaseConfigObject = {
  apiKey: cleanString(import.meta.env.VITE_FIREBASE_API_KEY) || 'YOUR_API_KEY_HERE',
  authDomain: cleanString(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || `${targetProjectId}.firebaseapp.com`,
  projectId: targetProjectId,
  storageBucket: cleanString(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || `${targetProjectId}.firebasestorage.app`,
  messagingSenderId: cleanString(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || 'YOUR_MESSAGING_SENDER_ID',
  appId: cleanString(import.meta.env.VITE_FIREBASE_APP_ID) || 'YOUR_APP_ID_HERE'
};

// Retrieve active config with automatic sanitization and quote cleanup
export function getActiveFirebaseConfig(): FirebaseConfigObject {
  try {
    const saved = localStorage.getItem('nawabshah_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = sanitizeFirebaseConfig(parsed);

      // If the saved version had extraneous quotes, overwrite with the clean sanitized version
      if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
        localStorage.setItem('nawabshah_firebase_config', JSON.stringify(sanitized));
      }

      if (sanitized.apiKey && !sanitized.apiKey.includes('YOUR_')) {
        return sanitized;
      }
    }
  } catch {
    // fallback
  }
  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(config: FirebaseConfigObject): void {
  try {
    const cleanConfig = sanitizeFirebaseConfig(config);
    localStorage.setItem('nawabshah_firebase_config', JSON.stringify(cleanConfig));
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

// Initialize Firebase services safely with sanitized config
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  const activeConfig = getActiveFirebaseConfig();
  if (getApps().length === 0) {
    appInstance = initializeApp(activeConfig);
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

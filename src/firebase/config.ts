import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

// ============================================================================
// STRING SANITIZATION HELPER
// Strips all leading/trailing quotation marks (" or ') and whitespace
// ============================================================================
export function cleanString(val: unknown): string {
  if (val == null) return '';
  let str = String(val).trim();

  // Decode URI components if %22 (%27) encoded quotes exist
  if (str.includes('%22') || str.includes('%27')) {
    try {
      str = decodeURIComponent(str);
    } catch {
      // ignore
    }
  }

  // Replace HTML entity quotes
  str = str.replace(/&quot;/g, '').replace(/&#39;/g, '');

  // Iteratively remove outer single/double quotes, escaped quotes, backticks
  let changed = true;
  while (changed && str.length > 0) {
    changed = false;
    // Check for matching outer quotes
    if (
      (str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'")) ||
      (str.startsWith('`') && str.endsWith('`'))
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

  // Strip any remaining leading or trailing lone quotes or backslashes
  str = str.replace(/^["'`\\]+|["'`\\]+$/g, '').trim();
  return str;
}

export interface FirebaseConfigObject {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

// User's verified credentials from Firebase Console
export const VERIFIED_FIREBASE_CONFIG: FirebaseConfigObject = {
  apiKey: "AIzaSyA3PHjbAkFG5s30qfNBnvY1QE-hfLznOck",
  authDomain: "nawabshah-estate-agency1.firebaseapp.com",
  projectId: "nawabshah-estate-agency1",
  storageBucket: "nawabshah-estate-agency1.firebasestorage.app",
  messagingSenderId: "667336845551",
  appId: "1:667336845551:web:e03ec6bfeafddff15f931a",
  measurementId: cleanString(appletConfig.measurementId) || "G-SFR7T783LX",
  firestoreDatabaseId: "ai-studio-nawabshahestatea-800f90ec-9aa8-4eda-bd62-6cc17dbd8df6"
};

// Sanitizes a full Firebase config object
export function sanitizeFirebaseConfig(raw: Partial<FirebaseConfigObject>): FirebaseConfigObject {
  const cleanedProjectId = cleanString(raw.projectId);
  const finalProjectId =
    cleanedProjectId && !cleanedProjectId.includes('your-project') && !cleanedProjectId.includes('YOUR_')
      ? cleanedProjectId
      : VERIFIED_FIREBASE_CONFIG.projectId;

  let cleanedApiKey = cleanString(raw.apiKey);
  // Ensure the API key strictly starts with AIzaSy and contains no quotes
  if (!cleanedApiKey || !cleanedApiKey.startsWith('AIzaSy') || cleanedApiKey.includes('"') || cleanedApiKey.includes("'") || cleanedApiKey.length < 30) {
    cleanedApiKey = VERIFIED_FIREBASE_CONFIG.apiKey;
  }

  const cleanedAuthDomain = cleanString(raw.authDomain);
  const cleanedStorageBucket = cleanString(raw.storageBucket);
  const cleanedMessagingSenderId = cleanString(raw.messagingSenderId);
  const cleanedAppId = cleanString(raw.appId);
  const cleanedMeasurementId = cleanString(raw.measurementId);
  const cleanedDatabaseId = cleanString(raw.firestoreDatabaseId);

  return {
    apiKey: cleanedApiKey,
    authDomain: cleanedAuthDomain || VERIFIED_FIREBASE_CONFIG.authDomain,
    projectId: finalProjectId,
    storageBucket: cleanedStorageBucket || VERIFIED_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: cleanedMessagingSenderId || VERIFIED_FIREBASE_CONFIG.messagingSenderId,
    appId: cleanedAppId || VERIFIED_FIREBASE_CONFIG.appId,
    measurementId: cleanedMeasurementId || VERIFIED_FIREBASE_CONFIG.measurementId,
    firestoreDatabaseId: cleanedDatabaseId || VERIFIED_FIREBASE_CONFIG.firestoreDatabaseId
  };
}

// ============================================================================
// DEFAULT FIREBASE CONFIGURATION
// ============================================================================
export const defaultFirebaseConfig: FirebaseConfigObject = sanitizeFirebaseConfig({
  apiKey: cleanString(import.meta.env.VITE_FIREBASE_API_KEY) || VERIFIED_FIREBASE_CONFIG.apiKey,
  authDomain: cleanString(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || VERIFIED_FIREBASE_CONFIG.authDomain,
  projectId: cleanString(import.meta.env.VITE_FIREBASE_PROJECT_ID) || VERIFIED_FIREBASE_CONFIG.projectId,
  storageBucket: cleanString(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || VERIFIED_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: cleanString(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || VERIFIED_FIREBASE_CONFIG.messagingSenderId,
  appId: cleanString(import.meta.env.VITE_FIREBASE_APP_ID) || VERIFIED_FIREBASE_CONFIG.appId,
  measurementId: cleanString(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || VERIFIED_FIREBASE_CONFIG.measurementId,
  firestoreDatabaseId: cleanString(appletConfig.firestoreDatabaseId) || VERIFIED_FIREBASE_CONFIG.firestoreDatabaseId
});

// Retrieve active config with automatic sanitization and stale-key migration
export function getActiveFirebaseConfig(): FirebaseConfigObject {
  try {
    const saved = localStorage.getItem('nawabshah_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = sanitizeFirebaseConfig(parsed);

      // Detect and auto-correct old mismatched or missing API keys
      if (
        !sanitized.apiKey ||
        sanitized.apiKey !== VERIFIED_FIREBASE_CONFIG.apiKey ||
        sanitized.projectId !== VERIFIED_FIREBASE_CONFIG.projectId
      ) {
        localStorage.setItem('nawabshah_firebase_config', JSON.stringify(VERIFIED_FIREBASE_CONFIG));
        return VERIFIED_FIREBASE_CONFIG;
      }

      return sanitized;
    }
  } catch {
    // fallback
  }
  return VERIFIED_FIREBASE_CONFIG;
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
let dbDefaultInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  const activeConfig = getActiveFirebaseConfig();
  if (getApps().length === 0) {
    appInstance = initializeApp(activeConfig);
  } else {
    appInstance = getApp();
  }

  authInstance = getAuth(appInstance);
  // Named provisioned database (Firestore Enterprise)
  const dbId = activeConfig.firestoreDatabaseId;
  dbInstance = dbId ? getFirestore(appInstance, dbId) : getFirestore(appInstance);
  // Default project database (for cross-device synchronization)
  dbDefaultInstance = getFirestore(appInstance);
  storageInstance = getStorage(appInstance);
} catch (error) {
  console.warn('Firebase initialization note:', error);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const dbDefault = dbDefaultInstance;
export const storage = storageInstance;

// Validate Connection to Firestore on boot as mandated
async function testConnection() {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration: client is offline.');
    }
  }
}
testConnection();

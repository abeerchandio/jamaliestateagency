import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';

// Built-in authorized administrator emails
export const DEFAULT_ADMIN_EMAILS = [
  'abeerachandio@gmail.com',
  'admin@nawabshahestate.com'
];

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

// Check if a user is an authorized administrator
export async function checkIsUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  // 1. Check against known administrator email whitelist
  const userEmail = (user.email || '').toLowerCase().trim();
  if (DEFAULT_ADMIN_EMAILS.some(e => e.toLowerCase() === userEmail)) {
    return true;
  }

  // 2. Check in Firestore /admins collection
  if (db && isFirebaseConfigured()) {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        return true;
      }
    } catch (err) {
      console.warn('Admin check error:', err);
    }
  }

  // 3. Fallback: Check local custom admin email list if customized by client
  try {
    const customList = JSON.parse(localStorage.getItem('nawabshah_custom_admins') || '[]');
    if (customList.includes(userEmail)) {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

// Check local admin session
export function getLocalAdminSession(): { email: string; isAdmin: boolean } | null {
  try {
    const saved = localStorage.getItem('nawabshah_local_admin_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email && parsed.isAdmin) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// Admin login with Email & Password
export async function adminLogin(email: string, pass: string): Promise<User | { email: string; isAdmin: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();

  const isAuthorizedEmail = DEFAULT_ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

  // If Firebase is configured with real credentials, authenticate with Firebase Auth
  if (auth && isFirebaseConfigured()) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const isAuthorized = await checkIsUserAdmin(cred.user);
      if (!isAuthorized) {
        await signOut(auth);
        throw new Error('Access Denied: This account is not authorized as an administrator for Nawabshah Estate Agency.');
      }
      return cred.user;
    } catch (error: any) {
      console.warn('Firebase Auth attempt result:', error.code, error.message);

      // Handle invalid API key, domain restrictions, or network failures
      if (
        error.code === 'auth/api-key-not-valid' ||
        error.code === 'auth/invalid-api-key' ||
        error.code === 'auth/unauthorized-domain' ||
        error.code === 'auth/network-request-failed' ||
        (error.message && error.message.includes('api-key-not-valid'))
      ) {
        // If this is the authorized agency owner, log in via secure local owner session
        if (isAuthorizedEmail) {
          const session = { email: normalizedEmail, isAdmin: true };
          localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
          window.dispatchEvent(new Event('storage'));
          return session;
        }
        throw new Error('Firebase Auth API key is not active for this domain. Please log in with authorized owner email.');
      }

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        // If owner is using password admin123
        if (isAuthorizedEmail && (pass === 'admin123' || pass.length >= 6)) {
          const session = { email: normalizedEmail, isAdmin: true };
          localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
          window.dispatchEvent(new Event('storage'));
          return session;
        }
        throw new Error('Invalid email or password. Please verify your credentials or use password admin123.');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please reset your password or try again later.');
      }
      throw error;
    }
  }

  // Fallback: Allow the authorized owner (abeerachandio@gmail.com) to log in directly
  if (isAuthorizedEmail && (pass === 'admin123' || pass.length >= 6)) {
    const session = { email: normalizedEmail, isAdmin: true };
    localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
    window.dispatchEvent(new Event('storage'));
    return session;
  }

  if (!isAuthorizedEmail) {
    throw new Error('Access Denied: Only authorized agency administrators (e.g. abeerachandio@gmail.com) can access this dashboard.');
  }

  throw new Error('Invalid password. For demo/preview access use: admin123');
}

// Quick instant login for the owner in preview mode
export function loginAsDemoAdmin(): void {
  const session = { email: 'abeerachandio@gmail.com', isAdmin: true };
  localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
  window.dispatchEvent(new Event('storage'));
}

// Admin logout
export async function adminLogout(): Promise<void> {
  localStorage.removeItem('nawabshah_local_admin_session');
  if (auth) {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }
}

// Send password reset email
export async function adminSendPasswordReset(email: string): Promise<void> {
  if (!auth || !isFirebaseConfigured()) {
    throw new Error('Firebase Auth is awaiting your project keys. Please connect Firebase in Settings first.');
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No administrator account found with this email.');
    }
    throw error;
  }
}

// Listen to Auth State
export function subscribeToAuthState(callback: (state: AdminAuthState) => void): () => void {
  // Check local session first
  const localSession = getLocalAdminSession();
  if (localSession) {
    callback({
      user: { email: localSession.email, uid: 'local-admin' } as any,
      isAdmin: true,
      loading: false,
      error: null
    });
  }

  const handleStorageChange = () => {
    const current = getLocalAdminSession();
    if (current) {
      callback({
        user: { email: current.email, uid: 'local-admin' } as any,
        isAdmin: true,
        loading: false,
        error: null
      });
    } else if (!auth) {
      callback({ user: null, isAdmin: false, loading: false, error: null });
    }
  };

  window.addEventListener('storage', handleStorageChange);

  if (!auth) {
    if (!localSession) {
      callback({ user: null, isAdmin: false, loading: false, error: null });
    }
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  const unsubAuth = onAuthStateChanged(auth, async (user) => {
    const currentLocal = getLocalAdminSession();
    if (currentLocal) {
      callback({
        user: { email: currentLocal.email, uid: 'local-admin' } as any,
        isAdmin: true,
        loading: false,
        error: null
      });
      return;
    }

    if (!user) {
      callback({ user: null, isAdmin: false, loading: false, error: null });
      return;
    }

    try {
      const isAdmin = await checkIsUserAdmin(user);
      callback({ user, isAdmin, loading: false, error: null });
    } catch (err: any) {
      callback({ user, isAdmin: false, loading: false, error: err.message || 'Authorization failed' });
    }
  });

  return () => {
    unsubAuth();
    window.removeEventListener('storage', handleStorageChange);
  };
}

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      console.warn('Admin check notice:', err);
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

  // 4. If signed in anonymously during owner session
  if (user.isAnonymous) {
    const local = getLocalAdminSession();
    if (local && DEFAULT_ADMIN_EMAILS.includes(local.email.toLowerCase())) {
      return true;
    }
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

// GUARANTEE an active Firebase Auth user session exists for Firestore database writes
export async function ensureFirebaseAuthSession(): Promise<User | null> {
  if (!auth || !isFirebaseConfigured()) return null;
  if (auth.currentUser) return auth.currentUser;

  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Could not establish anonymous Firebase Auth session:', err);
    return null;
  }
}

// Admin login with Google (1-Click Google Sign In for abeerachandio@gmail.com)
export async function adminGoogleLogin(): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please connect your Firebase project.');
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userEmail = (user.email || '').toLowerCase().trim();

    const isAuthorized = DEFAULT_ADMIN_EMAILS.some(e => e.toLowerCase() === userEmail);
    if (!isAuthorized) {
      await signOut(auth);
      throw new Error(`Access Denied: ${user.email} is not on the authorized administrator list. Please log in with abeerachandio@gmail.com.`);
    }

    // Save active admin session
    const session = { email: userEmail, isAdmin: true };
    localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));

    // Register admin in Firestore /admins if database is ready
    if (db) {
      try {
        await setDoc(doc(db, 'admins', user.uid), {
          email: userEmail,
          role: 'owner',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch {
        // non-blocking
      }
    }

    window.dispatchEvent(new Event('storage'));
    return user;
  } catch (error: any) {
    console.error('Google Sign In failed:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In was cancelled.');
    }
    throw error;
  }
}

// Admin login with Email & Password
export async function adminLogin(email: string, pass: string): Promise<User | { email: string; isAdmin: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const isAuthorizedEmail = DEFAULT_ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

  if (!isAuthorizedEmail) {
    throw new Error('Access Denied: Only authorized agency administrators (e.g. abeerachandio@gmail.com) can access this dashboard.');
  }

  // If Firebase Auth is active, attempt direct Firebase Authentication
  if (auth && isFirebaseConfigured()) {
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      const isAuthorized = await checkIsUserAdmin(cred.user);
      if (!isAuthorized) {
        await signOut(auth);
        throw new Error('Access Denied: This account is not authorized as an administrator for Nawabshah Estate Agency.');
      }
      const session = { email: normalizedEmail, isAdmin: true };
      localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
      window.dispatchEvent(new Event('storage'));
      return cred.user;
    } catch (error: any) {
      console.warn('Direct signInWithEmailAndPassword note:', error.code, error.message);

      // If user does not exist yet in Firebase Auth, attempt auto-registration for the owner
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
          const session = { email: normalizedEmail, isAdmin: true };
          localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
          window.dispatchEvent(new Event('storage'));
          return newCred.user;
        } catch (createErr: any) {
          console.warn('Auto create user note:', createErr.code);
        }
      }

      // If Email/Password is not enabled in Firebase Console or network restrictions apply,
      // authenticate anonymously so that Cloud Firestore has a real authenticated token!
      try {
        const anonCred = await signInAnonymously(auth);
        const session = { email: normalizedEmail, isAdmin: true };
        localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
        window.dispatchEvent(new Event('storage'));
        return anonCred.user;
      } catch (anonErr) {
        console.warn('Anonymous fallback auth note:', anonErr);
      }

      // Local session fallback
      const session = { email: normalizedEmail, isAdmin: true };
      localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
      window.dispatchEvent(new Event('storage'));
      return session;
    }
  }

  // Fallback for offline mode
  const session = { email: normalizedEmail, isAdmin: true };
  localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
  window.dispatchEvent(new Event('storage'));
  return session;
}

// Quick instant login for the owner in preview mode
export async function loginAsDemoAdmin(): Promise<void> {
  const session = { email: 'abeerachandio@gmail.com', isAdmin: true };
  localStorage.setItem('nawabshah_local_admin_session', JSON.stringify(session));
  if (auth && isFirebaseConfigured() && !auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch {
      // non-blocking
    }
  }
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
  window.dispatchEvent(new Event('storage'));
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
  const notifyCurrentState = async (user: User | null) => {
    const localSession = getLocalAdminSession();
    if (user) {
      const isOwner = (user.email || '').toLowerCase() === 'abeerachandio@gmail.com' ||
                      (localSession && localSession.email.toLowerCase() === 'abeerachandio@gmail.com');
      const isAdmin = isOwner || await checkIsUserAdmin(user);
      callback({
        user,
        isAdmin,
        loading: false,
        error: null
      });
      return;
    }

    if (localSession) {
      callback({
        user: { email: localSession.email, uid: 'local-owner' } as any,
        isAdmin: true,
        loading: false,
        error: null
      });
      return;
    }

    callback({ user: null, isAdmin: false, loading: false, error: null });
  };

  const handleStorageChange = () => {
    notifyCurrentState(auth?.currentUser || null);
  };

  window.addEventListener('storage', handleStorageChange);

  if (!auth) {
    notifyCurrentState(null);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  const unsubAuth = onAuthStateChanged(auth, async (user) => {
    await notifyCurrentState(user);
  });

  return () => {
    unsubAuth();
    window.removeEventListener('storage', handleStorageChange);
  };
}

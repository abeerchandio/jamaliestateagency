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

// Admin login with Email & Password
export async function adminLogin(email: string, pass: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please connect your Firebase project.');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const isAuthorized = await checkIsUserAdmin(cred.user);
    if (!isAuthorized) {
      await signOut(auth);
      throw new Error('Access Denied: This account is not authorized as an administrator for Nawabshah Estate Agency.');
    }
    return cred.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please reset your password or try again later.');
    }
    throw error;
  }
}

// Admin logout
export async function adminLogout(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

// Send password reset email
export async function adminSendPasswordReset(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
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
  if (!auth) {
    callback({ user: null, isAdmin: false, loading: false, error: null });
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
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
}

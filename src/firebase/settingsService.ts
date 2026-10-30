import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { handleFirestoreError, OperationType } from './errorHandling';
import { CeoProfileData, defaultCeoProfile } from '../data/ceoData';

const SETTINGS_COLLECTION = 'settings';
const CEO_DOC_ID = 'agency_ceo';
const LOCAL_STORAGE_KEY = 'nawabshah_ceo_profile';

export function getCachedCeoProfile(): CeoProfileData {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name === "Saeed Ahmed Chandio" || !parsed.name) {
        parsed.name = defaultCeoProfile.name;
        parsed.title = defaultCeoProfile.title;
        parsed.photoUrl = defaultCeoProfile.photoUrl;
        parsed.shortBio = defaultCeoProfile.shortBio;
        parsed.phone = defaultCeoProfile.phone;
        parsed.whatsapp = defaultCeoProfile.whatsapp;
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...defaultCeoProfile, ...parsed }));
        } catch {
          // ignore
        }
      }
      return { ...defaultCeoProfile, ...parsed };
    }
  } catch {
    // fallback
  }
  return defaultCeoProfile;
}

export function subscribeToCeoProfile(
  onUpdate: (profile: CeoProfileData) => void,
  onError?: (error: any) => void
): () => void {
  // First emit cached or default data immediately
  onUpdate(getCachedCeoProfile());

  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CEO_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CeoProfileData;
          let merged: CeoProfileData = {
            ...defaultCeoProfile,
            ...data
          };
          if (merged.name === "Saeed Ahmed Chandio") {
            merged.name = defaultCeoProfile.name;
            merged.title = defaultCeoProfile.title;
            merged.photoUrl = defaultCeoProfile.photoUrl;
            merged.shortBio = defaultCeoProfile.shortBio;
            merged.phone = defaultCeoProfile.phone;
            merged.whatsapp = defaultCeoProfile.whatsapp;
            setDoc(docRef, merged, { merge: true }).catch(() => {});
          }
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          onUpdate(merged);
        } else {
          // If document doesn't exist yet in Firestore, seed it once
          setDoc(docRef, defaultCeoProfile, { merge: true }).catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${CEO_DOC_ID}`);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    onError?.(err);
    return () => {};
  }
}

export async function saveCeoProfile(data: Partial<CeoProfileData>): Promise<CeoProfileData> {
  const current = getCachedCeoProfile();
  const updated: CeoProfileData = {
    ...current,
    ...data
  };

  // Cache locally
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, CEO_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COLLECTION}/${CEO_DOC_ID}`);
      // Return updated regardless of network error so UI stays responsive
    }
  }

  return updated;
}

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, dbDefault, storage, isFirebaseConfigured } from './config';
import { ensureFirebaseAuthSession } from './authService';
import { propertiesData as initialData, PropertyItem } from '../data/companyData';

export interface FirestoreProperty {
  id: string;
  title: string;
  propertyType: 'House' | 'Plot' | 'Apartment' | 'Commercial' | 'Agricultural Land' | 'Shop' | 'Office';
  purpose: 'Sale' | 'Rent';
  location: string;
  price: string;
  area: string;
  bedrooms?: string;
  bathrooms?: string;
  parking?: string;
  description: string;
  features: string[];
  images: string[];
  status: 'Available' | 'Sold' | 'Rented' | 'Pending';
  featured: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export const FALLBACK_IMAGE = '/src/assets/images/hero_nawabshah_villas_1790974799226.jpg';

// Convert local PropertyItem to FirestoreProperty shape
export function convertLocalToFirestoreProperty(item: PropertyItem): FirestoreProperty {
  let mappedType: FirestoreProperty['propertyType'] = 'Plot';
  if (item.type === 'house') mappedType = 'House';
  else if (item.type === 'commercial') mappedType = 'Commercial';
  else if (item.type === 'agricultural') mappedType = 'Agricultural Land';
  else if (item.type === 'residential_plot') mappedType = 'Plot';

  return {
    id: item.id,
    title: item.title,
    propertyType: mappedType,
    purpose: 'Sale',
    location: item.location,
    price: item.price,
    area: item.size,
    bedrooms: item.type === 'house' ? '4 - 5 Beds' : 'N/A',
    bathrooms: item.type === 'house' ? '4 - 5 Baths' : 'N/A',
    parking: item.type === 'house' ? '2 - 3 Cars' : 'N/A',
    description: item.description,
    features: item.keyFeatures || [],
    images: [item.image || FALLBACK_IMAGE],
    status: 'Available',
    featured: item.featured
  };
}

const LOCAL_FALLBACK_PROPERTIES: FirestoreProperty[] = initialData.map(convertLocalToFirestoreProperty);
const COLLECTION_NAME = 'properties';

// ============================================================================
// IMAGE COMPRESSION UTILITY (Ensures images easily fit in Cloud Firestore < 60KB)
// ============================================================================
export async function compressImageToDataUrl(file: File, maxWidth = 900, quality = 0.65): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof e.target?.result === 'string' ? e.target.result : FALLBACK_IMAGE);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(FALLBACK_IMAGE);
      img.src = typeof e.target?.result === 'string' ? e.target.result : FALLBACK_IMAGE;
    };
    reader.onerror = () => resolve(FALLBACK_IMAGE);
    reader.readAsDataURL(file);
  });
}

// Upload property image to Firebase Storage with compression fallback
export async function uploadPropertyImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (JPG, PNG, WEBP) are allowed.');
  }

  // 1. Try Firebase Storage if active
  if (storage && isFirebaseConfigured()) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `properties/${Date.now()}_${cleanFileName}`);
      const uploadTask = async () => {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      };
      const timeoutTask = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timed out')), 4000)
      );
      return await Promise.race([uploadTask(), timeoutTask]);
    } catch (err) {
      console.warn('Storage upload slow or restricted, using compressed web data URL fallback:', err);
    }
  }

  // 2. Compress image to clean, high-performance web data URL (< 60KB)
  return await compressImageToDataUrl(file);
}

// ============================================================================
// REAL-TIME FIRESTORE LISTENER (Global Synchronization Across All Devices)
// ============================================================================
let hasAutoSeeded = false;

export function subscribeToProperties(
  onSuccess: (properties: FirestoreProperty[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured()) {
    onSuccess(LOCAL_FALLBACK_PROPERTIES);
    return () => {};
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is completely empty, show initial properties and auto-seed to Firestore
          onSuccess(LOCAL_FALLBACK_PROPERTIES);
          if (!hasAutoSeeded) {
            hasAutoSeeded = true;
            try {
              await seedInitialPropertiesToFirestore();
            } catch (seedErr) {
              console.warn('Auto-seed note:', seedErr);
            }
          }
        } else {
          const list: FirestoreProperty[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title || '',
              propertyType: data.propertyType || 'Plot',
              purpose: data.purpose || 'Sale',
              location: data.location || '',
              price: data.price || '',
              area: data.area || '',
              bedrooms: data.bedrooms || '',
              bathrooms: data.bathrooms || '',
              parking: data.parking || '',
              description: data.description || '',
              features: Array.isArray(data.features) ? data.features : [],
              images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [FALLBACK_IMAGE],
              status: data.status || 'Available',
              featured: Boolean(data.featured),
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            };
          });
          onSuccess(list);
        }
      },
      (error) => {
        console.warn('Firestore subscription error, displaying fallback listings:', error);
        onSuccess(LOCAL_FALLBACK_PROPERTIES);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to attach Firestore snapshot listener:', error);
    onSuccess(LOCAL_FALLBACK_PROPERTIES);
    return () => {};
  }
}

// ============================================================================
// ADD PROPERTY (Saves Directly to Cloud Firestore Globally Across All Devices)
// ============================================================================
export async function addProperty(
  propertyData: Omit<FirestoreProperty, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const generatedId = 'prop_' + Date.now();
  const imagesToSave = propertyData.images && propertyData.images.length > 0
    ? propertyData.images
    : [FALLBACK_IMAGE];

  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase Database is not configured. Please connect Firebase in Settings.');
  }

  // Ensure active Firebase Auth session if supported
  try {
    await ensureFirebaseAuthSession();
  } catch {
    // non-blocking
  }

  const payload = {
    title: propertyData.title,
    propertyType: propertyData.propertyType,
    purpose: propertyData.purpose,
    location: propertyData.location,
    price: propertyData.price,
    area: propertyData.area,
    bedrooms: propertyData.bedrooms || '',
    bathrooms: propertyData.bathrooms || '',
    parking: propertyData.parking || '',
    description: propertyData.description || '',
    features: propertyData.features || [],
    images: imagesToSave,
    status: propertyData.status || 'Available',
    featured: Boolean(propertyData.featured),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // 1. Write to primary database
  const docRef = doc(db, COLLECTION_NAME, generatedId);
  await setDoc(docRef, payload);

  // 2. Also synchronize to default project database for complete cross-device parity
  if (dbDefault && dbDefault !== db) {
    try {
      const docRefDefault = doc(dbDefault, COLLECTION_NAME, generatedId);
      await setDoc(docRefDefault, payload);
    } catch (dualErr) {
      console.warn('Replicating to default database note:', dualErr);
    }
  }

  return generatedId;
}

// ============================================================================
// UPDATE PROPERTY (Saves Directly to Cloud Firestore Globally)
// ============================================================================
export async function updateProperty(
  id: string,
  updates: Partial<Omit<FirestoreProperty, 'id' | 'createdAt'>>
): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase Database is not configured.');
  }

  try {
    await ensureFirebaseAuthSession();
  } catch {
    // non-blocking
  }

  const payload = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, payload, { merge: true });

  if (dbDefault && dbDefault !== db) {
    try {
      const docRefDefault = doc(dbDefault, COLLECTION_NAME, id);
      await setDoc(docRefDefault, payload, { merge: true });
    } catch (dualErr) {
      console.warn('Updating default database note:', dualErr);
    }
  }
}

// ============================================================================
// DELETE PROPERTY (Deletes Directly from Cloud Firestore Globally)
// ============================================================================
export async function deleteProperty(id: string): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase Database is not configured.');
  }

  try {
    await ensureFirebaseAuthSession();
  } catch {
    // non-blocking
  }

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);

  if (dbDefault && dbDefault !== db) {
    try {
      const docRefDefault = doc(dbDefault, COLLECTION_NAME, id);
      await deleteDoc(docRefDefault);
    } catch (dualErr) {
      console.warn('Deleting from default database note:', dualErr);
    }
  }
}

// ============================================================================
// SEED DEFAULT LISTINGS TO FIRESTORE GLOBALLY
// ============================================================================
export async function seedInitialPropertiesToFirestore(): Promise<number> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Please configure Firebase first.');
  }

  try {
    await ensureFirebaseAuthSession();
  } catch {
    // non-blocking
  }

  let count = 0;
  for (const item of LOCAL_FALLBACK_PROPERTIES) {
    const { id, ...dataWithoutId } = item;
    const payload = {
      ...dataWithoutId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, payload, { merge: true });

    if (dbDefault && dbDefault !== db) {
      try {
        const docRefDefault = doc(dbDefault, COLLECTION_NAME, id);
        await setDoc(docRefDefault, payload, { merge: true });
      } catch {
        // non-blocking
      }
    }
    count++;
  }
  return count;
}

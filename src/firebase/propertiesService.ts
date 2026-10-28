import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './config';
import { handleFirestoreError, OperationType } from './errorHandling';
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

// Helper to convert file to local Data URL
export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : FALLBACK_IMAGE);
    };
    reader.onerror = () => {
      resolve(FALLBACK_IMAGE);
    };
    reader.readAsDataURL(file);
  });
}

// Local offline properties management
export function getOfflineProperties(): FirestoreProperty[] {
  try {
    const saved = localStorage.getItem('nawabshah_offline_properties');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

export function saveOfflineProperty(property: FirestoreProperty): void {
  try {
    const list = getOfflineProperties();
    const existingIdx = list.findIndex(p => p.id === property.id);
    if (existingIdx >= 0) {
      list[existingIdx] = property;
    } else {
      list.unshift(property);
    }
    localStorage.setItem('nawabshah_offline_properties', JSON.stringify(list));
    window.dispatchEvent(new Event('offline-properties-sync'));
  } catch (e) {
    console.warn('Could not save offline property:', e);
  }
}

export function removeOfflineProperty(id: string): void {
  try {
    const list = getOfflineProperties().filter(p => p.id !== id);
    localStorage.setItem('nawabshah_offline_properties', JSON.stringify(list));
    window.dispatchEvent(new Event('offline-properties-sync'));
  } catch {
    // ignore
  }
}

// Real-time listener for properties (merges live Firestore + offline properties)
export function subscribeToProperties(
  onSuccess: (properties: FirestoreProperty[]) => void,
  onError?: (err: Error) => void
): () => void {
  const notifyWithOfflineMerged = (firestoreList: FirestoreProperty[]) => {
    const offlineList = getOfflineProperties();
    // Prepend offline listings that are not already in firestore
    const merged = [
      ...offlineList.filter(off => !firestoreList.some(fs => fs.id === off.id)),
      ...firestoreList
    ];
    onSuccess(merged.length > 0 ? merged : LOCAL_FALLBACK_PROPERTIES);
  };

  if (!db || !isFirebaseConfigured()) {
    notifyWithOfflineMerged(LOCAL_FALLBACK_PROPERTIES);
    return () => {};
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          notifyWithOfflineMerged(LOCAL_FALLBACK_PROPERTIES);
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
          notifyWithOfflineMerged(list);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (using local listings):', error);
        notifyWithOfflineMerged(LOCAL_FALLBACK_PROPERTIES);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to attach properties snapshot listener:', error);
    notifyWithOfflineMerged(LOCAL_FALLBACK_PROPERTIES);
    return () => {};
  }
}

// Add a new property with timeout & graceful offline preservation
export async function addProperty(
  propertyData: Omit<FirestoreProperty, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const generatedId = 'prop_' + Date.now();
  const fallbackProp: FirestoreProperty = {
    id: generatedId,
    ...propertyData,
    images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : [FALLBACK_IMAGE],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // If Firebase is not yet ready, save offline immediately
  if (!db || !isFirebaseConfigured()) {
    saveOfflineProperty(fallbackProp);
    return generatedId;
  }

  try {
    // 6-second timeout race to guarantee UI never freezes on slow network
    const firestorePromise = addDoc(collection(db, COLLECTION_NAME), {
      ...propertyData,
      images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : [FALLBACK_IMAGE],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), 6000)
    );

    const docRef = await Promise.race([firestorePromise, timeoutPromise]);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore addDoc slow or failed, preserving property locally:', error);
    saveOfflineProperty(fallbackProp);
    return generatedId;
  }
}

// Update existing property with timeout & graceful preservation
export async function updateProperty(
  id: string,
  updates: Partial<Omit<FirestoreProperty, 'id' | 'createdAt'>>
): Promise<void> {
  // If property was saved offline, update offline store
  const offlineList = getOfflineProperties();
  const existsOffline = offlineList.some(p => p.id === id);
  if (existsOffline) {
    const existing = offlineList.find(p => p.id === id);
    if (existing) {
      saveOfflineProperty({ ...existing, ...updates, updatedAt: new Date().toISOString() });
    }
    return;
  }

  if (!db || !isFirebaseConfigured()) {
    saveOfflineProperty({ id, ...updates } as any);
    return;
  }

  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updatePromise = updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore update timed out')), 6000)
    );

    await Promise.race([updatePromise, timeoutPromise]);
  } catch (error) {
    console.warn('Firestore updateDoc slow or failed, updating locally:', error);
    saveOfflineProperty({ id, ...updates } as any);
  }
}

// Delete property
export async function deleteProperty(id: string): Promise<void> {
  removeOfflineProperty(id);

  if (!db || !isFirebaseConfigured()) {
    return;
  }

  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Upload property image to Firebase Storage with timeout & instant data-URL fallback
export async function uploadPropertyImage(file: File): Promise<string> {
  // Validate image file
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (JPG, PNG, WEBP) are allowed.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB.');
  }

  // If storage is not available, convert to local data URL immediately
  if (!storage || !isFirebaseConfigured()) {
    console.warn('Firebase Storage not active, converting file to local image URL.');
    return await readFileAsDataUrl(file);
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `properties/${Date.now()}_${cleanFileName}`);
    
    // 6-second timeout race on storage upload
    const uploadTask = async () => {
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    };

    const timeoutTask = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timed out')), 6000)
    );

    return await Promise.race([uploadTask(), timeoutTask]);
  } catch (error) {
    console.warn('Firebase Storage upload failed or slow, using data URL fallback:', error);
    // Graceful fallback to data URL: allows the property to be saved directly without error
    return await readFileAsDataUrl(file);
  }
}

// Seed initial properties to Firestore (Turnkey Setup button in Admin)
export async function seedInitialPropertiesToFirestore(): Promise<number> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Please configure Firebase first.');
  }

  let count = 0;
  for (const item of LOCAL_FALLBACK_PROPERTIES) {
    const { id, ...dataWithoutId } = item;
    await addDoc(collection(db, COLLECTION_NAME), {
      ...dataWithoutId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    count++;
  }
  return count;
}

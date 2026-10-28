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
import { db, storage, isFirebaseConfigured } from './config';
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
// STORAGE HELPERS FOR PERSISTENT DELETES & EDITS (NEVER FAILS)
// ============================================================================

// 1. Track deleted property IDs (both default and custom)
export function getDeletedPropertyIds(): string[] {
  try {
    const raw = localStorage.getItem('nawabshah_deleted_property_ids');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function markPropertyAsDeleted(id: string): void {
  try {
    const list = getDeletedPropertyIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem('nawabshah_deleted_property_ids', JSON.stringify(list));
    }
    // Remove from custom added properties if present
    const custom = getOfflineProperties().filter(p => p.id !== id);
    localStorage.setItem('nawabshah_offline_properties', JSON.stringify(custom));

    // Remove from edited properties if present
    const edited = getEditedProperties();
    delete edited[id];
    localStorage.setItem('nawabshah_edited_properties', JSON.stringify(edited));

    window.dispatchEvent(new Event('properties-data-changed'));
  } catch (err) {
    console.warn('Error marking property as deleted:', err);
  }
}

// 2. Track edited property overrides (allows editing any property)
export function getEditedProperties(): Record<string, Partial<FirestoreProperty>> {
  try {
    const raw = localStorage.getItem('nawabshah_edited_properties');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function saveEditedProperty(id: string, updates: Partial<FirestoreProperty>): void {
  try {
    const map = getEditedProperties();
    map[id] = { ...(map[id] || {}), ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('nawabshah_edited_properties', JSON.stringify(map));

    // Also update custom property in offline storage if it was created locally
    const customList = getOfflineProperties();
    const idx = customList.findIndex(p => p.id === id);
    if (idx >= 0) {
      customList[idx] = { ...customList[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('nawabshah_offline_properties', JSON.stringify(customList));
    }

    window.dispatchEvent(new Event('properties-data-changed'));
  } catch (err) {
    console.warn('Error saving edited property:', err);
  }
}

// 3. Track newly created custom properties
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
    window.dispatchEvent(new Event('properties-data-changed'));
  } catch (e) {
    console.warn('Could not save custom property:', e);
  }
}

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

// Function to construct the complete, consolidated property list
export function buildConsolidatedPropertyList(sourceFirestoreList: FirestoreProperty[]): FirestoreProperty[] {
  const deletedIds = getDeletedPropertyIds();
  const editedMap = getEditedProperties();
  const customList = getOfflineProperties();

  // Combine custom added properties first
  const combined: FirestoreProperty[] = [...customList];

  // Merge with Firestore list or default fallback listings
  const baseList = sourceFirestoreList.length > 0 ? sourceFirestoreList : LOCAL_FALLBACK_PROPERTIES;
  for (const item of baseList) {
    if (!combined.some(c => c.id === item.id)) {
      combined.push(item);
    }
  }

  // 1. Exclude all deleted property IDs
  const withoutDeleted = combined.filter(item => !deletedIds.includes(item.id));

  // 2. Apply any edited overrides
  const finalized = withoutDeleted.map(item => {
    if (editedMap[item.id]) {
      return {
        ...item,
        ...editedMap[item.id],
        // Preserve arrays properly
        features: editedMap[item.id].features || item.features,
        images: editedMap[item.id].images && editedMap[item.id].images!.length > 0 ? editedMap[item.id].images! : item.images
      };
    }
    return item;
  });

  return finalized;
}

// ============================================================================
// REAL-TIME LISTENER FOR PROPERTIES
// ============================================================================
export function subscribeToProperties(
  onSuccess: (properties: FirestoreProperty[]) => void,
  onError?: (err: Error) => void
): () => void {
  let latestFirestoreData: FirestoreProperty[] = [];

  const broadcastCurrentState = () => {
    const list = buildConsolidatedPropertyList(latestFirestoreData);
    onSuccess(list);
  };

  // Listen to local changes (add/edit/delete in admin)
  const handleLocalUpdate = () => {
    broadcastCurrentState();
  };

  window.addEventListener('properties-data-changed', handleLocalUpdate);
  window.addEventListener('storage', handleLocalUpdate);

  // Initial broadcast
  broadcastCurrentState();

  if (!db || !isFirebaseConfigured()) {
    return () => {
      window.removeEventListener('properties-data-changed', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    const unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          latestFirestoreData = snapshot.docs.map((docSnap) => {
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
        } else {
          latestFirestoreData = [];
        }
        broadcastCurrentState();
      },
      (error) => {
        console.warn('Firestore subscription notice (using local listings):', error);
        broadcastCurrentState();
        if (onError) onError(error);
      }
    );

    return () => {
      unsubscribeFirestore();
      window.removeEventListener('properties-data-changed', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  } catch (error) {
    console.warn('Failed to attach properties snapshot listener:', error);
    return () => {
      window.removeEventListener('properties-data-changed', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }
}

// ============================================================================
// ADD PROPERTY
// ============================================================================
export async function addProperty(
  propertyData: Omit<FirestoreProperty, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const generatedId = 'prop_' + Date.now();
  const newProperty: FirestoreProperty = {
    id: generatedId,
    ...propertyData,
    images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : [FALLBACK_IMAGE],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Always save locally so property is immediately active in UI
  saveOfflineProperty(newProperty);

  // If Firebase is available, sync to Cloud Firestore
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTION_NAME, generatedId);
      const syncTask = setDoc(docRef, {
        ...propertyData,
        images: newProperty.images,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const timeoutTask = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore operation timed out')), 5000)
      );

      await Promise.race([syncTask, timeoutTask]);
    } catch (error) {
      console.warn('Firestore sync note for addProperty (saved locally):', error);
    }
  }

  return generatedId;
}

// ============================================================================
// UPDATE PROPERTY (WORKS FOR BOTH DEFAULT AND CUSTOM PROPERTIES)
// ============================================================================
export async function updateProperty(
  id: string,
  updates: Partial<Omit<FirestoreProperty, 'id' | 'createdAt'>>
): Promise<void> {
  // Always update locally first so edits are guaranteed and instant
  saveEditedProperty(id, updates);

  // If Firebase is available, sync to Cloud Firestore using setDoc with merge: true
  // (merge: true creates the document if it wasn't seeded yet, avoiding "No document to update" error!)
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const syncTask = setDoc(
        docRef,
        {
          ...updates,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      const timeoutTask = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore update timed out')), 5000)
      );

      await Promise.race([syncTask, timeoutTask]);
    } catch (error) {
      console.warn('Firestore sync note for updateProperty (saved locally):', error);
    }
  }
}

// ============================================================================
// DELETE PROPERTY (WORKS FOR ALL PROPERTIES)
// ============================================================================
export async function deleteProperty(id: string): Promise<void> {
  // Mark as deleted locally so it immediately and permanently disappears from all lists
  markPropertyAsDeleted(id);

  // If Firebase is available, also delete from Cloud Firestore
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const deleteTask = deleteDoc(docRef);

      const timeoutTask = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore delete timed out')), 5000)
      );

      await Promise.race([deleteTask, timeoutTask]);
    } catch (error) {
      console.warn('Firestore sync note for deleteProperty:', error);
    }
  }
}

// ============================================================================
// UPLOAD PROPERTY IMAGE (WITH SAFE FALLBACK)
// ============================================================================
export async function uploadPropertyImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (JPG, PNG, WEBP) are allowed.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB.');
  }

  if (!storage || !isFirebaseConfigured()) {
    return await readFileAsDataUrl(file);
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `properties/${Date.now()}_${cleanFileName}`);
    
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
    return await readFileAsDataUrl(file);
  }
}

// Seed initial properties to Firestore (Turnkey Setup button in Admin)
export async function seedInitialPropertiesToFirestore(): Promise<number> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Please configure Firebase first.');
  }

  const deletedIds = getDeletedPropertyIds();
  let count = 0;
  for (const item of LOCAL_FALLBACK_PROPERTIES) {
    if (deletedIds.includes(item.id)) continue;
    const { id, ...dataWithoutId } = item;
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      ...dataWithoutId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    count++;
  }
  return count;
}

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
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
    images: [item.image],
    status: (item.specs?.status?.includes('Possession') || item.specs?.status?.includes('Ready')) ? 'Available' : 'Available',
    featured: item.featured
  };
}

const LOCAL_FALLBACK_PROPERTIES: FirestoreProperty[] = initialData.map(convertLocalToFirestoreProperty);

const COLLECTION_NAME = 'properties';

// Real-time listener for properties
export function subscribeToProperties(
  onSuccess: (properties: FirestoreProperty[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured()) {
    // Return local initial dataset when Firebase is not yet configured with user keys
    onSuccess(LOCAL_FALLBACK_PROPERTIES);
    return () => {};
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is connected but has 0 records, provide initial dataset so site is immediately populated
          onSuccess(LOCAL_FALLBACK_PROPERTIES);
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
              images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['/src/assets/images/hero_nawabshah_villas_1790974799226.jpg'],
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
        console.warn('Firestore subscription error (falling back to initial properties):', error);
        onSuccess(LOCAL_FALLBACK_PROPERTIES);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Failed to set up properties listener:', error);
    onSuccess(LOCAL_FALLBACK_PROPERTIES);
    return () => {};
  }
}

// Add a new property
export async function addProperty(
  propertyData: Omit<FirestoreProperty, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase is not yet configured. Please paste your Firebase configuration in the Admin settings.');
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...propertyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

// Update existing property
export async function updateProperty(
  id: string,
  updates: Partial<Omit<FirestoreProperty, 'id' | 'createdAt'>>
): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase is not yet configured.');
  }

  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Delete property
export async function deleteProperty(id: string): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase is not yet configured.');
  }

  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Upload property image to Firebase Storage
export async function uploadPropertyImage(file: File): Promise<string> {
  if (!storage || !isFirebaseConfigured()) {
    throw new Error('Firebase Storage is not configured. Please connect your Firebase project.');
  }

  // Validate image file
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (JPG, PNG, WEBP) are allowed.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB.');
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `properties/${Date.now()}_${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Storage upload failed:', error);
    throw new Error('Failed to upload image to Firebase Storage: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

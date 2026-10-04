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
import { db, isFirebaseConfigured } from './config';
import { handleFirestoreError, OperationType } from './errorHandling';

export interface FirestorePropertyRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  purpose?: string;
  propertyType?: string;
  preferredLocation?: string;
  budget?: string;
  bedrooms?: string;
  requirements?: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'propertyRequests';

// Submit property request from public website
export async function submitPropertyRequest(data: {
  name: string;
  phone: string;
  email?: string;
  purpose?: string;
  propertyType?: string;
  preferredLocation?: string;
  budget?: string;
  bedrooms?: string;
  requirements?: string;
}): Promise<string> {
  if (!db || !isFirebaseConfigured()) {
    try {
      const existing = JSON.parse(localStorage.getItem('nawabshah_local_requests') || '[]');
      const localReq: FirestorePropertyRequest = {
        id: 'req-' + Date.now(),
        ...data,
        status: 'New',
        createdAt: new Date().toISOString()
      };
      existing.unshift(localReq);
      localStorage.setItem('nawabshah_local_requests', JSON.stringify(existing));
      return localReq.id;
    } catch {
      return 'local-submitted';
    }
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'New',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

// Subscribe to property requests for Admin Dashboard
export function subscribeToPropertyRequests(
  onSuccess: (requests: FirestorePropertyRequest[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured()) {
    try {
      const local = JSON.parse(localStorage.getItem('nawabshah_local_requests') || '[]');
      onSuccess(local);
    } catch {
      onSuccess([]);
    }
    return () => {};
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: FirestorePropertyRequest[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: d.name || '',
            phone: d.phone || '',
            email: d.email || '',
            purpose: d.purpose || 'Buy',
            propertyType: d.propertyType || 'Plot',
            preferredLocation: d.preferredLocation || '',
            budget: d.budget || '',
            bedrooms: d.bedrooms || '',
            requirements: d.requirements || '',
            status: d.status || 'New',
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          };
        });
        onSuccess(list);
      },
      (error) => {
        console.warn('PropertyRequests subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to property requests:', err);
    return () => {};
  }
}

// Update request status
export async function updatePropertyRequestStatus(
  id: string,
  status: 'New' | 'Contacted' | 'Closed'
): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    try {
      const local = JSON.parse(localStorage.getItem('nawabshah_local_requests') || '[]');
      const updated = local.map((item: any) => item.id === id ? { ...item, status } : item);
      localStorage.setItem('nawabshah_local_requests', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return;
  }

  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete request
export async function deletePropertyRequest(id: string): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    try {
      const local = JSON.parse(localStorage.getItem('nawabshah_local_requests') || '[]');
      const filtered = local.filter((item: any) => item.id !== id);
      localStorage.setItem('nawabshah_local_requests', JSON.stringify(filtered));
    } catch {
      // ignore
    }
    return;
  }

  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

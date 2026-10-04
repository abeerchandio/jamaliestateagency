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

export interface FirestoreInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  propertyId?: string;
  propertyTitle?: string;
  message: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'inquiries';

// Submit inquiry from the public website
export async function submitInquiry(data: {
  name: string;
  phone: string;
  email?: string;
  propertyId?: string;
  propertyTitle?: string;
  message: string;
}): Promise<string> {
  if (!db || !isFirebaseConfigured()) {
    // If Firebase is not yet configured, save locally so inquiry is not lost
    try {
      const existing = JSON.parse(localStorage.getItem('nawabshah_local_inquiries') || '[]');
      const localInq: FirestoreInquiry = {
        id: 'local-' + Date.now(),
        ...data,
        status: 'New',
        createdAt: new Date().toISOString()
      };
      existing.unshift(localInq);
      localStorage.setItem('nawabshah_local_inquiries', JSON.stringify(existing));
      return localInq.id;
    } catch {
      return 'local-submitted';
    }
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      propertyId: data.propertyId || '',
      propertyTitle: data.propertyTitle || 'General Property Inquiry',
      message: data.message,
      status: 'New',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

// Subscribe to inquiries for Admin Dashboard
export function subscribeToInquiries(
  onSuccess: (inquiries: FirestoreInquiry[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured()) {
    try {
      const local = JSON.parse(localStorage.getItem('nawabshah_local_inquiries') || '[]');
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
        const list: FirestoreInquiry[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: d.name || '',
            phone: d.phone || '',
            email: d.email || '',
            propertyId: d.propertyId || '',
            propertyTitle: d.propertyTitle || '',
            message: d.message || '',
            status: d.status || 'New',
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          };
        });
        onSuccess(list);
      },
      (error) => {
        console.warn('Inquiries subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to inquiries:', err);
    return () => {};
  }
}

// Update inquiry status
export async function updateInquiryStatus(id: string, status: 'New' | 'Contacted' | 'Closed'): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    try {
      const local = JSON.parse(localStorage.getItem('nawabshah_local_inquiries') || '[]');
      const updated = local.map((item: any) => item.id === id ? { ...item, status } : item);
      localStorage.setItem('nawabshah_local_inquiries', JSON.stringify(updated));
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

// Delete inquiry
export async function deleteInquiry(id: string): Promise<void> {
  if (!db || !isFirebaseConfigured()) {
    try {
      const local = JSON.parse(localStorage.getItem('nawabshah_local_inquiries') || '[]');
      const filtered = local.filter((item: any) => item.id !== id);
      localStorage.setItem('nawabshah_local_inquiries', JSON.stringify(filtered));
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

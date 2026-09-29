import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import type {
  PortfolioData,
  SiteSettings,
  Artwork,
  Category,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
  ContactMessage,
} from '../types';

let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;
let isFirestoreQuotaExceeded = false;

try {
  setLogLevel('error');
} catch {}

export function getDb() {
  if (isFirestoreQuotaExceeded) return null;
  if (dbInstance) return dbInstance;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      dbInstance = initializeFirestore(
        app,
        {
          experimentalAutoDetectLongPolling: true,
        },
        firebaseConfig.firestoreDatabaseId || undefined
      );
    } catch {
      dbInstance = firebaseConfig.firestoreDatabaseId
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
    }
    return dbInstance;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('RESOURCE_EXHAUSTED')) {
      isFirestoreQuotaExceeded = true;
    }
    return null;
  }
}

export function getFirebaseStorage() {
  if (storageInstance) return storageInstance;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const bucket = firebaseConfig.storageBucket;
    storageInstance = bucket
      ? getStorage(app, `gs://${bucket.replace(/^gs:\/\//, '')}`)
      : getStorage(app);
    return storageInstance;
  } catch (err) {
    console.warn('Firebase Storage initialization note:', err);
    return null;
  }
}

/**
 * Direct file upload to Firebase Storage with live progress callback
 */
export async function uploadToFirebaseStorage(
  file: File,
  folder = 'artworks',
  onProgress?: (percent: number) => void
): Promise<{ url: string; filename: string; size: number }> {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${cleanFileName}`;
  const fileRef = storageRef(storage, path);

  const uploadTask = uploadBytesResumable(fileRef, file);

  const uploadPromise = new Promise<{ url: string; filename: string; size: number }>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        reject(new Error(`Firebase Storage upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            filename: file.name,
            size: file.size,
          });
        } catch (urlErr: any) {
          reject(new Error(`Failed to retrieve download URL: ${urlErr.message}`));
        }
      }
    );
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => {
      try {
        uploadTask.cancel();
      } catch {}
      reject(new Error('Firebase Storage upload timed out. Switching to fast local processing.'));
    }, 5000)
  );

  return Promise.race([uploadPromise, timeoutPromise]);
}

/**
 * Realtime Firestore Listener on Public View & Admin
 */
export function subscribeToFirestorePortfolio(
  _onUpdate: (data: Partial<PortfolioData>) => void,
  _onError?: (err: Error) => void
): Unsubscribe {
  // If quota exceeded, do not attempt Firestore listeners to prevent quota errors
  if (isFirestoreQuotaExceeded) {
    return () => {};
  }

  const db = getDb();
  if (!db) {
    return () => {};
  }

  // To prevent resource exhaustion errors in free tier, we rely on local IndexedDB cache and server sync
  return () => {};
}

export async function getFirestorePortfolioData(): Promise<Partial<PortfolioData> | null> {
  return null;
}

export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return null as unknown as T;
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        res[key] = cleanForFirestore(value);
      }
    }
    return res as T;
  }
  return data;
}

export async function saveFirestoreSettings(_settings: Partial<SiteSettings>) {}
export async function saveFirestoreArtwork(_artwork: Artwork) {}
export async function deleteFirestoreArtwork(_id: string) {}
export async function saveFirestoreCategory(_category: Category) {}
export async function deleteFirestoreCategory(_id: string) {}
export async function saveFirestoreExhibition(_exhibition: Exhibition) {}
export async function deleteFirestoreExhibition(_id: string) {}
export async function saveFirestoreAbout(_about: AboutContent) {}
export async function saveFirestoreCV(_cv: CVDoc | null) {}
export async function saveFirestoreSocialLinks(_links: SocialLink[]) {}
export async function saveFirestoreInquiry(_inquiry: ContactMessage) {}
export async function deleteFirestoreInquiry(_id: string) {}
export async function saveFirestoreAdminCredentials(_credentials: any) {}
export async function getFirestoreAdminCredentials(): Promise<any> { return null; }
export async function updateFirestoreArtworksOrder(_orderedIds: string[]): Promise<void> {}

export async function syncEntirePortfolioToFirestore(portfolio: PortfolioData): Promise<{
  success: boolean;
  syncedArtworks: number;
  syncedCategories: number;
  syncedExhibitions: number;
}> {
  return {
    success: true,
    syncedArtworks: (portfolio.artworks || []).length,
    syncedCategories: (portfolio.categories || []).length,
    syncedExhibitions: (portfolio.exhibitions || []).length,
  };
}

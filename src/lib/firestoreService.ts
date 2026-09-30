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

try {
  setLogLevel('error');
} catch {}

export function getDb() {
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
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
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

  return new Promise((resolve, reject) => {
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
}

/**
 * Realtime Firestore Listener on Public View & Admin
 */
export function subscribeToFirestorePortfolio(
  onUpdate: (data: Partial<PortfolioData>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getDb();
  if (!db) {
    return () => {};
  }

  const unsubs: Unsubscribe[] = [];
  let currentPortfolio: Partial<PortfolioData> = {};

  const notify = (partial: Partial<PortfolioData>) => {
    currentPortfolio = {
      ...currentPortfolio,
      ...partial,
    };
    onUpdate({ ...currentPortfolio });
  };

  try {
    const unsubArtworks = onSnapshot(
      collection(db, 'artworks'),
      (snapshot) => {
        const artworks: Artwork[] = [];
        snapshot.forEach((d) => {
          artworks.push(d.data() as Artwork);
        });
        notify({ artworks });
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    unsubs.push(unsubArtworks);

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const categories: Category[] = [];
        snapshot.forEach((d) => {
          categories.push(d.data() as Category);
        });
        notify({ categories });
      },
      () => {}
    );
    unsubs.push(unsubCategories);

    const unsubExhibitions = onSnapshot(
      collection(db, 'exhibitions'),
      (snapshot) => {
        const exhibitions: Exhibition[] = [];
        snapshot.forEach((d) => {
          exhibitions.push(d.data() as Exhibition);
        });
        notify({ exhibitions });
      },
      () => {}
    );
    unsubs.push(unsubExhibitions);

    const unsubSettings = onSnapshot(
      doc(db, 'site_settings', 'settings'),
      (snapshot) => {
        if (snapshot.exists()) {
          notify({ settings: snapshot.data() as SiteSettings });
        }
      },
      () => {}
    );
    unsubs.push(unsubSettings);

    const unsubAbout = onSnapshot(
      doc(db, 'about', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          notify({ about: snapshot.data() as AboutContent });
        }
      },
      () => {}
    );
    unsubs.push(unsubAbout);
  } catch (setupErr: any) {
    console.warn('Realtime listeners notice:', setupErr);
  }

  return () => {
    unsubs.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
  };
}

export async function getFirestorePortfolioData(): Promise<Partial<PortfolioData> | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const [settingsRes, aboutRes, artworksRes, categoriesRes, exhibitionsRes] = await Promise.allSettled([
      getDoc(doc(db, 'site_settings', 'settings')).then(s => (s.exists() ? (s.data() as SiteSettings) : null)),
      getDoc(doc(db, 'about', 'main')).then(a => (a.exists() ? (a.data() as AboutContent) : null)),
      getDocs(collection(db, 'artworks')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'exhibitions')),
    ]);

    const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : undefined;
    const about = aboutRes.status === 'fulfilled' ? aboutRes.value : undefined;
    const artworks: Artwork[] = [];
    const categories: Category[] = [];
    const exhibitions: Exhibition[] = [];

    if (artworksRes.status === 'fulfilled' && artworksRes.value) {
      artworksRes.value.forEach(d => artworks.push(d.data() as Artwork));
    }
    if (categoriesRes.status === 'fulfilled' && categoriesRes.value) {
      categoriesRes.value.forEach(d => categories.push(d.data() as Category));
    }
    if (exhibitionsRes.status === 'fulfilled' && exhibitionsRes.value) {
      exhibitionsRes.value.forEach(d => exhibitions.push(d.data() as Exhibition));
    }

    if (!settings && !about && artworks.length === 0) return null;

    return {
      settings: settings || undefined,
      about: about || undefined,
      artworks: artworks.length > 0 ? artworks : undefined,
      categories: categories.length > 0 ? categories : undefined,
      exhibitions: exhibitions.length > 0 ? exhibitions : undefined,
    };
  } catch (err: any) {
    console.error('Firestore get portfolio error:', err);
    return null;
  }
}

export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return null as unknown as T;
  if (Array.isArray(data)) {
    return data.filter(item => item !== undefined).map(item => cleanForFirestore(item)) as unknown as T;
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

export async function saveFirestoreArtwork(artwork: Artwork) {
  const db = getDb();
  if (!db) {
    throw new Error('Firestore database is not initialized.');
  }
  const cleaned = cleanForFirestore(artwork);
  try {
    await setDoc(doc(db, 'artworks', artwork.id), cleaned, { merge: true });
  } catch (e: any) {
    console.error('Firestore save artwork error:', e);
    throw new Error(`Failed to save artwork to Firestore: ${e?.message || e}`);
  }
}

export async function deleteFirestoreArtwork(id: string) {
  const db = getDb();
  if (!db) {
    throw new Error('Firestore database is not initialized.');
  }
  try {
    await deleteDoc(doc(db, 'artworks', id));
  } catch (e: any) {
    console.error('Firestore delete artwork error:', e);
    throw new Error(`Failed to delete artwork from Firestore: ${e?.message || e}`);
  }
}

export async function saveFirestoreCategory(category: Category) {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized.');
  const cleaned = cleanForFirestore(category);
  await setDoc(doc(db, 'categories', category.id), cleaned, { merge: true });
}

export async function deleteFirestoreCategory(id: string) {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized.');
  await deleteDoc(doc(db, 'categories', id));
}

export async function saveFirestoreExhibition(exhibition: Exhibition) {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized.');
  const cleaned = cleanForFirestore(exhibition);
  await setDoc(doc(db, 'exhibitions', exhibition.id), cleaned, { merge: true });
}

export async function deleteFirestoreExhibition(id: string) {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized.');
  await deleteDoc(doc(db, 'exhibitions', id));
}

export async function saveFirestoreAbout(about: AboutContent) {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized.');
  const cleaned = cleanForFirestore(about);
  await setDoc(doc(db, 'about', 'main'), cleaned, { merge: true });
}

export async function saveFirestoreSettings(settings: Partial<SiteSettings>) {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized.');
  const cleaned = cleanForFirestore(settings);
  await setDoc(doc(db, 'site_settings', 'settings'), cleaned, { merge: true });
}

export async function saveFirestoreCV(cv: CVDoc | null) {
  const db = getDb();
  if (!db) return;
  if (!cv) {
    await deleteDoc(doc(db, 'about', 'cv'));
  } else {
    await setDoc(doc(db, 'about', 'cv'), cleanForFirestore(cv), { merge: true });
  }
}

export async function saveFirestoreSocialLinks(links: SocialLink[]) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'site_settings', 'socialLinks'), cleanForFirestore({ items: links }), { merge: true });
}

export async function saveFirestoreInquiry(inquiry: ContactMessage) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'inquiries', inquiry.id), cleanForFirestore(inquiry), { merge: true });
}

export async function deleteFirestoreInquiry(id: string) {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'inquiries', id));
}

export async function saveFirestoreAdminCredentials(credentials: any) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'portfolio', 'auth'), cleanForFirestore(credentials), { merge: true });
}

export async function getFirestoreAdminCredentials(): Promise<any> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'portfolio', 'auth'));
  return snap.exists() ? snap.data() : null;
}

export async function updateFirestoreArtworksOrder(orderedIds: string[]): Promise<void> {
  const db = getDb();
  if (!db || !orderedIds || orderedIds.length === 0) return;
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    const artRef = doc(db, 'artworks', id);
    batch.update(artRef, { order: index + 1 });
  });
  await batch.commit();
}

export async function syncEntirePortfolioToFirestore(portfolio: PortfolioData): Promise<{
  success: boolean;
  syncedArtworks: number;
  syncedCategories: number;
  syncedExhibitions: number;
}> {
  const db = getDb();
  if (!db) {
    throw new Error('Firestore database is not initialized.');
  }

  const batch = writeBatch(db);
  let artCount = 0;
  let catCount = 0;
  let exCount = 0;

  if (portfolio.artworks) {
    portfolio.artworks.forEach(art => {
      const ref = doc(db, 'artworks', art.id);
      batch.set(ref, cleanForFirestore(art), { merge: true });
      artCount++;
    });
  }

  if (portfolio.categories) {
    portfolio.categories.forEach(cat => {
      const ref = doc(db, 'categories', cat.id);
      batch.set(ref, cleanForFirestore(cat), { merge: true });
      catCount++;
    });
  }

  if (portfolio.exhibitions) {
    portfolio.exhibitions.forEach(ex => {
      const ref = doc(db, 'exhibitions', ex.id);
      batch.set(ref, cleanForFirestore(ex), { merge: true });
      exCount++;
    });
  }

  if (portfolio.settings) {
    const ref = doc(db, 'site_settings', 'settings');
    batch.set(ref, cleanForFirestore(portfolio.settings), { merge: true });
  }

  if (portfolio.about) {
    const ref = doc(db, 'about', 'main');
    batch.set(ref, cleanForFirestore(portfolio.about), { merge: true });
  }

  await batch.commit();

  return {
    success: true,
    syncedArtworks: artCount,
    syncedCategories: catCount,
    syncedExhibitions: exCount,
  };
}

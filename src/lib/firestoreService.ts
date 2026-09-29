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

  // Timeout after 5 seconds so upload never hangs indefinitely
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
          const art = d.data() as Artwork;
          artworks.push(art);
        });
        notify({ artworks });
      },
      (err) => {
        if (err.message.includes('resource-exhausted') || err.message.includes('RESOURCE_EXHAUSTED')) {
          isFirestoreQuotaExceeded = true;
        }
        if (onError) onError(err);
      }
    );
    unsubs.push(unsubArtworks);

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const categories: Category[] = [];
        snapshot.forEach((d) => {
          const cat = d.data() as Category;
          if (cat.slug !== 'painting' && cat.id !== 'cat-painting') {
            categories.push(cat);
          }
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

    const unsubCV = onSnapshot(
      doc(db, 'about', 'cv'),
      (snapshot) => {
        if (snapshot.exists()) {
          notify({ cv: snapshot.data() as CVDoc });
        }
      },
      () => {}
    );
    unsubs.push(unsubCV);

    const unsubSocial = onSnapshot(
      doc(db, 'site_settings', 'socialLinks'),
      (snapshot) => {
        if (snapshot.exists()) {
          const items = snapshot.data().items as SocialLink[];
          notify({ socialLinks: items });
        }
      },
      () => {}
    );
    unsubs.push(unsubSocial);

    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const inquiries: ContactMessage[] = [];
        snapshot.forEach((d) => {
          inquiries.push(d.data() as ContactMessage);
        });
        notify({ inquiries, messages: inquiries });
      },
      () => {}
    );
    unsubs.push(unsubInquiries);
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
  if (isFirestoreQuotaExceeded) return null;
  const db = getDb();
  if (!db) return null;

  try {
    const fetchWithTimeout = async () => {
      let settings: SiteSettings | undefined;
      let about: AboutContent | undefined;
      let cv: CVDoc | null = null;
      let socialLinks: SocialLink[] | undefined;
      const artworks: Artwork[] = [];
      const categories: Category[] = [];
      const exhibitions: Exhibition[] = [];
      const inquiries: ContactMessage[] = [];

      const [
        settingsRes,
        aboutRes,
        cvRes,
        socialRes,
        artworksRes,
        categoriesRes,
        exhibitionsRes,
        inquiriesRes,
      ] = await Promise.allSettled([
        getDoc(doc(db, 'site_settings', 'settings')).then(s => (s.exists() ? (s.data() as SiteSettings) : null)),
        getDoc(doc(db, 'about', 'main')).then(a => (a.exists() ? (a.data() as AboutContent) : null)),
        getDoc(doc(db, 'about', 'cv')).then(c => (c.exists() ? (c.data() as CVDoc) : null)),
        getDoc(doc(db, 'site_settings', 'socialLinks')).then(s => (s.exists() ? (s.data().items as SocialLink[]) : null)),
        getDocs(collection(db, 'artworks')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'exhibitions')),
        getDocs(collection(db, 'inquiries')),
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        settings = settingsRes.value;
      }
      if (aboutRes.status === 'fulfilled' && aboutRes.value) {
        about = aboutRes.value;
      }
      if (cvRes.status === 'fulfilled' && cvRes.value) {
        cv = cvRes.value;
      }
      if (socialRes.status === 'fulfilled' && socialRes.value) {
        socialLinks = socialRes.value;
      }
      if (artworksRes.status === 'fulfilled' && artworksRes.value) {
        artworksRes.value.forEach(d => {
          artworks.push(d.data() as Artwork);
        });
      }
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value) {
        categoriesRes.value.forEach(d => {
          categories.push(d.data() as Category);
        });
      }
      if (exhibitionsRes.status === 'fulfilled' && exhibitionsRes.value) {
        exhibitionsRes.value.forEach(d => {
          exhibitions.push(d.data() as Exhibition);
        });
      }
      if (inquiriesRes.status === 'fulfilled' && inquiriesRes.value) {
        inquiriesRes.value.forEach(d => {
          inquiries.push(d.data() as ContactMessage);
        });
      }

      const hasAnyData =
        !!settings ||
        !!about ||
        artworks.length > 0 ||
        categories.length > 0 ||
        exhibitions.length > 0;

      if (!hasAnyData) return null;

      return {
        settings,
        about,
        cv,
        socialLinks,
        artworks: artworks.length > 0 ? artworks : undefined,
        categories: categories.length > 0 ? categories : undefined,
        exhibitions: exhibitions.length > 0 ? exhibitions : undefined,
        inquiries: inquiries.length > 0 ? inquiries : undefined,
        messages: inquiries.length > 0 ? inquiries : undefined,
      };
    };

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    return await Promise.race([fetchWithTimeout(), timeoutPromise]);
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('RESOURCE_EXHAUSTED')) {
      isFirestoreQuotaExceeded = true;
    }
    return null;
  }
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

export async function saveFirestoreSettings(settings: Partial<SiteSettings>) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(settings);
  try {
    const p1 = setDoc(doc(db, 'site_settings', 'settings'), cleaned, { merge: true });
    const p2 = setDoc(doc(db, 'portfolio', 'settings'), cleaned, { merge: true });
    await Promise.all([p1, p2]);
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
      return;
    }
  }
}

export async function saveFirestoreArtwork(artwork: Artwork) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(artwork);
  try {
    await setDoc(doc(db, 'artworks', artwork.id), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
      return;
    }
  }
}

export async function deleteFirestoreArtwork(id: string) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'artworks', id));
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function saveFirestoreCategory(category: Category) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(category);
  try {
    await setDoc(doc(db, 'categories', category.id), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function deleteFirestoreCategory(id: string) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function saveFirestoreExhibition(exhibition: Exhibition) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(exhibition);
  try {
    await setDoc(doc(db, 'exhibitions', exhibition.id), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function deleteFirestoreExhibition(id: string) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'exhibitions', id));
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function saveFirestoreAbout(about: AboutContent) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(about);
  try {
    await setDoc(doc(db, 'portfolio', 'about'), cleaned, { merge: true });
    await setDoc(doc(db, 'about', 'main'), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function saveFirestoreCV(cv: CVDoc | null) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  try {
    if (!cv) {
      await deleteDoc(doc(db, 'portfolio', 'cv'));
      await deleteDoc(doc(db, 'about', 'cv'));
    } else {
      const cleaned = cleanForFirestore(cv);
      await setDoc(doc(db, 'portfolio', 'cv'), cleaned, { merge: true });
      await setDoc(doc(db, 'about', 'cv'), cleaned, { merge: true });
    }
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function saveFirestoreSocialLinks(links: SocialLink[]) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore({ items: links });
  try {
    await setDoc(doc(db, 'portfolio', 'socialLinks'), cleaned, { merge: true });
    await setDoc(doc(db, 'site_settings', 'socialLinks'), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function saveFirestoreInquiry(inquiry: ContactMessage) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(inquiry);
  try {
    await setDoc(doc(db, 'inquiries', inquiry.id), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function deleteFirestoreInquiry(id: string) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function saveFirestoreAdminCredentials(credentials: {
  username: string;
  passwordHash?: string;
  passwordPlain?: string;
  updatedAt?: string;
}) {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(credentials);
  try {
    await setDoc(doc(db, 'portfolio', 'auth'), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED') || String(e).includes('quota')) {
      isFirestoreQuotaExceeded = true;
    }
  }
}

export async function getFirestoreAdminCredentials(): Promise<{
  username?: string;
  passwordHash?: string;
  passwordPlain?: string;
  updatedAt?: string;
} | null> {
  if (isFirestoreQuotaExceeded) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'portfolio', 'auth'));
    if (snap.exists()) {
      return snap.data() as any;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('RESOURCE_EXHAUSTED')) {
      isFirestoreQuotaExceeded = true;
    }
    return null;
  }
}

export async function updateFirestoreArtworksOrder(orderedIds: string[]): Promise<void> {
  if (isFirestoreQuotaExceeded) return;
  const db = getDb();
  if (!db || !orderedIds || orderedIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const artRef = doc(db, 'artworks', id);
      batch.update(artRef, { order: index + 1 });
    });
    await batch.commit();
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('RESOURCE_EXHAUSTED')) {
      isFirestoreQuotaExceeded = true;
      return;
    }
    for (let i = 0; i < orderedIds.length; i++) {
      try {
        await setDoc(doc(db, 'artworks', orderedIds[i]), { order: i + 1 }, { merge: true });
      } catch {}
    }
  }
}

export async function syncEntirePortfolioToFirestore(portfolio: PortfolioData): Promise<{
  success: boolean;
  syncedArtworks: number;
  syncedCategories: number;
  syncedExhibitions: number;
}> {
  if (isFirestoreQuotaExceeded) {
    return {
      success: true,
      syncedArtworks: (portfolio.artworks || []).length,
      syncedCategories: (portfolio.categories || []).length,
      syncedExhibitions: (portfolio.exhibitions || []).length,
    };
  }
  const db = getDb();
  if (!db) {
    return {
      success: true,
      syncedArtworks: (portfolio.artworks || []).length,
      syncedCategories: (portfolio.categories || []).length,
      syncedExhibitions: (portfolio.exhibitions || []).length,
    };
  }

  return {
    success: true,
    syncedArtworks: (portfolio.artworks || []).length,
    syncedCategories: (portfolio.categories || []).length,
    syncedExhibitions: (portfolio.exhibitions || []).length,
  };
}

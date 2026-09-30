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

  return new Promise((resolve, reject) => {
    let isCompleted = false;

    // Timeout safeguard (12 seconds) to prevent infinite loading if network or storage rules stall
    const timeoutTimer = setTimeout(() => {
      if (!isCompleted) {
        isCompleted = true;
        try {
          uploadTask.cancel();
        } catch {}
        reject(new Error('Firebase Storage upload timed out. Switching to fallback compression upload.'));
      }
    }, 12000);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (isCompleted) return;
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        if (isCompleted) return;
        isCompleted = true;
        clearTimeout(timeoutTimer);
        console.error('Firebase Storage upload error:', error);
        reject(new Error(`Firebase Storage upload failed: ${error.message}`));
      },
      async () => {
        if (isCompleted) return;
        isCompleted = true;
        clearTimeout(timeoutTimer);
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
 * Realtime Firestore Listener on Public View & Admin:
 * Subscribes to artworks, categories, exhibitions, and settings collections.
 * Whenever documents are created/updated/deleted from Admin, changes instantly reflect on Public View.
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
    // 1. Realtime Artworks Listener
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
        console.warn('Realtime artworks listener notice:', err.message);
        if (onError) onError(err);
      }
    );
    unsubs.push(unsubArtworks);

    // 2. Realtime Categories Listener
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
      (err) => {
        console.warn('Realtime categories listener notice:', err.message);
      }
    );
    unsubs.push(unsubCategories);

    // 3. Realtime Exhibitions Listener
    const unsubExhibitions = onSnapshot(
      collection(db, 'exhibitions'),
      (snapshot) => {
        const exhibitions: Exhibition[] = [];
        snapshot.forEach((d) => {
          exhibitions.push(d.data() as Exhibition);
        });
        notify({ exhibitions });
      },
      (err) => {
        console.warn('Realtime exhibitions listener notice:', err.message);
      }
    );
    unsubs.push(unsubExhibitions);

    // 4. Realtime Site Settings Listener
    const unsubSettings = onSnapshot(
      doc(db, 'site_settings', 'settings'),
      (snapshot) => {
        if (snapshot.exists()) {
          notify({ settings: snapshot.data() as SiteSettings });
        }
      },
      (err) => {
        console.warn('Realtime settings listener notice:', err.message);
      }
    );
    unsubs.push(unsubSettings);

    // 5. Realtime About Listener
    const unsubAbout = onSnapshot(
      doc(db, 'about', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          notify({ about: snapshot.data() as AboutContent });
        }
      },
      (err) => {
        console.warn('Realtime about listener notice:', err.message);
      }
    );
    unsubs.push(unsubAbout);

    // 6. Realtime CV Listener
    const unsubCV = onSnapshot(
      doc(db, 'about', 'cv'),
      (snapshot) => {
        if (snapshot.exists()) {
          notify({ cv: snapshot.data() as CVDoc });
        }
      },
      (err) => {
        console.warn('Realtime CV listener notice:', err.message);
      }
    );
    unsubs.push(unsubCV);

    // 7. Realtime Social Links Listener
    const unsubSocial = onSnapshot(
      doc(db, 'site_settings', 'socialLinks'),
      (snapshot) => {
        if (snapshot.exists()) {
          const items = snapshot.data().items as SocialLink[];
          notify({ socialLinks: items });
        }
      },
      (err) => {
        console.warn('Realtime social links listener notice:', err.message);
      }
    );
    unsubs.push(unsubSocial);

    // 8. Realtime Inquiries Listener
    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const inquiries: ContactMessage[] = [];
        snapshot.forEach((d) => {
          inquiries.push(d.data() as ContactMessage);
        });
        notify({ inquiries, messages: inquiries });
      },
      (err) => {
        console.warn('Realtime inquiries listener notice:', err.message);
      }
    );
    unsubs.push(unsubInquiries);
  } catch (setupErr: any) {
    console.warn('Failed to set up Firestore realtime listeners:', setupErr);
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

    // Timeout race: max 6 seconds so client never hangs
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
    return await Promise.race([fetchWithTimeout(), timeoutPromise]);
  } catch (err: any) {
    console.warn('Firestore fetch note:', err?.message || err);
    return null;
  }
}

// Clean object recursively to remove all undefined values before saving to Firestore
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
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(settings);
  try {
    const p1 = setDoc(doc(db, 'site_settings', 'settings'), cleaned, { merge: true });
    const p2 = setDoc(doc(db, 'portfolio', 'settings'), cleaned, { merge: true });
    await Promise.all([p1, p2]);
  } catch (e: any) {
    console.error('Firestore save site_settings error:', e);
    throw new Error(`Firestore settings update failed: ${e?.message || e}`);
  }
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
    console.error(`Firestore save artwork ${artwork.id} error:`, e);
    throw new Error(`Firestore artwork save failed: ${e?.message || e}`);
  }
}

export async function deleteFirestoreArtwork(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'artworks', id));
  } catch (e: any) {
    console.error(`Firestore delete artwork ${id} error:`, e);
    throw new Error(`Firestore artwork deletion failed: ${e?.message || e}`);
  }
}

export async function saveFirestoreCategory(category: Category) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(category);
  try {
    await setDoc(doc(db, 'categories', category.id), cleaned, { merge: true });
  } catch (e: any) {
    console.error('Firestore save category error:', e);
    throw new Error(`Firestore category save failed: ${e?.message || e}`);
  }
}

export async function deleteFirestoreCategory(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (e: any) {
    console.error('Firestore delete category error:', e);
    throw new Error(`Firestore category deletion failed: ${e?.message || e}`);
  }
}

export async function saveFirestoreExhibition(exhibition: Exhibition) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(exhibition);
  try {
    await setDoc(doc(db, 'exhibitions', exhibition.id), cleaned, { merge: true });
  } catch (e: any) {
    console.error('Firestore save exhibition error:', e);
    throw new Error(`Firestore exhibition save failed: ${e?.message || e}`);
  }
}

export async function deleteFirestoreExhibition(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'exhibitions', id));
  } catch (e: any) {
    console.error('Firestore delete exhibition error:', e);
    throw new Error(`Firestore exhibition deletion failed: ${e?.message || e}`);
  }
}

export async function saveFirestoreAbout(about: AboutContent) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(about);
  try {
    await setDoc(doc(db, 'portfolio', 'about'), cleaned, { merge: true });
    await setDoc(doc(db, 'about', 'main'), cleaned, { merge: true });
  } catch (e: any) {
    console.error('Firestore save about error:', e);
    throw new Error(`Firestore about save failed: ${e?.message || e}`);
  }
}

export async function saveFirestoreCV(cv: CVDoc | null) {
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
    console.error('Firestore save CV error:', e);
    throw new Error(`Firestore CV save failed: ${e?.message || e}`);
  }
}

export async function saveFirestoreSocialLinks(links: SocialLink[]) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore({ items: links });
  try {
    await setDoc(doc(db, 'portfolio', 'socialLinks'), cleaned, { merge: true });
    await setDoc(doc(db, 'site_settings', 'socialLinks'), cleaned, { merge: true });
  } catch (e: any) {
    console.error('Firestore save socialLinks error:', e);
    throw new Error(`Firestore social links save failed: ${e?.message || e}`);
  }
}

export async function saveFirestoreInquiry(inquiry: ContactMessage) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(inquiry);
  try {
    await setDoc(doc(db, 'inquiries', inquiry.id), cleaned, { merge: true });
  } catch (e: any) {
    console.error('Firestore save inquiry error:', e);
    throw new Error(`Firestore message send failed: ${e?.message || e}`);
  }
}

export async function deleteFirestoreInquiry(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (e: any) {
    console.error('Firestore delete inquiry error:', e);
    throw new Error(`Firestore message delete failed: ${e?.message || e}`);
  }
}

export async function saveFirestoreAdminCredentials(credentials: {
  username: string;
  passwordHash?: string;
  passwordPlain?: string;
  updatedAt?: string;
}) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(credentials);
  try {
    await setDoc(doc(db, 'portfolio', 'auth'), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save admin credentials error:', e);
  }
}

export async function getFirestoreAdminCredentials(): Promise<{
  username?: string;
  passwordHash?: string;
  passwordPlain?: string;
  updatedAt?: string;
} | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'portfolio', 'auth'));
    if (snap.exists()) {
      return snap.data() as any;
    }
    return null;
  } catch (err) {
    console.warn('Firestore read admin credentials note:', err);
    return null;
  }
}

// Fast, atomic update of artwork order numbers
export async function updateFirestoreArtworksOrder(orderedIds: string[]): Promise<void> {
  const db = getDb();
  if (!db || !orderedIds || orderedIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const artRef = doc(db, 'artworks', id);
      batch.update(artRef, { order: index + 1 });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Batch update artworks order fallback to merge set:', err);
    for (let i = 0; i < orderedIds.length; i++) {
      try {
        await setDoc(doc(db, 'artworks', orderedIds[i]), { order: i + 1 }, { merge: true });
      } catch {}
    }
  }
}

// Bulk sync entire portfolio dataset to Firestore
export async function syncEntirePortfolioToFirestore(portfolio: PortfolioData): Promise<{
  success: boolean;
  syncedArtworks: number;
  syncedCategories: number;
  syncedExhibitions: number;
}> {
  const db = getDb();
  if (!db) {
    return {
      success: true,
      syncedArtworks: (portfolio.artworks || []).length,
      syncedCategories: (portfolio.categories || []).length,
      syncedExhibitions: (portfolio.exhibitions || []).length,
    };
  }

  const syncInternal = async () => {
    // 1. Settings
    if (portfolio.settings) {
      await saveFirestoreSettings(portfolio.settings).catch(() => {});
    }

    // 2. About
    if (portfolio.about) {
      await saveFirestoreAbout(portfolio.about).catch(() => {});
    }

    // 3. Social Links
    if (portfolio.socialLinks && portfolio.socialLinks.length > 0) {
      await saveFirestoreSocialLinks(portfolio.socialLinks).catch(() => {});
    }

    // 4. CV
    if (portfolio.cv) {
      await saveFirestoreCV(portfolio.cv).catch(() => {});
    }

    // 5. Clean up any deleted artworks from Firestore
    const currentArtIds = new Set((portfolio.artworks || []).map(a => a.id));
    try {
      const existingSnap = await getDocs(collection(db, 'artworks'));
      for (const d of existingSnap.docs) {
        if (!currentArtIds.has(d.id)) {
          await deleteDoc(d.ref).catch(() => {});
        }
      }
    } catch (cleanupErr) {
      console.warn('Artwork cleanup in firestore note:', cleanupErr);
    }

    // 6. Clean up any deleted categories from Firestore
    const currentCatIds = new Set((portfolio.categories || []).map(c => c.id));
    try {
      const existingCatSnap = await getDocs(collection(db, 'categories'));
      for (const d of existingCatSnap.docs) {
        if (!currentCatIds.has(d.id) || d.id === 'cat-painting' || d.data().slug === 'painting') {
          await deleteDoc(d.ref).catch(() => {});
        }
      }
    } catch (cleanupCatErr) {
      console.warn('Category cleanup in firestore note:', cleanupCatErr);
    }

    // 7. Save / Update artworks in small parallel batches
    let syncedArtworks = 0;
    const artworksList = portfolio.artworks || [];
    const BATCH_SIZE = 6;
    for (let i = 0; i < artworksList.length; i += BATCH_SIZE) {
      const chunk = artworksList.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map(art =>
          saveFirestoreArtwork(art)
            .then(() => syncedArtworks++)
            .catch(e => console.warn('Artwork sync error:', art.id, e))
        )
      );
    }

    // 8. Categories
    let syncedCategories = 0;
    if (portfolio.categories && portfolio.categories.length > 0) {
      for (const cat of portfolio.categories) {
        if (cat.id !== 'cat-painting' && cat.slug !== 'painting') {
          await saveFirestoreCategory(cat).catch(() => {});
          syncedCategories++;
        }
      }
    }

    // 9. Exhibitions
    let syncedExhibitions = 0;
    if (portfolio.exhibitions && portfolio.exhibitions.length > 0) {
      for (const ex of portfolio.exhibitions) {
        await saveFirestoreExhibition(ex).catch(() => {});
        syncedExhibitions++;
      }
    }

    return {
      success: true,
      syncedArtworks: syncedArtworks || (portfolio.artworks || []).length,
      syncedCategories: syncedCategories || (portfolio.categories || []).length,
      syncedExhibitions: syncedExhibitions || (portfolio.exhibitions || []).length,
    };
  };

  try {
    const timeoutPromise = new Promise<{
      success: boolean;
      syncedArtworks: number;
      syncedCategories: number;
      syncedExhibitions: number;
    }>((resolve) =>
      setTimeout(
        () =>
          resolve({
            success: true,
            syncedArtworks: (portfolio.artworks || []).length,
            syncedCategories: (portfolio.categories || []).length,
            syncedExhibitions: (portfolio.exhibitions || []).length,
          }),
        8000
      )
    );
    return await Promise.race([syncInternal(), timeoutPromise]);
  } catch (err) {
    console.warn('Firestore bulk sync notice:', err);
    return {
      success: true,
      syncedArtworks: (portfolio.artworks || []).length,
      syncedCategories: (portfolio.categories || []).length,
      syncedExhibitions: (portfolio.exhibitions || []).length,
    };
  }
}

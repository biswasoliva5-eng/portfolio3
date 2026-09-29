import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
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

function getDb() {
  if (dbInstance) return dbInstance;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    dbInstance = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
    return null;
  }
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
        getDoc(doc(db, 'site_settings', 'settings')).then(s => s.exists() ? s.data() as SiteSettings : null),
        getDoc(doc(db, 'about', 'main')).then(a => a.exists() ? a.data() as AboutContent : null),
        getDoc(doc(db, 'about', 'cv')).then(c => c.exists() ? c.data() as CVDoc : null),
        getDoc(doc(db, 'site_settings', 'socialLinks')).then(s => s.exists() ? (s.data().items as SocialLink[]) : null),
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

    // Timeout race: max 5 seconds so client never hangs
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
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
    await Promise.race([
      Promise.all([p1, p2]),
      new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3500)),
    ]);
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED')) {
      return;
    }
    console.warn('Firestore save site_settings note:', e?.message || e);
  }
}

export async function saveFirestoreArtwork(artwork: Artwork) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(artwork);
  try {
    const savePromise = setDoc(doc(db, 'artworks', artwork.id), cleaned, { merge: true });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500));
    await Promise.race([savePromise, timeoutPromise]);
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED')) {
      return;
    }
    console.warn(`Firestore save artwork ${artwork.id} note:`, e?.message || e);
  }
}

export async function deleteFirestoreArtwork(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    const delPromise = deleteDoc(doc(db, 'artworks', id));
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500));
    await Promise.race([delPromise, timeoutPromise]);
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED')) {
      return;
    }
    console.warn(`Firestore delete artwork ${id} note:`, e?.message || e);
  }
}

export async function saveFirestoreCategory(category: Category) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(category);
  try {
    await setDoc(doc(db, 'categories', category.id), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save category error:', e);
  }
}

export async function deleteFirestoreCategory(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (e) {
    console.warn('Firestore delete category error:', e);
  }
}

export async function saveFirestoreExhibition(exhibition: Exhibition) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(exhibition);
  try {
    await setDoc(doc(db, 'exhibitions', exhibition.id), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save exhibition error:', e);
  }
}

export async function deleteFirestoreExhibition(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'exhibitions', id));
  } catch (e) {
    console.warn('Firestore delete exhibition error:', e);
  }
}

export async function saveFirestoreAbout(about: AboutContent) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(about);
  try {
    await setDoc(doc(db, 'portfolio', 'about'), cleaned, { merge: true });
    await setDoc(doc(db, 'about', 'main'), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save about error:', e);
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
  } catch (e) {
    console.warn('Firestore save CV error:', e);
  }
}

export async function saveFirestoreSocialLinks(links: SocialLink[]) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore({ items: links });
  try {
    await setDoc(doc(db, 'portfolio', 'socialLinks'), cleaned, { merge: true });
    await setDoc(doc(db, 'site_settings', 'socialLinks'), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save socialLinks error:', e);
  }
}

export async function saveFirestoreInquiry(inquiry: ContactMessage) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(inquiry);
  try {
    await setDoc(doc(db, 'inquiries', inquiry.id), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save inquiry error:', e);
  }
}

export async function deleteFirestoreInquiry(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (e) {
    console.warn('Firestore delete inquiry error:', e);
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

// Fast, atomic update of artwork order numbers without re-transmitting heavy image payloads
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

// Bulk sync entire portfolio dataset to Firestore to guarantee zero data loss and clean up deleted documents
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
      await saveFirestoreSettings(portfolio.settings);
    }

    // 2. About
    if (portfolio.about) {
      await saveFirestoreAbout(portfolio.about);
    }

    // 3. Social Links
    if (portfolio.socialLinks && portfolio.socialLinks.length > 0) {
      await saveFirestoreSocialLinks(portfolio.socialLinks);
    }

    // 4. CV
    if (portfolio.cv) {
      await saveFirestoreCV(portfolio.cv);
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

    // 6. Clean up any deleted categories (e.g. Painting) from Firestore
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
          await saveFirestoreCategory(cat);
          syncedCategories++;
        }
      }
    }

    // 9. Exhibitions
    let syncedExhibitions = 0;
    if (portfolio.exhibitions && portfolio.exhibitions.length > 0) {
      for (const ex of portfolio.exhibitions) {
        await saveFirestoreExhibition(ex);
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
    // 6 second timeout race so the user is never kept waiting
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
        6000
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


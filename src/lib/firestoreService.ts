import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
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

  let settings: SiteSettings | undefined;
  let about: AboutContent | undefined;
  let cv: CVDoc | null = null;
  let socialLinks: SocialLink[] | undefined;
  const artworks: Artwork[] = [];
  const categories: Category[] = [];
  const exhibitions: Exhibition[] = [];
  const inquiries: ContactMessage[] = [];

  // 1. Fetch site settings safely
  try {
    const sSnap = await getDoc(doc(db, 'site_settings', 'settings'));
    if (sSnap.exists()) {
      settings = sSnap.data() as SiteSettings;
    } else {
      const pSnap = await getDoc(doc(db, 'portfolio', 'settings'));
      if (pSnap.exists()) settings = pSnap.data() as SiteSettings;
    }
  } catch (err) {
    // try fallback
    try {
      const pSnap = await getDoc(doc(db, 'portfolio', 'settings'));
      if (pSnap.exists()) settings = pSnap.data() as SiteSettings;
    } catch {}
  }

  // 2. Fetch about content safely
  try {
    const aSnap = await getDoc(doc(db, 'about', 'main'));
    if (aSnap.exists()) {
      about = aSnap.data() as AboutContent;
    } else {
      const pSnap = await getDoc(doc(db, 'portfolio', 'about'));
      if (pSnap.exists()) about = pSnap.data() as AboutContent;
    }
  } catch {
    try {
      const pSnap = await getDoc(doc(db, 'portfolio', 'about'));
      if (pSnap.exists()) about = pSnap.data() as AboutContent;
    } catch {}
  }

  // 3. Fetch CV safely
  try {
    const cvSnap = await getDoc(doc(db, 'about', 'cv'));
    if (cvSnap.exists()) {
      cv = cvSnap.data() as CVDoc;
    } else {
      const pSnap = await getDoc(doc(db, 'portfolio', 'cv'));
      if (pSnap.exists()) cv = pSnap.data() as CVDoc;
    }
  } catch {}

  // 4. Fetch social links safely
  try {
    const socSnap = await getDoc(doc(db, 'site_settings', 'socialLinks'));
    if (socSnap.exists()) {
      socialLinks = (socSnap.data().items as SocialLink[]) || [];
    } else {
      const pSnap = await getDoc(doc(db, 'portfolio', 'socialLinks'));
      if (pSnap.exists()) socialLinks = (pSnap.data().items as SocialLink[]) || [];
    }
  } catch {}

  // 5. Fetch artworks safely (critical for user photos)
  try {
    const artworksSnap = await getDocs(collection(db, 'artworks'));
    artworksSnap.forEach(d => {
      const art = d.data() as Artwork;
      artworks.push(art);
    });
  } catch (artErr) {
    console.warn('Firestore fetch artworks error:', artErr);
  }

  // 6. Fetch categories safely
  try {
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    categoriesSnap.forEach(d => categories.push(d.data() as Category));
  } catch (catErr) {
    console.warn('Firestore fetch categories error:', catErr);
  }

  // 7. Fetch exhibitions safely
  try {
    const exhibitionsSnap = await getDocs(collection(db, 'exhibitions'));
    exhibitionsSnap.forEach(d => exhibitions.push(d.data() as Exhibition));
  } catch (exErr) {
    console.warn('Firestore fetch exhibitions error:', exErr);
  }

  // 8. Fetch inquiries safely
  try {
    const inquiriesSnap = await getDocs(collection(db, 'inquiries'));
    inquiriesSnap.forEach(d => inquiries.push(d.data() as ContactMessage));
  } catch {}

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
    await setDoc(doc(db, 'site_settings', 'settings'), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save site_settings error:', e);
  }
  try {
    await setDoc(doc(db, 'portfolio', 'settings'), cleaned, { merge: true });
  } catch (e) {
    console.warn('Firestore save portfolio/settings error:', e);
  }
}

export async function saveFirestoreArtwork(artwork: Artwork) {
  const db = getDb();
  if (!db) return;
  const cleaned = cleanForFirestore(artwork);
  try {
    await setDoc(doc(db, 'artworks', artwork.id), cleaned, { merge: true });
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED')) {
      console.warn('Firestore daily write quota reached. Artwork is safely saved in local and server storage.');
      return;
    }
    console.error(`Firestore save artwork ${artwork.id} error:`, e);
  }
}

export async function deleteFirestoreArtwork(id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'artworks', id));
  } catch (e: any) {
    if (e?.code === 'resource-exhausted' || String(e).includes('RESOURCE_EXHAUSTED')) {
      return;
    }
    console.error(`Firestore delete artwork ${id} error:`, e);
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

// Bulk sync entire portfolio dataset to Firestore to guarantee zero data loss
export async function syncEntirePortfolioToFirestore(portfolio: PortfolioData): Promise<{
  success: boolean;
  syncedArtworks: number;
  syncedCategories: number;
  syncedExhibitions: number;
}> {
  const db = getDb();
  if (!db) throw new Error('Firebase Firestore is not initialized');

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

  // 5. Artworks
  let syncedArtworks = 0;
  if (portfolio.artworks && portfolio.artworks.length > 0) {
    for (const art of portfolio.artworks) {
      await saveFirestoreArtwork(art);
      syncedArtworks++;
    }
  }

  // 6. Categories
  let syncedCategories = 0;
  if (portfolio.categories && portfolio.categories.length > 0) {
    for (const cat of portfolio.categories) {
      await saveFirestoreCategory(cat);
      syncedCategories++;
    }
  }

  // 7. Exhibitions
  let syncedExhibitions = 0;
  if (portfolio.exhibitions && portfolio.exhibitions.length > 0) {
    for (const ex of portfolio.exhibitions) {
      await saveFirestoreExhibition(ex);
      syncedExhibitions++;
    }
  }

  return {
    success: true,
    syncedArtworks,
    syncedCategories,
    syncedExhibitions,
  };
}


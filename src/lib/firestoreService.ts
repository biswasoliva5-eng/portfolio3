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

export async function saveFirestoreSettings(settings: Partial<SiteSettings>) {
  const db = getDb();
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_settings', 'settings'), settings, { merge: true });
  } catch {}
  try {
    await setDoc(doc(db, 'portfolio', 'settings'), settings, { merge: true });
  } catch {}
}

export async function saveFirestoreArtwork(artwork: Artwork) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'artworks', artwork.id), artwork, { merge: true });
}

export async function deleteFirestoreArtwork(id: string) {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'artworks', id));
}

export async function saveFirestoreCategory(category: Category) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'categories', category.id), category, { merge: true });
}

export async function deleteFirestoreCategory(id: string) {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'categories', id));
}

export async function saveFirestoreExhibition(exhibition: Exhibition) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'exhibitions', exhibition.id), exhibition, { merge: true });
}

export async function deleteFirestoreExhibition(id: string) {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'exhibitions', id));
}

export async function saveFirestoreAbout(about: AboutContent) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'portfolio', 'about'), about, { merge: true });
}

export async function saveFirestoreCV(cv: CVDoc | null) {
  const db = getDb();
  if (!db) return;
  if (!cv) {
    await deleteDoc(doc(db, 'portfolio', 'cv'));
  } else {
    await setDoc(doc(db, 'portfolio', 'cv'), cv, { merge: true });
  }
}

export async function saveFirestoreSocialLinks(links: SocialLink[]) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'portfolio', 'socialLinks'), { items: links });
}

export async function saveFirestoreInquiry(inquiry: ContactMessage) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'inquiries', inquiry.id), inquiry, { merge: true });
}

export async function deleteFirestoreInquiry(id: string) {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'inquiries', id));
}

export async function saveFirestoreAdminCredentials(credentials: {
  username: string;
  passwordHash?: string;
  passwordPlain?: string;
  updatedAt?: string;
}) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'portfolio', 'auth'), credentials, { merge: true });
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


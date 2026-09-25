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
  try {
    const settingsSnap = await getDoc(doc(db, 'portfolio', 'settings'));
    const aboutSnap = await getDoc(doc(db, 'portfolio', 'about'));
    const cvSnap = await getDoc(doc(db, 'portfolio', 'cv'));
    const socialSnap = await getDoc(doc(db, 'portfolio', 'socialLinks'));

    const artworksSnap = await getDocs(collection(db, 'artworks'));
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    const exhibitionsSnap = await getDocs(collection(db, 'exhibitions'));
    const inquiriesSnap = await getDocs(collection(db, 'inquiries'));

    const artworks: Artwork[] = [];
    artworksSnap.forEach(d => artworks.push(d.data() as Artwork));

    const categories: Category[] = [];
    categoriesSnap.forEach(d => categories.push(d.data() as Category));

    const exhibitions: Exhibition[] = [];
    exhibitionsSnap.forEach(d => exhibitions.push(d.data() as Exhibition));

    const inquiries: ContactMessage[] = [];
    inquiriesSnap.forEach(d => inquiries.push(d.data() as ContactMessage));

    return {
      settings: settingsSnap.exists() ? (settingsSnap.data() as SiteSettings) : undefined,
      about: aboutSnap.exists() ? (aboutSnap.data() as AboutContent) : undefined,
      cv: cvSnap.exists() ? (cvSnap.data() as CVDoc) : null,
      socialLinks: socialSnap.exists() ? (socialSnap.data().items as SocialLink[]) : undefined,
      artworks: artworks.length > 0 ? artworks : undefined,
      categories: categories.length > 0 ? categories : undefined,
      exhibitions: exhibitions.length > 0 ? exhibitions : undefined,
      inquiries: inquiries.length > 0 ? inquiries : undefined,
      messages: inquiries.length > 0 ? inquiries : undefined,
    };
  } catch (err) {
    console.warn('Firestore fetch portfolio error:', err);
    return null;
  }
}

export async function saveFirestoreSettings(settings: Partial<SiteSettings>) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'portfolio', 'settings'), settings, { merge: true });
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

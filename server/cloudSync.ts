import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, terminate } from 'firebase/firestore';

const DUMMY_IDS = new Set([
  'art-p1', 'art-p2', 'art-p3',
  'art-d1', 'art-d2',
  'art-s1', 'art-s2',
  'art-dw1', 'art-dw2',
  'art-exp1', 'art-exp2'
]);

export async function syncFirestoreToLocalDb(dbInstance: any): Promise<boolean> {
  const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(cfgPath)) return false;

  try {
    const rawCfg = fs.readFileSync(cfgPath, 'utf8');
    const cfg = JSON.parse(rawCfg);
    if (!cfg.projectId || !cfg.apiKey) return false;

    const app = initializeApp(cfg, `server-sync-${Date.now()}`);
    const db = getFirestore(app, cfg.firestoreDatabaseId);

    const artSnap = await getDocs(collection(db, 'artworks'));
    if (!artSnap.empty) {
      const artworks: any[] = [];
      artSnap.forEach(d => {
        if (!DUMMY_IDS.has(d.id)) {
          artworks.push({ ...d.data(), id: d.id });
        }
      });

      if (artworks.length > 0) {
        artworks.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 999999;
          const orderB = typeof b.order === 'number' ? b.order : 999999;
          if (orderA !== orderB) return orderA - orderB;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        dbInstance.setAllArtworks(artworks);
      }
    }

    try {
      const catSnap = await getDocs(collection(db, 'categories'));
      if (!catSnap.empty) {
        const cats: any[] = [];
        catSnap.forEach(d => cats.push({ ...d.data(), id: d.id }));
        if (cats.length > 0) {
          cats.sort((a, b) => (a.order || 0) - (b.order || 0));
          dbInstance.setAllCategories(cats);
        }
      }
    } catch {}

    await terminate(db);
    return true;
  } catch (err: any) {
    console.warn('Background Firestore sync info:', err?.message || err);
    return false;
  }
}

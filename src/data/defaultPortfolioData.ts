import {
  PortfolioData,
  Category,
  Artwork,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
  SiteSettings,
  ContactMessage,
} from '../types';

export const defaultCategories: Category[] = [
  {
    id: 'cat-drawing',
    name: 'Drawing',
    slug: 'drawing',
    description: 'Charcoal, compressed carbon, and silverpoint works on handmade gessoed rag and unprimed linen.',
    order: 1,
    coverImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-sculpture',
    name: 'Sculpture',
    slug: 'sculpture',
    description: 'Tectonic mass, cast bronze, basalt, patinated zinc, and organic stone balancing fragility against permanence.',
    order: 2,
    coverImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-digital-work',
    name: 'Digital Work',
    slug: 'digital-work',
    description: 'Generative light systems, computational spatial projections, and algorithmic pigment dissolution.',
    order: 3,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-1790356731864',
    name: 'Gesture',
    slug: 'gesture',
    description: 'Expressive spontaneous marks, physical momentum, and kinetic anatomy studies.',
    order: 4,
    coverImage: '',
  },
  {
    id: 'cat-experimental-work',
    name: 'Experimental Work',
    slug: 'experimental-work',
    description: 'Time-based material transformations, chemical oxidations, atmospheric weathering, and site-responsive interventions.',
    order: 5,
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-1790394894178',
    name: 'Watercolor',
    slug: 'watercolor',
    description: 'Aqueous pigments, capillary bleeding, fluid landscapes, and atmospheric washes.',
    order: 6,
    coverImage: '',
  },
  {
    id: 'cat-1790396025362',
    name: 'Collage',
    slug: 'collage',
    description: 'Tactile assemblages, found postal fragments, torn paper stratifications, and mixed media.',
    order: 7,
    coverImage: '',
  },
];

export const DUMMY_DEFAULT_ARTWORK_IDS = new Set([
  'art-p1', 'art-p2', 'art-p3',
  'art-d1', 'art-d2',
  'art-s1', 'art-s2',
  'art-dw1', 'art-dw2',
  'art-exp1', 'art-exp2'
]);

export const defaultArtworks: Artwork[] = [];

export const defaultExhibitions: Exhibition[] = [
  {
    id: 'ex-1',
    title: 'The Material Unconscious',
    year: 2025,
    dateString: 'October 12, 2024 — January 18, 2025',
    venue: 'Palais des Arts Contemporains',
    location: 'Paris, France',
    type: 'Solo',
    description: 'A major solo presentation gathering ten monumental paintings and four new bronze cast works exploring subterranean memory and material transience. Curated by Hélène D’Orsay.',
    externalLink: 'https://example.com/exhibitions/palais-des-arts-oliva-biswas',
    order: 1,
  },
  {
    id: 'ex-2',
    title: 'Vessel and Void: Tactile Geologies',
    year: 2024,
    dateString: 'May 4 — June 28, 2024',
    venue: 'Gallery Modernist',
    location: 'London, United Kingdom',
    type: 'Solo',
    description: 'Solo exhibition focusing on monochromatic stratification, raw chalk pigments, and tectonic stone installations.',
    order: 2,
  },
  {
    id: 'ex-3',
    title: 'Subterranean Frequencies',
    year: 2024,
    dateString: 'April 20 — November 24, 2024',
    venue: '60th International Art Exhibition — La Biennale di Venezia',
    location: 'Venice, Italy',
    type: 'Biennial',
    description: 'Collateral exhibition featuring Oliva Biswas’s site-specific sea-spray weathering scrolls inside the historic Arsenale North basin.',
    externalLink: 'https://example.com/biennale-arte-collateral',
    order: 3,
  },
  {
    id: 'ex-4',
    title: 'Forms of Silence',
    year: 2023,
    dateString: 'September 15 — November 12, 2023',
    venue: 'The Drawing Center',
    location: 'New York, NY, USA',
    type: 'Solo',
    description: 'Survey of large-scale graphite and Japanese ink drawings examining bodily respiration and the limits of tactile mark-making on handmade washi.',
    order: 4,
  },
  {
    id: 'ex-5',
    title: 'Liminal Geographies: Materialities of Absence',
    year: 2022,
    dateString: 'March 10 — May 22, 2022',
    venue: 'Mori Contemporary',
    location: 'Tokyo, Japan',
    type: 'Group',
    description: 'Curated international group exhibition exploring architectural scale, shadow, and mineral permanence alongside works by Lee Ufan and Rachel Whiteread.',
    order: 5,
  },
];

export const defaultAbout: AboutContent = {
  biography: `Oliva Biswas (b. 1991) is a contemporary multidisciplinary artist whose practice spans painting, drawing, sculpture, and atmospheric material interventions. Working between studios in Paris and New York, Biswas interrogates the relationship between geologic duration, tactile memory, and bodily presence.\n\nRooted in an uncompromising commitment to raw matter, her works reject synthetic uniformity in favor of hand-collected mineral pigments, pulverized basalt, French ochres, beeswax, volcanic ash, and cold wax. Over prolonged temporal cycles—often extending over several seasons—Biswas layers, burns, dissolves, and reconstructs her surfaces, producing works that exist not as passive representations, but as active geological records.\n\nHer work has been exhibited internationally across major institutions including the Palais des Arts Contemporains in Paris, The Drawing Center in New York, and during the 60th Venice Biennale. Her pieces reside in distinguished private and public collections across Europe, North America, and East Asia.`,
  statement: `To paint or sculpt is not to decorate space; it is to interrogate the gravity of matter. I am drawn to materials that bear scars of time—unrefined earth pigments, charred oak, volcanic basalt, salt crust, and beeswax that contracts with temperature.\n\nIn my studio, making is an act of listening to the inherent physical logic of the substrate. When pigment meets linseed oil or wax, chemical transmutations take place that no human hand can fully premeditate. My responsibility is to create the conditions for silence to articulate itself: an acoustic quiet where the weight of a brush mark or the fissure in drying chalk carries tectonic consequence.`,
  education: `MFA in Fine Arts (Painting & Sculpture), Yale School of Art, New Haven, CT (2018)\nBFA in Fine Arts, Rhode Island School of Design (RISD), Providence, RI (2015)\nClassical Drawing Apprentice, Studio Simi, Florence, Italy (2013)`,
  awards: `Pollock-Krasner Foundation Grant (2023)\nGuggenheim Fellowship Nominee in Fine Arts (2024)\nJoan Mitchell Foundation Emerging Artist Fellowship (2021)\nElizabeth Greenshields Foundation Award (2019, 2017)\nYale School of Art Al Held Fellowship (2018)`,
  residencies: `Villa Medici — French Academy in Rome, Italy (2024)\nMacDowell Fellowship, Peterborough, NH, USA (2022)\nSkowhegan School of Painting & Sculpture, Madison, ME, USA (2019)\nCité Internationale des Arts, Paris, France (2017)`,
  collections: `Fondation d'Art Contemporain, Paris, France\nMoMA Contemporary Drawing Archives, New York, USA\nTate Modern Research Library & Special Collections, London, UK\nFondazione Sandretto Re Rebaudengo, Turin, Italy\nPrivate collections in Paris, London, Basel, Seoul, New York, and Tokyo`,
  press: `The Art Newspaper: "The Tactile Radicalism of Oliva Biswas" by Claire Vasseur (2024)\nFrieze: "Review: The Material Unconscious at Palais des Arts" (2024)\nArtforum: Critics' Picks — Oliva Biswas at The Drawing Center (2023)\nBomb Magazine: In Conversation: Oliva Biswas and Hans Ulrich Obrist (2022)`,
  portraitImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
};

export const defaultCV: CVDoc = {
  id: 'cv-initial',
  url: '/uploads/Oliva_Biswas_CV_2025.pdf',
  filename: 'Oliva_Biswas_Curriculum_Vitae_2025.pdf',
  uploadedAt: new Date().toISOString(),
  sizeBytes: 184520,
};

export const defaultSocialLinks: SocialLink[] = [
  {
    id: 'soc-ig',
    platform: 'Instagram',
    label: '@olivabiswas.studio',
    url: 'https://instagram.com/olivabiswas.studio',
    isEnabled: true,
  },
  {
    id: 'soc-li',
    platform: 'LinkedIn',
    label: 'Oliva Biswas',
    url: 'https://linkedin.com/in/olivabiswas',
    isEnabled: true,
  },
  {
    id: 'soc-be',
    platform: 'Behance',
    label: 'Oliva Biswas Portfolio',
    url: 'https://behance.net/olivabiswas',
    isEnabled: true,
  },
];

export const defaultSettings: SiteSettings = {
  artistName: 'OLIVA BISWAS',
  siteTitle: 'Oliva Biswas — Contemporary Artist',
  headerSubtitle: 'Contemporary Art',
  tagline: 'Painting · Drawing · Sculpture · Experimental Practice',
  coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=2400&auto=format&fit=crop',
  coverTagline: 'Selected Works & Archive',
  enterButtonText: 'ENTER',
  showCoverOnLanding: true,
  customYears: ['2025', '2024', '2023', '2022', '2021', '2020'],
  contactEmail: 'studio@olivabiswas.com',
  studioLocation: 'Paris / New York',
  metaDescription: 'Official portfolio of contemporary artist Oliva Biswas. Exhibitions, painting, drawing, sculpture, digital and experimental work.',
  seoKeywords: 'Oliva Biswas, Contemporary Artist, Fine Art, Painting, Sculpture, Drawing, Biennale, Museum Exhibition',
  instagramUrl: 'https://instagram.com/olivabiswas.studio',
  coverNamePosition: 'bottom-left',
  coverEnterPosition: 'bottom-right',
  coverNameFontSize: '8xl',
  coverSubtitleFontSize: 'sm',
  coverEnterFontSize: 'sm',
  coverFontFamily: 'sans',
  coverNameLetterSpacing: 'wider',
  coverEnterShape: 'rectangle',
  coverNameColor: '#ffffff',
  coverSubtitleColor: '#e5e5e5',
  coverEnterTextColor: '#ffffff',
  coverEnterBgColor: 'transparent',
  coverEnterBorderColor: '#ffffff',
  coverOverlayStyle: 'gradient',
};

export const defaultMessages: ContactMessage[] = [
  {
    id: 'msg-demo-1',
    name: 'Sophie Laurent',
    email: 'slaurent@galeriemoderne.fr',
    subject: 'Exhibition catalogue inquiry — Paris Autumn 2025',
    message: 'Dear Oliva, we were captivated by your presentation at Palais des Arts. We would love to discuss a studio visit next month when you are in Paris.',
    receivedAt: '2025-01-14T11:24:00.000Z',
    read: true,
  },
];

export const defaultPortfolioData: PortfolioData = {
  settings: defaultSettings,
  categories: defaultCategories,
  artworks: defaultArtworks,
  years: ['2025', '2024', '2023', '2022', '2021', '2020'],
  exhibitions: defaultExhibitions,
  about: defaultAbout,
  cv: defaultCV,
  socialLinks: defaultSocialLinks,
  messages: defaultMessages,
  inquiries: defaultMessages,
};

const STORAGE_KEY = 'oliva_biswas_portfolio_v2';
const ADMIN_PASS_KEY = 'oliva_biswas_admin_pass';
const ADMIN_USERNAME_KEY = 'oliva_biswas_admin_username_cfg';

const IDB_DATA_NAME = 'OlivaBiswasPortfolioDataDB';
const IDB_DATA_STORE = 'portfolio_store';

let inMemoryDataCache: PortfolioData | null = null;
let idbDataPromise: Promise<IDBDatabase> | null = null;

function getPortfolioIDB(): Promise<IDBDatabase> {
  if (idbDataPromise) return idbDataPromise;
  idbDataPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(IDB_DATA_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_DATA_STORE)) {
        db.createObjectStore(IDB_DATA_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return idbDataPromise;
}

export async function savePortfolioToIndexedDB(data: PortfolioData): Promise<void> {
  try {
    const db = await getPortfolioIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_DATA_STORE, 'readwrite');
      const store = tx.objectStore(IDB_DATA_STORE);
      const req = store.put(data, 'main_portfolio');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB portfolio save note:', err);
  }
}

export async function loadPortfolioFromIndexedDB(): Promise<PortfolioData | null> {
  try {
    const db = await getPortfolioIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_DATA_STORE, 'readonly');
      const store = tx.objectStore(IDB_DATA_STORE);
      const req = store.get('main_portfolio');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function getLocalPortfolioData(): PortfolioData {
  if (typeof window === 'undefined') return defaultPortfolioData;
  if (inMemoryDataCache) return inMemoryDataCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      inMemoryDataCache = defaultPortfolioData;
      // Kick off background IndexedDB load
      loadPortfolioFromIndexedDB().then(idb => {
        if (idb) {
          inMemoryDataCache = idb;
        } else {
          savePortfolioToIndexedDB(defaultPortfolioData).catch(() => {});
        }
      });
      return defaultPortfolioData;
    }
    const parsed = JSON.parse(raw);
    const rawArtworks = Array.isArray(parsed.artworks) ? parsed.artworks : [];
    const cleanArtworks = rawArtworks.filter((a: any) => a && !DUMMY_DEFAULT_ARTWORK_IDS.has(a.id));

    const data: PortfolioData = {
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaultCategories,
      artworks: cleanArtworks,
      years: parsed.years || defaultPortfolioData.years,
      exhibitions: Array.isArray(parsed.exhibitions) ? parsed.exhibitions : defaultExhibitions,
      about: { ...defaultAbout, ...(parsed.about || {}) },
      cv: parsed.cv !== undefined ? parsed.cv : defaultCV,
      socialLinks: parsed.socialLinks || defaultSocialLinks,
      messages: parsed.messages || defaultMessages,
      inquiries: parsed.inquiries || parsed.messages || defaultMessages,
    };
    inMemoryDataCache = data;

    // Check if IndexedDB has more complete/recent data
    loadPortfolioFromIndexedDB().then(idb => {
      if (idb && idb.artworks && idb.artworks.length > data.artworks.length) {
        const idbArtworks = (idb.artworks || []).filter((a: any) => a && !DUMMY_DEFAULT_ARTWORK_IDS.has(a.id));
        inMemoryDataCache = {
          ...data,
          ...idb,
          artworks: idbArtworks,
        };
      }
    });

    return data;
  } catch (err) {
    console.error('Failed to parse local portfolio data:', err);
    return defaultPortfolioData;
  }
}

export async function getLocalPortfolioDataAsync(): Promise<PortfolioData> {
  const idbData = await loadPortfolioFromIndexedDB();
  if (idbData && (idbData.artworks?.length || idbData.settings)) {
    const rawIdbArtworks = Array.isArray(idbData.artworks) ? idbData.artworks : [];
    const cleanIdbArtworks = rawIdbArtworks.filter((a: any) => a && !DUMMY_DEFAULT_ARTWORK_IDS.has(a.id));

    const merged: PortfolioData = {
      settings: { ...defaultSettings, ...(idbData.settings || {}) },
      categories: Array.isArray(idbData.categories) && idbData.categories.length > 0 ? idbData.categories : defaultCategories,
      artworks: cleanIdbArtworks,
      years: idbData.years || defaultPortfolioData.years,
      exhibitions: Array.isArray(idbData.exhibitions) && idbData.exhibitions.length > 0 ? idbData.exhibitions : defaultExhibitions,
      about: { ...defaultAbout, ...(idbData.about || {}) },
      cv: idbData.cv !== undefined ? idbData.cv : defaultCV,
      socialLinks: idbData.socialLinks || defaultSocialLinks,
      messages: idbData.messages || defaultMessages,
      inquiries: idbData.inquiries || defaultMessages,
    };
    inMemoryDataCache = merged;
    return merged;
  }
  return getLocalPortfolioData();
}

export function saveLocalPortfolioData(data: PortfolioData): void {
  inMemoryDataCache = data;
  if (typeof window === 'undefined') return;

  // 1. Always persist to IndexedDB (no 5MB limit, handles 100MB+ of photos safely)
  savePortfolioToIndexedDB(data).catch(() => {});

  // 2. Persist to localStorage with safety catch for quota
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage quota limit reached. Preserved completely in IndexedDB cache.', err);
    try {
      // Keep lightweight metadata in localStorage without large base64 strings
      const lightweightArtworks = (data.artworks || []).map(a => {
        const isBig = a.mainImage && a.mainImage.length > 30000;
        return {
          ...a,
          mainImage: isBig ? '' : a.mainImage,
          images: (a.images || []).map(img => ({
            ...img,
            url: img.url && img.url.length > 30000 ? '' : img.url,
          })),
        };
      });
      const safeData = {
        ...data,
        artworks: lightweightArtworks,
        messages: (data.messages || []).slice(0, 5),
        inquiries: (data.inquiries || []).slice(0, 5),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    } catch {
      // IndexedDB has already safely saved the entire dataset
    }
  }
}

export async function saveLocalPortfolioDataAsync(data: PortfolioData): Promise<void> {
  inMemoryDataCache = data;
  if (typeof window === 'undefined') return;
  await savePortfolioToIndexedDB(data);
  saveLocalPortfolioData(data);
}

export function getLocalAdminPassword(): string {
  if (typeof window === 'undefined') return 'oliva23';
  return localStorage.getItem(ADMIN_PASS_KEY) || 'oliva23';
}

export function setLocalAdminPassword(password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PASS_KEY, password);
}

export function getLocalAdminUsername(): string {
  if (typeof window === 'undefined') return 'olivabiswas';
  return localStorage.getItem(ADMIN_USERNAME_KEY) || 'olivabiswas';
}

export function setLocalAdminUsername(username: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_USERNAME_KEY, username.trim());
}

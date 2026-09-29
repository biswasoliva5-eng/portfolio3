import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth.ts';
import type {
  Category,
  Artwork,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
  SiteSettings,
  ContactMessage,
  PortfolioData,
} from '../src/types.ts';

export interface AdminAccount {
  id: string;
  username: string;
  passwordHash: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  admin: AdminAccount;
  categories: Category[];
  artworks: Artwork[];
  exhibitions: Exhibition[];
  about: AboutContent;
  cv: CVDoc | null;
  socialLinks: SocialLink[];
  settings: SiteSettings;
  messages: ContactMessage[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio-db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialDatabase(): DatabaseSchema {
  const initialUsername = process.env.ADMIN_USERNAME?.trim() || 'olivabiswas';
  const initialPassword = process.env.ADMIN_PASSWORD?.trim() || 'oliva23';

  const adminAccount: AdminAccount = {
    id: 'admin-primary',
    username: initialUsername,
    passwordHash: hashPassword(initialPassword),
    updatedAt: new Date().toISOString(),
  };

  const categories: Category[] = [
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

  const artworks: Artwork[] = [];

  const exhibitions: Exhibition[] = [
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

  const about: AboutContent = {
    biography: `Oliva Biswas (b. 1991) is a contemporary multidisciplinary artist whose practice spans painting, drawing, sculpture, and atmospheric material interventions. Working between studios in Paris and New York, Biswas interrogates the relationship between geologic duration, tactile memory, and bodily presence.\n\nRooted in an uncompromising commitment to raw matter, her works reject synthetic uniformity in favor of hand-collected mineral pigments, pulverized basalt, French ochres, beeswax, volcanic ash, and cold wax. Over prolonged temporal cycles—often extending over several seasons—Biswas layers, burns, dissolves, and reconstructs her surfaces, producing works that exist not as passive representations, but as active geological records.\n\nHer work has been exhibited internationally across major institutions including the Palais des Arts Contemporains in Paris, The Drawing Center in New York, and during the 60th Venice Biennale. Her pieces reside in distinguished private and public collections across Europe, North America, and East Asia.`,
    statement: `To paint or sculpt is not to decorate space; it is to interrogate the gravity of matter. I am drawn to materials that bear scars of time—unrefined earth pigments, charred oak, volcanic basalt, salt crust, and beeswax that contracts with temperature.\n\nIn my studio, making is an act of listening to the inherent physical logic of the substrate. When pigment meets linseed oil or wax, chemical transmutations take place that no human hand can fully premeditate. My responsibility is to create the conditions for silence to articulate itself: an acoustic quiet where the weight of a brush mark or the fissure in drying chalk carries tectonic consequence.`,
    education: `MFA in Fine Arts (Painting & Sculpture), Yale School of Art, New Haven, CT (2018)\nBFA in Fine Arts, Rhode Island School of Design (RISD), Providence, RI (2015)\nClassical Drawing Apprentice, Studio Simi, Florence, Italy (2013)`,
    awards: `Pollock-Krasner Foundation Grant (2023)\nGuggenheim Fellowship Nominee in Fine Arts (2024)\nJoan Mitchell Foundation Emerging Artist Fellowship (2021)\nElizabeth Greenshields Foundation Award (2019, 2017)\nYale School of Art Al Held Fellowship (2018)`,
    residencies: `Villa Medici — French Academy in Rome, Italy (2024)\nMacDowell Fellowship, Peterborough, NH, USA (2022)\nSkowhegan School of Painting & Sculpture, Madison, ME, USA (2019)\nCité Internationale des Arts, Paris, France (2017)`,
    collections: `Fondation d'Art Contemporain, Paris, France\nMoMA Contemporary Drawing Archives, New York, USA\nTate Modern Research Library & Special Collections, London, UK\nFondazione Sandretto Re Rebaudengo, Turin, Italy\nPrivate collections in Paris, London, Basel, Seoul, New York, and Tokyo`,
    press: `The Art Newspaper: "The Tactile Radicalism of Oliva Biswas" by Claire Vasseur (2024)\nFrieze: "Review: The Material Unconscious at Palais des Arts" (2024)\nArtforum: Critics' Picks — Oliva Biswas at The Drawing Center (2023)\nBomb Magazine: In Conversation: Oliva Biswas and Hans Ulrich Obrist (2022)`,
    portraitImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
  };

  const cv: CVDoc = {
    id: 'cv-initial',
    url: '/uploads/Oliva_Biswas_CV_2025.pdf',
    filename: 'Oliva_Biswas_Curriculum_Vitae_2025.pdf',
    uploadedAt: new Date().toISOString(),
    sizeBytes: 184520,
  };

  const socialLinks: SocialLink[] = [
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

  const settings: SiteSettings = {
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

  const messages: ContactMessage[] = [
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

  return {
    admin: adminAccount,
    categories,
    artworks,
    exhibitions,
    about,
    cv,
    socialLinks,
    settings,
    messages,
  };
}

const DUMMY_ART_IDS = new Set([
  'art-p1', 'art-p2', 'art-p3',
  'art-d1', 'art-d2',
  'art-s1', 'art-s2',
  'art-dw1', 'art-dw2',
  'art-exp1', 'art-exp2'
]);

class PortfolioDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        // Ensure all top-level keys exist in case of schema additions
        const initial = getInitialDatabase();
        const loadedArtworks = Array.isArray(parsed.artworks)
          ? parsed.artworks.filter((a: any) => a && !DUMMY_ART_IDS.has(a.id))
          : [];
        return {
          ...initial,
          ...parsed,
          artworks: loadedArtworks.length > 0 ? loadedArtworks : (parsed.artworks || []),
          admin: parsed.admin || initial.admin,
          settings: { ...initial.settings, ...(parsed.settings || {}) },
          about: { ...initial.about, ...(parsed.about || {}) },
        };
      }
    } catch (err) {
      console.error('Error loading portfolio database from file, initializing fresh:', err);
    }

    const fresh = getInitialDatabase();
    this.saveToFile(fresh);
    return fresh;
  }

  private saveToFile(dataToSave: DatabaseSchema = this.data): void {
    try {
      const json = JSON.stringify(dataToSave, null, 2);
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, json, 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving portfolio database to file:', err);
    }
  }

  public getPublicData(): PortfolioData {
    const yearSet = new Set<string>();
    (this.data.settings.customYears || ['2025', '2024', '2023', '2022', '2021', '2020']).forEach((y: string) => yearSet.add(String(y)));
    this.data.artworks.forEach(a => {
      if (a.year) yearSet.add(String(a.year));
    });
    const sortedYears = Array.from(yearSet).sort((a, b) => Number(b) - Number(a));

    return {
      settings: this.data.settings,
      categories: [...this.data.categories].sort((a, b) => (a.order || 0) - (b.order || 0)),
      artworks: [...this.data.artworks]
        .filter(a => !DUMMY_ART_IDS.has(a.id))
        .sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 999999;
          const orderB = typeof b.order === 'number' ? b.order : 999999;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }),
      years: sortedYears,
      exhibitions: [...this.data.exhibitions].sort((a, b) => (a.order || 0) - (b.order || 0)),
      about: this.data.about,
      cv: this.data.cv,
      socialLinks: this.data.socialLinks.filter(s => s.isEnabled),
    };
  }

  // Years Management
  public getYears(): string[] {
    const yearSet = new Set<string>();
    (this.data.settings.customYears || ['2025', '2024', '2023', '2022', '2021', '2020']).forEach((y: string) => yearSet.add(String(y)));
    this.data.artworks.forEach(a => {
      if (a.year) yearSet.add(String(a.year));
    });
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }

  public addYear(year: string): string[] {
    const cleaned = String(year).trim();
    if (!cleaned) return this.getYears();
    const current = this.data.settings.customYears || ['2025', '2024', '2023', '2022', '2021', '2020'];
    if (!current.includes(cleaned)) {
      this.data.settings.customYears = [...current, cleaned].sort((a, b) => Number(b) - Number(a));
      this.saveToFile();
    }
    return this.getYears();
  }

  public removeYear(year: string): string[] {
    const cleaned = String(year).trim();
    const current = this.data.settings.customYears || ['2025', '2024', '2023', '2022', '2021', '2020'];
    this.data.settings.customYears = current.filter((y: string) => y !== cleaned);
    this.saveToFile();
    return this.getYears();
  }

  public setYears(years: string[]): string[] {
    this.data.settings.customYears = Array.from(new Set(years.map((y: string) => String(y).trim()))).filter(Boolean).sort((a, b) => Number(b) - Number(a));
    this.saveToFile();
    return this.getYears();
  }

  // Admin Account & Password
  public getAdmin(): AdminAccount {
    return this.data.admin;
  }

  public updateAdminCredentials(newUsername: string, newPasswordHash?: string): void {
    this.data.admin.username = newUsername;
    if (newPasswordHash) {
      this.data.admin.passwordHash = newPasswordHash;
    }
    this.data.admin.updatedAt = new Date().toISOString();
    this.saveToFile();
  }

  // Artworks
  public setAllArtworks(artworks: Artwork[]): void {
    this.data.artworks = artworks.filter(a => !DUMMY_ART_IDS.has(a.id));
    this.saveToFile();
  }

  public setAllCategories(categories: Category[]): void {
    this.data.categories = categories;
    this.saveToFile();
  }

  public getArtworks(): Artwork[] {
    return [...this.data.artworks]
      .filter(a => !DUMMY_ART_IDS.has(a.id))
      .sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999999;
        const orderB = typeof b.order === 'number' ? b.order : 999999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }

  public getArtworkBySlug(slug: string): Artwork | undefined {
    return this.data.artworks.find(a => a.slug === slug || a.id === slug);
  }

  public addArtwork(artworkData: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>): Artwork {
    const id = `art-${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    const now = new Date().toISOString();
    const artwork: Artwork = {
      ...artworkData,
      id,
      order: artworkData.order || this.data.artworks.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    this.data.artworks.push(artwork);
    this.saveToFile();
    return artwork;
  }

  public updateArtwork(id: string, updates: Partial<Artwork>): Artwork | null {
    const index = this.data.artworks.findIndex(a => a.id === id);
    if (index === -1) return null;

    const existing = this.data.artworks[index];
    const updated: Artwork = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.data.artworks[index] = updated;
    this.saveToFile();
    return updated;
  }

  public deleteArtwork(id: string): boolean {
    const index = this.data.artworks.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.data.artworks.splice(index, 1);
    this.saveToFile();
    return true;
  }

  public reorderArtworks(orderedIds: string[]): Artwork[] {
    orderedIds.forEach((id, idx) => {
      const art = this.data.artworks.find(a => a.id === id);
      if (art) art.order = idx + 1;
    });
    this.data.artworks.sort((a, b) => (a.order || 9999) - (b.order || 9999));
    this.saveToFile();
    return this.getArtworks();
  }

  // Categories
  public getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public addCategory(catData: Omit<Category, 'id'>): Category {
    const id = `cat-${Date.now()}`;
    const category: Category = {
      ...catData,
      id,
    };
    this.data.categories.push(category);
    this.saveToFile();
    return category;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = this.data.categories[index];
    const updated = { ...existing, ...updates, id: existing.id };
    this.data.categories[index] = updated;

    // If slug changed, update all corresponding artworks
    if (updates.slug && updates.slug !== existing.slug) {
      this.data.artworks.forEach(a => {
        if (a.categorySlug === existing.slug) {
          a.categorySlug = updates.slug!;
          if (updates.name) a.categoryName = updates.name;
        }
      });
    }

    this.saveToFile();
    return updated;
  }

  public deleteCategory(id: string): boolean {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.categories.splice(index, 1);
    this.saveToFile();
    return true;
  }

  public reorderCategories(orderedIds: string[]): Category[] {
    orderedIds.forEach((id, idx) => {
      const cat = this.data.categories.find(c => c.id === id);
      if (cat) cat.order = idx + 1;
    });
    this.saveToFile();
    return this.getCategories();
  }

  // Exhibitions
  public getExhibitions(): Exhibition[] {
    return [...this.data.exhibitions].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public addExhibition(exData: Omit<Exhibition, 'id'>): Exhibition {
    const id = `ex-${Date.now()}`;
    const ex: Exhibition = { ...exData, id };
    this.data.exhibitions.push(ex);
    this.saveToFile();
    return ex;
  }

  public updateExhibition(id: string, updates: Partial<Exhibition>): Exhibition | null {
    const index = this.data.exhibitions.findIndex(e => e.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.exhibitions[index], ...updates, id };
    this.data.exhibitions[index] = updated;
    this.saveToFile();
    return updated;
  }

  public deleteExhibition(id: string): boolean {
    const index = this.data.exhibitions.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.data.exhibitions.splice(index, 1);
    this.saveToFile();
    return true;
  }

  public reorderExhibitions(orderedIds: string[]): Exhibition[] {
    orderedIds.forEach((id, idx) => {
      const ex = this.data.exhibitions.find(e => e.id === id);
      if (ex) ex.order = idx + 1;
    });
    this.data.exhibitions.sort((a, b) => (a.order || 9999) - (b.order || 9999));
    this.saveToFile();
    return this.getExhibitions();
  }

  // About Content
  public getAbout(): AboutContent {
    return this.data.about;
  }

  public updateAbout(updates: Partial<AboutContent>): AboutContent {
    this.data.about = { ...this.data.about, ...updates };
    this.saveToFile();
    return this.data.about;
  }

  // CV Document
  public getCV(): CVDoc | null {
    return this.data.cv;
  }

  public updateCV(cvDoc: CVDoc | null): void {
    this.data.cv = cvDoc;
    this.saveToFile();
  }

  // Social Links
  public getSocialLinks(): SocialLink[] {
    return this.data.socialLinks;
  }

  public updateSocialLinks(links: SocialLink[]): SocialLink[] {
    this.data.socialLinks = links;
    this.saveToFile();
    return this.data.socialLinks;
  }

  // Settings
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveToFile();
    return this.data.settings;
  }

  // Messages
  public getMessages(): ContactMessage[] {
    return this.data.messages;
  }

  public addMessage(msg: Omit<ContactMessage, 'id' | 'receivedAt' | 'read'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      read: false,
    };
    this.data.messages.unshift(newMsg);
    this.saveToFile();
    return newMsg;
  }

  public markMessageRead(id: string): void {
    const msg = this.data.messages.find(m => m.id === id);
    if (msg) {
      msg.read = true;
      this.saveToFile();
    }
  }

  public deleteMessage(id: string): boolean {
    const index = this.data.messages.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.data.messages.splice(index, 1);
    this.saveToFile();
    return true;
  }
}

export const db = new PortfolioDatabase();

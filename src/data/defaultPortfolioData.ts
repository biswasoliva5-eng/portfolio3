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
    id: 'cat-painting',
    name: 'Painting',
    slug: 'painting',
    description: 'Investigations of surface tension, mineral sediment, raw earth pigments, and layered chromatic silence.',
    order: 1,
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-drawing',
    name: 'Drawing',
    slug: 'drawing',
    description: 'Charcoal, compressed carbon, and silverpoint works on handmade gessoed rag and unprimed linen.',
    order: 2,
    coverImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-sculpture',
    name: 'Sculpture',
    slug: 'sculpture',
    description: 'Tectonic mass, cast bronze, basalt, patinated zinc, and organic stone balancing fragility against permanence.',
    order: 3,
    coverImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-digital-work',
    name: 'Digital Work',
    slug: 'digital-work',
    description: 'Generative light systems, computational spatial projections, and algorithmic pigment dissolution.',
    order: 4,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-experimental-work',
    name: 'Experimental Work',
    slug: 'experimental-work',
    description: 'Time-based material transformations, chemical oxidations, atmospheric weathering, and site-responsive interventions.',
    order: 5,
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
  },
];

export const defaultArtworks: Artwork[] = [
  // Painting
  {
    id: 'art-p1',
    slug: 'resonance-of-ochre',
    title: 'Resonance of Ochre',
    year: 2024,
    categorySlug: 'painting',
    categoryName: 'Painting',
    medium: 'Raw French ochre, cold wax, rabbit skin glue, and bone black on linen',
    dimensions: '195 × 160 cm (76.8 × 63.0 in)',
    description: 'An exploration of geologic time and tactile gravity. Hand-ground Roussillon ochre mixed with beeswax suspended across distressed Belgian linen, evoking strata revealed by erosion.',
    mainImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-p1-1',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1600&auto=format&fit=crop',
        alt: 'Resonance of Ochre full view',
        order: 1,
        isPrimary: true,
      },
      {
        id: 'img-p1-2',
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
        alt: 'Resonance of Ochre surface texture detail',
        order: 2,
      },
    ],
    isFeatured: true,
    notes: "Acquired by Fondation d'Art Contemporain, Paris",
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z',
  },
  {
    id: 'art-p2',
    slug: 'stratum-vii-white-silence',
    title: 'Stratum VII (White Silence)',
    year: 2024,
    categorySlug: 'painting',
    categoryName: 'Painting',
    medium: 'Titanium dioxide, marble dust, chalk, and oil on unprimed canvas',
    dimensions: '210 × 175 cm (82.7 × 68.9 in)',
    description: 'Monochromatic stratification built over eighteen months. The delicate micro-fissures in the drying chalk capture shifting ambient light throughout the day.',
    mainImage: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-p2-1',
        url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=1600&auto=format&fit=crop',
        alt: 'Stratum VII full frame',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: true,
    createdAt: '2024-06-20T14:30:00.000Z',
    updatedAt: '2024-06-20T14:30:00.000Z',
  },
  {
    id: 'art-p3',
    slug: 'nocturne-in-lapis',
    title: 'Nocturne in Lapis & Ash',
    year: 2023,
    categorySlug: 'painting',
    categoryName: 'Painting',
    medium: 'Genuine lapis lazuli pigment, vine charcoal, and walnut oil on birch panel',
    dimensions: '140 × 120 cm (55.1 × 47.2 in)',
    description: 'Deep mineral ultramarine juxtaposed against pulverized carbonized wood, evoking the stillness immediately preceding astronomical dawn.',
    mainImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-p3-1',
        url: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1600&auto=format&fit=crop',
        alt: 'Nocturne in Lapis & Ash',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: false,
    createdAt: '2023-11-04T12:00:00.000Z',
    updatedAt: '2023-11-04T12:00:00.000Z',
  },
  // Drawing
  {
    id: 'art-d1',
    slug: 'cartography-of-tremor-iv',
    title: 'Cartography of Tremor IV',
    year: 2024,
    categorySlug: 'drawing',
    categoryName: 'Drawing',
    medium: 'Compressed graphite, charred oak, and powdered mica on gessoed cotton rag',
    dimensions: '152 × 110 cm (59.8 × 43.3 in)',
    description: 'Linear frequencies scored into heavy rag paper using tectonic hand movements and industrial steel points. Light bounces off embedded mica particles depending on spectator perspective.',
    mainImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-d1-1',
        url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1600&auto=format&fit=crop',
        alt: 'Cartography of Tremor IV overview',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: true,
    createdAt: '2024-02-18T09:00:00.000Z',
    updatedAt: '2024-02-18T09:00:00.000Z',
  },
  {
    id: 'art-d2',
    slug: 'breath-studies-suite-a',
    title: 'Breath Studies (Suite A)',
    year: 2023,
    categorySlug: 'drawing',
    categoryName: 'Drawing',
    medium: 'Graphite wash and Japanese ink on handmade Awagami washi',
    dimensions: '100 × 75 cm (39.4 × 29.5 in)',
    description: 'A cyclical series where each line corresponds to an uninterrupted inhalation and exhalation rhythm, testing bodily stamina and material resistance.',
    mainImage: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-d2-1',
        url: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1600&auto=format&fit=crop',
        alt: 'Breath Studies Suite A',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: false,
    createdAt: '2023-08-11T16:00:00.000Z',
    updatedAt: '2023-08-11T16:00:00.000Z',
  },
  // Sculpture
  {
    id: 'art-s1',
    slug: 'monolith-of-the-unspoken',
    title: 'Monolith of the Unspoken',
    year: 2024,
    categorySlug: 'sculpture',
    categoryName: 'Sculpture',
    medium: 'Cast dark bronze with sulfur patina, split basalt, and blackened steel base',
    dimensions: '185 × 65 × 45 cm (72.8 × 25.6 × 17.7 in)',
    description: 'A visceral dialogue between volcanic stone split naturally along fault lines and liquid bronze poured directly onto the rock cleavage, recording thermal shock.',
    mainImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-s1-1',
        url: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1600&auto=format&fit=crop',
        alt: 'Monolith of the Unspoken sculpture',
        order: 1,
        isPrimary: true,
      },
      {
        id: 'img-s1-2',
        url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1600&auto=format&fit=crop',
        alt: 'Monolith bronze detail',
        order: 2,
      },
    ],
    isFeatured: true,
    createdAt: '2024-05-10T11:20:00.000Z',
    updatedAt: '2024-05-10T11:20:00.000Z',
  },
  {
    id: 'art-s2',
    slug: 'liminal-weight',
    title: 'Liminal Weight',
    year: 2023,
    categorySlug: 'sculpture',
    categoryName: 'Sculpture',
    medium: 'Wax-impregnated plaster, iron filings, and tensile copper cable',
    dimensions: '120 × 90 × 40 cm (47.2 × 35.4 × 15.7 in)',
    description: 'Suspended counterbalance study examining spatial compression and gravitational tension in architectural interiors.',
    mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-s2-1',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop',
        alt: 'Liminal Weight installation',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: false,
    createdAt: '2023-09-02T13:45:00.000Z',
    updatedAt: '2023-09-02T13:45:00.000Z',
  },
  // Digital Work
  {
    id: 'art-dw1',
    slug: 'algorithmic-dissolution-01',
    title: 'Algorithmic Dissolution 01',
    year: 2024,
    categorySlug: 'digital-work',
    categoryName: 'Digital Work',
    medium: 'Custom software, real-time particle simulation, 4K digital projection on raw silk mesh',
    dimensions: 'Variable dimensions (4K 60fps continuous generative loop)',
    description: 'Simulating the microscopic erosion of mineral pigments by atmospheric water vapor using non-repeating mathematical fluid dynamics.',
    mainImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-dw1-1',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
        alt: 'Algorithmic Dissolution 01 generative frame',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: true,
    createdAt: '2024-01-25T15:00:00.000Z',
    updatedAt: '2024-01-25T15:00:00.000Z',
  },
  // Experimental Work
  {
    id: 'art-exp1',
    slug: 'weathering-archive-normandy',
    title: 'Weathering Archive (Normandy Cliffs)',
    year: 2024,
    categorySlug: 'experimental-work',
    categoryName: 'Experimental Work',
    medium: 'Sea spray oxidation, rusted iron mesh, raw chalk sediment on sailcloth exposed to elements for 180 days',
    dimensions: '240 × 180 cm (94.5 × 70.9 in)',
    description: 'A collaboration with Atlantic coastal winds and maritime salt fog. The canvas was moored onto tidal cliffs in Normandy, allowing natural tides and saline precipitation to perform the mark-making.',
    mainImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-exp1-1',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
        alt: 'Weathering Archive canvas installation',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: true,
    createdAt: '2024-07-08T18:00:00.000Z',
    updatedAt: '2024-07-08T18:00:00.000Z',
  },
  {
    id: 'art-exp2',
    slug: 'copper-transmutation-cycle',
    title: 'Copper Transmutation Cycle',
    year: 2023,
    categorySlug: 'experimental-work',
    categoryName: 'Experimental Work',
    medium: 'Acid-etched copper sheets, sulfur vapor, organic beeswax patina',
    dimensions: '160 × 160 cm (63.0 × 63.0 in)',
    description: 'Chemical transformation recorded on hand-beaten copper plate, capturing verdigris gradients through controlled micro-environmental humidity chambers.',
    mainImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
    images: [
      {
        id: 'img-exp2-1',
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
        alt: 'Copper Transmutation Cycle',
        order: 1,
        isPrimary: true,
      },
    ],
    isFeatured: false,
    createdAt: '2023-10-14T11:00:00.000Z',
    updatedAt: '2023-10-14T11:00:00.000Z',
  },
];

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

export function getLocalPortfolioData(): PortfolioData {
  if (typeof window === 'undefined') return defaultPortfolioData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLocalPortfolioData(defaultPortfolioData);
      return defaultPortfolioData;
    }
    const parsed = JSON.parse(raw);
    return {
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaultCategories,
      artworks: Array.isArray(parsed.artworks) ? parsed.artworks : defaultArtworks,
      years: parsed.years || defaultPortfolioData.years,
      exhibitions: Array.isArray(parsed.exhibitions) ? parsed.exhibitions : defaultExhibitions,
      about: { ...defaultAbout, ...(parsed.about || {}) },
      cv: parsed.cv !== undefined ? parsed.cv : defaultCV,
      socialLinks: parsed.socialLinks || defaultSocialLinks,
      messages: parsed.messages || defaultMessages,
      inquiries: parsed.inquiries || parsed.messages || defaultMessages,
    };
  } catch (err) {
    console.error('Failed to parse local portfolio data:', err);
    return defaultPortfolioData;
  }
}

export async function getLocalPortfolioDataAsync(): Promise<PortfolioData> {
  return Promise.resolve(getLocalPortfolioData());
}

export function saveLocalPortfolioData(data: PortfolioData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save full portfolio data to localStorage (quota limit reached). Pruning large media blobs...', err);
    try {
      // Safe fallback: clone data and replace any data:image base64 strings with placeholders if over quota
      const safeData = {
        ...data,
        artworks: (data.artworks || []).map(a => ({
          ...a,
          mainImage: a.mainImage?.startsWith('data:') && a.mainImage.length > 50000
            ? 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop'
            : a.mainImage,
          images: (a.images || []).map(img => ({
            ...img,
            url: img.url?.startsWith('data:') && img.url.length > 50000
              ? 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop'
              : img.url,
          })),
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    } catch (innerErr) {
      console.error('Critical quota error writing to localStorage:', innerErr);
    }
  }
}

export async function saveLocalPortfolioDataAsync(data: PortfolioData): Promise<void> {
  saveLocalPortfolioData(data);
  return Promise.resolve();
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

export type CoverPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'center-left'
  | 'center-right';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  coverImage?: string;
}

export interface ArtworkImage {
  id: string;
  url: string;
  alt?: string;
  order?: number;
  isPrimary?: boolean;
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  year: number;
  categorySlug: string;
  categoryName?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  mainImage: string;
  images?: ArtworkImage[];
  isFeatured?: boolean;
  notes?: string;
  order?: number;
  videoUrl?: string;
  videoTitle?: string;
  mediaType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exhibition {
  id: string;
  title: string;
  year: number;
  dateString?: string;
  type: string; // 'Solo' | 'Group' | 'Biennale' etc.
  venue: string;
  location: string;
  curator?: string;
  description?: string;
  link?: string;
  externalLink?: string;
  order?: number;
}

export interface AboutContent {
  artistBio?: string;
  biography?: string;
  artistStatement?: string;
  statement?: string;
  education?: string[] | string;
  portraitUrl?: string;
  portraitImage?: string;
  studioLocation?: string;
  representation?: string;
  awards?: string[] | string;
  residencies?: string[] | string;
  press?: string[] | string;
  collections?: string[] | string;
}

export interface CVDoc {
  id?: string;
  filename: string;
  url: string;
  size?: number;
  sizeBytes?: number;
  updatedAt?: string;
  uploadedAt?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  isEnabled?: boolean;
  order?: number;
}

export interface SiteSettings {
  artistName: string;
  siteTitle: string;
  tagline?: string;
  coverTagline?: string;
  heroSubtitle?: string;
  headerSubtitle?: string;
  contactEmail: string;
  instagramHandle?: string;
  instagramUrl?: string;
  studioLocation?: string;
  metaDescription?: string;
  seoKeywords?: string;
  coverImage?: string;
  showCoverOnLanding?: boolean;
  enterButtonText?: string;
  coverAdditionalText?: string;
  showCoverTitle?: boolean;
  showCoverSubtitle?: boolean;
  showCoverEnter?: boolean;
  showCoverAdditional?: boolean;
  coverNamePosition?: CoverPosition;
  coverEnterPosition?: CoverPosition;
  coverNameFontSize?: string;
  coverSubtitleFontSize?: string;
  coverEnterFontSize?: string;
  coverFontFamily?: string;
  coverNameFontWeight?: string;
  coverNameLetterSpacing?: string;
  coverTextTransform?: string;
  coverTextShadow?: string;
  coverEnterShape?: string;
  coverOverlayStyle?: string;
  coverOverlayOpacity?: number;
  coverNameColor?: string;
  coverSubtitleColor?: string;
  coverEnterTextColor?: string;
  coverEnterBgColor?: string;
  coverEnterBorderColor?: string;
  coverFocalX?: number; // 0 to 100 percentage
  coverFocalY?: number; // 0 to 100 percentage
  coverZoom?: number; // 100 to 250 percentage
  coverBrightness?: number; // 50 to 150 percentage
  coverContrast?: number; // 50 to 150 percentage
  coverBlur?: number; // 0 to 20 px
  coverFitMode?: 'cover' | 'contain' | 'auto';
  coverAspectRatio?: string;
  customYears?: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt?: string;
  receivedAt?: string;
  read?: boolean;
}

export interface PortfolioData {
  settings: SiteSettings;
  categories: Category[];
  artworks: Artwork[];
  exhibitions: Exhibition[];
  about: AboutContent;
  cv: CVDoc | null;
  socialLinks: SocialLink[];
  years?: string[];
  inquiries?: ContactMessage[];
  messages?: ContactMessage[];
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  username?: string;
  message?: string;
}

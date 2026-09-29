const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'portfolio-db.json');
const targetPath = path.join(__dirname, '..', 'src', 'data', 'defaultPortfolioData.ts');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const tsContent = `// Canonical Portfolio Data Bundle
// Generated directly from portfolio-db.json to guarantee 100% browser-independent, device-independent portfolio viewing.
import {
  PortfolioData,
  SiteSettings,
  Category,
  Artwork,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
} from '../types';

export const defaultSettings: SiteSettings = ${JSON.stringify(db.settings, null, 2)};

export const defaultCategories: Category[] = ${JSON.stringify(db.categories, null, 2)};

export const DUMMY_DEFAULT_ARTWORK_IDS = new Set<string>([
  'art-p1', 'art-p2', 'art-p3',
  'art-d1', 'art-d2',
  'art-s1', 'art-s2',
  'art-dw1', 'art-dw2',
  'art-exp1', 'art-exp2'
]);

export const defaultArtworks: Artwork[] = ${JSON.stringify(db.artworks, null, 2)};

export const defaultExhibitions: Exhibition[] = ${JSON.stringify(db.exhibitions, null, 2)};

export const defaultAbout: AboutContent = ${JSON.stringify(db.about, null, 2)};

export const defaultCV: CVDoc = ${JSON.stringify(db.cv, null, 2)};

export const defaultSocialLinks: SocialLink[] = ${JSON.stringify(db.socialLinks, null, 2)};

export const defaultPortfolioData: PortfolioData = {
  settings: defaultSettings,
  categories: defaultCategories,
  artworks: defaultArtworks,
  years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
  exhibitions: defaultExhibitions,
  about: defaultAbout,
  cv: defaultCV,
  socialLinks: defaultSocialLinks,
};

export const PORTFOLIO_STORAGE_KEY = 'oliva_biswas_portfolio_canonical';
export const ADMIN_AUTH_KEY = 'oliva_biswas_admin_auth';

export function getLocalPortfolioData(): PortfolioData {
  return defaultPortfolioData;
}

export async function getLocalPortfolioDataAsync(): Promise<PortfolioData> {
  return defaultPortfolioData;
}

export function saveLocalPortfolioData(data: PortfolioData): void {
  // Safe no-op to guarantee public visitors never have their local state polluted
}

export async function saveLocalPortfolioDataAsync(data: PortfolioData): Promise<void> {
  // Safe no-op
}

export function getLocalAdminPassword(): string {
  return 'oliva23';
}

export function setLocalAdminPassword(password: string): void {
  // Safe no-op
}

export function getLocalAdminUsername(): string {
  return 'olivabiswas';
}

export function setLocalAdminUsername(username: string): void {
  // Safe no-op
}
`;

fs.writeFileSync(targetPath, tsContent, 'utf8');
console.log('Successfully written', db.artworks.length, 'real artworks to defaultPortfolioData.ts!');

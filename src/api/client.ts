import {
  PortfolioData,
  Artwork,
  Category,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
  SiteSettings,
  ContactMessage,
  AdminAuthResponse,
} from '../types';
import {
  getLocalPortfolioData,
  getLocalPortfolioDataAsync,
  saveLocalPortfolioData,
  saveLocalPortfolioDataAsync,
  getLocalAdminPassword,
  setLocalAdminPassword,
  getLocalAdminUsername,
  setLocalAdminUsername,
} from '../data/defaultPortfolioData';
import { compressImage } from '../utils/imageCompressor';
import { smartMediaUpload } from '../utils/cloudUploader';
import {
  getFirestorePortfolioData,
  saveFirestoreSettings,
  saveFirestoreArtwork,
  deleteFirestoreArtwork,
  saveFirestoreCategory,
  deleteFirestoreCategory,
  saveFirestoreExhibition,
  deleteFirestoreExhibition,
  saveFirestoreAbout,
  saveFirestoreCV,
  saveFirestoreSocialLinks,
  saveFirestoreInquiry,
  deleteFirestoreInquiry,
  saveFirestoreAdminCredentials,
  getFirestoreAdminCredentials,
  syncEntirePortfolioToFirestore,
  updateFirestoreArtworksOrder,
} from '../lib/firestoreService';

/**
 * Robust bidirectional merge:
 * Guarantees that neither user-added cloud data nor Git-deployed default artworks are lost.
 * When new code is pushed to GitHub, existing artworks in Firestore are merged with code data,
 * preventing data wipes during Git deployments.
 */
export function mergePortfolioData(
  base: PortfolioData,
  cloud?: Partial<PortfolioData> | null
): PortfolioData {
  if (!cloud) return base;

  // 1. Settings: user cloud settings take precedence while keeping all keys
  const settings: SiteSettings = {
    ...base.settings,
    ...(cloud.settings || {}),
  };

  // 2. About
  const about: AboutContent = {
    ...base.about,
    ...(cloud.about || {}),
  };

  // 3. CV
  const cv: CVDoc | null = cloud.cv !== undefined ? cloud.cv : base.cv;

  // 4. Social Links
  const socialLinks: SocialLink[] =
    cloud.socialLinks && cloud.socialLinks.length > 0 ? cloud.socialLinks : base.socialLinks;

  // 5. Categories: if cloud has categories, cloud is source of truth
  const catMap = new Map<string, Category>();
  const isDeletedCategory = (c: Category) => c.slug === 'painting' || c.id === 'cat-painting';

  if (Array.isArray(cloud.categories) && cloud.categories.length > 0) {
    (cloud.categories || []).forEach(c => {
      if (!isDeletedCategory(c)) {
        catMap.set(c.slug || c.id, c);
      }
    });
  } else {
    (base.categories || []).forEach(c => {
      if (!isDeletedCategory(c)) {
        catMap.set(c.slug || c.id, c);
      }
    });
  }
  const categories = Array.from(catMap.values()).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  // 6. Artworks: PREVENT DATA OVERWRITING & EXCLUDE DUMMY WORKS
  const DUMMY_IDS = new Set([
    'art-p1', 'art-p2', 'art-p3',
    'art-d1', 'art-d2',
    'art-s1', 'art-s2',
    'art-dw1', 'art-dw2',
    'art-exp1', 'art-exp2'
  ]);

  const artMap = new Map<string, Artwork>();

  (base.artworks || []).forEach(baseArt => {
    if (!DUMMY_IDS.has(baseArt.id)) {
      artMap.set(baseArt.id, { ...baseArt });
    }
  });

  if (cloud && Array.isArray(cloud.artworks)) {
    cloud.artworks.forEach(cloudArt => {
      if (DUMMY_IDS.has(cloudArt.id)) return;
      const existing = artMap.get(cloudArt.id);
      if (existing) {
        if ((!existing.images || existing.images.length === 0) && cloudArt.images && cloudArt.images.length > 0) {
          existing.images = cloudArt.images;
        }
        if (!existing.mainImage && cloudArt.mainImage) {
          existing.mainImage = cloudArt.mainImage;
        }
      } else {
        artMap.set(cloudArt.id, { ...cloudArt });
      }
    });
  }

  const artworks = Array.from(artMap.values())
    .filter(a => !DUMMY_IDS.has(a.id))
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

  // 7. Exhibitions
  const exMap = new Map<string, Exhibition>();
  (base.exhibitions || []).forEach(e => exMap.set(e.id, e));
  (cloud.exhibitions || []).forEach(e => {
    const existing = exMap.get(e.id);
    exMap.set(e.id, existing ? { ...existing, ...e } : e);
  });
  const exhibitions = Array.from(exMap.values()).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  // 8. Years
  const yearsSet = new Set<string>([
    ...(base.years || []),
    ...(cloud.years || []),
    ...(settings.customYears || []),
  ]);
  const years = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));

  // 9. Messages
  const messages = cloud.messages || cloud.inquiries || base.messages || [];

  return {
    settings,
    categories,
    artworks,
    exhibitions,
    about,
    cv,
    socialLinks,
    years,
    messages,
    inquiries: messages,
  };
}

const AUTH_TOKEN_KEY = 'oliva_biswas_admin_token';
const AUTH_USER_KEY = 'oliva_biswas_admin_user';

let detectedStaticHost: boolean | null = null;

export function isStaticHost(): boolean {
  if (detectedStaticHost !== null) return detectedStaticHost;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // Cloud Run, local development, etc. are fullstack!
    if (host.includes('run.app') || host.includes('localhost') || host === '127.0.0.1') {
      detectedStaticHost = false;
      return false;
    }
    // GitHub Pages, Cloudflare Pages, Netlify static hosting, or explicit env
    if (
      host.endsWith('github.io') ||
      host.includes('pages.dev') ||
      host.endsWith('netlify.app') ||
      import.meta.env.VITE_STATIC_HOST === 'true'
    ) {
      detectedStaticHost = true;
      return true;
    }
  }
  return false;
}

export function setStaticHostDetected(isStatic: boolean) {
  detectedStaticHost = isStatic;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string, username: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, username);
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function getStoredUsername(): string | null {
  try {
    return localStorage.getItem(AUTH_USER_KEY);
  } catch {
    return null;
  }
}

function isStaticHostingError(err: any): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('run.app') || host.includes('localhost') || host === '127.0.0.1') {
      return false; // Server is present!
    }
  }
  if (isStaticHost()) return true;
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    msg.includes('static host detected') ||
    (msg.includes('404') && msg.includes('/api/')) ||
    msg.includes('cannot post /api') ||
    msg.includes('cannot get /api')
  );
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if body is FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('Static host detected (Server returned HTML instead of API JSON)');
  }

  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const json = await response.json();
      if (json.error) errMsg = json.error;
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  // Public Data
  getPublicData: async (): Promise<PortfolioData> => {
    // 1. Start with local base data
    const localBase = await getLocalPortfolioDataAsync();

    // 2. Query Firestore as the primary source of truth
    try {
      const fsData = await getFirestorePortfolioData();
      if (fsData) {
        const merged = mergePortfolioData(localBase, fsData);
        await saveLocalPortfolioDataAsync(merged);
        return merged;
      }
    } catch (fsErr) {
      console.warn('Primary Firestore fetch note:', fsErr);
    }

    // 3. If running with Node.js backend server (Development & Cloud Run)
    if (!isStaticHost()) {
      try {
        const serverData = await request<PortfolioData>('/api/portfolio/all');
        if (serverData) {
          const merged = mergePortfolioData(localBase, serverData);
          await saveLocalPortfolioDataAsync(merged);
          return merged;
        }
      } catch (err: any) {
        console.warn('Backend server fetch note:', err?.message || err);
      }
    }

    return localBase;
  },

  syncAllToCloud: async () => {
    const current = getLocalPortfolioData();
    if (!isStaticHost()) {
      try {
        if (current.artworks && current.artworks.length > 0) {
          await request('/api/admin/artworks/batch-sync', {
            method: 'POST',
            body: JSON.stringify({ artworks: current.artworks }),
          });
        }
        if (current.settings) {
          await request('/api/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(current.settings),
          });
        }
        if (current.about) {
          await request('/api/admin/about', {
            method: 'PUT',
            body: JSON.stringify(current.about),
          });
        }
      } catch (e) {
        console.warn('Sync to server disk note:', e);
      }
    }
    return syncEntirePortfolioToFirestore(current);
  },

  getArtworks: async (params?: { category?: string; featured?: boolean; search?: string }): Promise<Artwork[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.featured) q.set('featured', 'true');
      if (params?.search) q.set('search', params.search);
      return await request<Artwork[]>(`/api/artworks?${q.toString()}`);
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        let list = local.artworks;
        if (params?.category) list = list.filter(a => a.categorySlug === params.category);
        if (params?.featured) list = list.filter(a => a.isFeatured);
        if (params?.search) {
          const s = params.search.toLowerCase();
          list = list.filter(a => a.title.toLowerCase().includes(s) || (a.medium && a.medium.toLowerCase().includes(s)));
        }
        return list;
      }
      throw err;
    }
  },

  getArtworkBySlug: async (slug: string): Promise<Artwork> => {
    try {
      return await request<Artwork>(`/api/artworks/${slug}`);
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const art = local.artworks.find(a => a.slug === slug || a.id === slug);
        if (art) return art;
      }
      throw err;
    }
  },

  sendContactMessage: async (data: { name: string; email: string; subject?: string; message: string }) => {
    try {
      return await request<{ success: boolean; message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const newMsg: ContactMessage = {
          id: `msg-${Date.now()}`,
          name: data.name,
          email: data.email,
          subject: data.subject || 'General Inquiry',
          message: data.message,
          receivedAt: new Date().toISOString(),
          read: false,
        };
        local.messages = [newMsg, ...(local.messages || [])];
        saveLocalPortfolioData(local);

        // Also save directly to Cloud Firestore database
        saveFirestoreInquiry(newMsg).catch(e => console.warn('Firestore inquiry sync note:', e));

        return { success: true, message: 'Message recorded successfully.' };
      }
      throw err;
    }
  },

  // Auth
  login: async (username: string, password: string): Promise<AdminAuthResponse> => {
    try {
      const res = await request<AdminAuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (res.token && res.username) {
        setStoredToken(res.token, res.username);
        setLocalAdminUsername(res.username);
      }
      return res;
    } catch (err: any) {
      // If server is absent (e.g. static hosting where Node backend is not running)
      if (isStaticHostingError(err)) {
        // Try reading custom credentials from Firestore
        let validPassword = getLocalAdminPassword();
        let validUsername = getLocalAdminUsername();
        try {
          const fsCreds = await getFirestoreAdminCredentials();
          if (fsCreds) {
            if (fsCreds.username) validUsername = fsCreds.username;
            if (fsCreds.passwordPlain) validPassword = fsCreds.passwordPlain;
          }
        } catch {
          // ignore
        }

        const normalizedInput = username.trim().toLowerCase();
        const normalizedTarget = validUsername.trim().toLowerCase();
        const isMatch =
          (normalizedInput === normalizedTarget ||
            (normalizedTarget !== 'admin' && normalizedInput === 'admin') ||
            (normalizedTarget !== 'olivabiswas' && normalizedInput === 'olivabiswas')) &&
          password.trim() === validPassword;

        if (isMatch) {
          const fallbackToken = `static_auth_${Date.now()}`;
          setStoredToken(fallbackToken, validUsername);
          setLocalAdminUsername(validUsername);
          return {
            success: true,
            token: fallbackToken,
            username: validUsername,
          };
        } else {
          throw new Error('Invalid username or password. Please verify credentials.');
        }
      }
      throw err;
    }
  },

  getMe: async (): Promise<{ authenticated: boolean; username: string }> => {
    try {
      return await request<{ authenticated: boolean; username: string }>('/api/auth/me');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const token = getStoredToken();
        const username = getStoredUsername() || getLocalAdminUsername();
        if (token && username) {
          return { authenticated: true, username };
        }
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearStoredToken();
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const res = await request<{ success: boolean; token: string; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.token) {
        setStoredToken(res.token, getStoredUsername() || getLocalAdminUsername());
      }
      setLocalAdminPassword(newPassword);
      saveFirestoreAdminCredentials({
        username: getStoredUsername() || getLocalAdminUsername(),
        passwordPlain: newPassword,
        updatedAt: new Date().toISOString(),
      }).catch(e => console.warn('Firestore password sync note:', e));
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const stored = getLocalAdminPassword();
        if (currentPassword !== stored) {
          throw new Error('Current password does not match.');
        }
        setLocalAdminPassword(newPassword);
        saveFirestoreAdminCredentials({
          username: getStoredUsername() || getLocalAdminUsername(),
          passwordPlain: newPassword,
          updatedAt: new Date().toISOString(),
        }).catch(e => console.warn('Firestore password sync note:', e));

        const token = `static_auth_${Date.now()}`;
        setStoredToken(token, getStoredUsername() || getLocalAdminUsername());
        return { success: true, token, message: 'Password updated successfully.' };
      }
      throw err;
    }
  },

  changeUsername: async (newUsername: string) => {
    try {
      const res = await request<{ success: boolean; username: string }>('/api/admin/change-username', {
        method: 'POST',
        body: JSON.stringify({ newUsername }),
      });
      setLocalAdminUsername(res.username || newUsername);
      setStoredToken(getStoredToken() || `auth_${Date.now()}`, res.username || newUsername);
      saveFirestoreAdminCredentials({
        username: res.username || newUsername,
        passwordPlain: getLocalAdminPassword(),
        updatedAt: new Date().toISOString(),
      }).catch(e => console.warn('Firestore username sync note:', e));
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        setLocalAdminUsername(newUsername);
        setStoredToken(getStoredToken() || `static_auth_${Date.now()}`, newUsername);
        saveFirestoreAdminCredentials({
          username: newUsername,
          passwordPlain: getLocalAdminPassword(),
          updatedAt: new Date().toISOString(),
        }).catch(e => console.warn('Firestore username sync note:', e));
        return { success: true, username: newUsername };
      }
      throw err;
    }
  },

  // Admin Dashboard
  getDashboard: async () => {
    try {
      return await request<any>('/api/admin/dashboard');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        return {
          stats: {
            totalArtworks: local.artworks.length,
            featuredArtworks: local.artworks.filter(a => a.isFeatured).length,
            totalCategories: local.categories.length,
            totalExhibitions: local.exhibitions.length,
            hasCV: !!local.cv,
            unreadMessages: (local.messages || []).filter(m => !m.read).length,
            totalMessages: (local.messages || []).length,
          },
          recentArtworks: local.artworks.slice(0, 5),
          recentMessages: (local.messages || []).slice(0, 5),
          coverImage: local.settings.coverImage,
          cv: local.cv,
        };
      }
      throw err;
    }
  },

  // Artwork Management
  addArtwork: async (artwork: Partial<Artwork>): Promise<Artwork> => {
    const created: Artwork = {
      id: artwork.id || `art-${Date.now()}`,
      slug: (artwork.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: artwork.title || 'Untitled Work',
      year: artwork.year || new Date().getFullYear(),
      categorySlug: artwork.categorySlug || 'sculpture',
      categoryName: artwork.categoryName || 'Sculpture',
      medium: artwork.medium || '',
      dimensions: artwork.dimensions || '',
      description: artwork.description || '',
      mainImage: artwork.mainImage || '',
      images: artwork.images || [],
      isFeatured: artwork.isFeatured || false,
      notes: artwork.notes || '',
      videoUrl: artwork.videoUrl || '',
      videoTitle: artwork.videoTitle || '',
      mediaType: artwork.mediaType || (artwork.videoUrl ? 'video' : 'image'),
      order: artwork.order || 9999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...artwork,
    };

    try {
      // Permanently write to Firestore collection 'artworks' with strict error handling
      await saveFirestoreArtwork(created);
    } catch (err: any) {
      console.error('Firestore artwork creation failed:', err);
      throw new Error(`Firestore Save Error: ${err.message || 'Failed to save artwork to database.'}`);
    }

    try {
      const local = await getLocalPortfolioDataAsync();
      local.artworks = [created, ...local.artworks.filter(a => a.id !== created.id)];
      await saveLocalPortfolioDataAsync(local);
    } catch (e) {
      console.warn('Local cache update note:', e);
    }

    if (!isStaticHost()) {
      try {
        await request('/api/admin/artworks', {
          method: 'POST',
          body: JSON.stringify(created),
        });
      } catch (e) {
        console.warn('Backend server sync note:', e);
      }
    }

    return created;
  },

  createArtwork: async (artwork: Partial<Artwork>): Promise<Artwork> => {
    return api.addArtwork(artwork);
  },

  updateArtwork: async (id: string, updates: Partial<Artwork>): Promise<Artwork> => {
    const local = await getLocalPortfolioDataAsync();
    const idx = local.artworks.findIndex(a => a.id === id);
    let updated: Artwork;

    if (idx !== -1) {
      updated = {
        ...local.artworks[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated = {
        id,
        slug: (updates.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: updates.title || 'Untitled Work',
        year: updates.year || new Date().getFullYear(),
        categorySlug: updates.categorySlug || 'sculpture',
        categoryName: updates.categoryName || 'Sculpture',
        medium: updates.medium || '',
        dimensions: updates.dimensions || '',
        description: updates.description || '',
        mainImage: updates.mainImage || '',
        images: updates.images || [],
        isFeatured: updates.isFeatured || false,
        notes: updates.notes || '',
        videoUrl: updates.videoUrl || '',
        videoTitle: updates.videoTitle || '',
        mediaType: updates.mediaType || (updates.videoUrl ? 'video' : 'image'),
        order: updates.order || 9999,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates,
      };
    }

    try {
      // Permanently write to Firestore collection 'artworks' with strict error handling
      await saveFirestoreArtwork(updated);
    } catch (err: any) {
      console.error('Firestore artwork update failed:', err);
      throw new Error(`Firestore Update Error: ${err.message || 'Failed to update artwork in database.'}`);
    }

    if (idx !== -1) {
      local.artworks[idx] = updated;
    } else {
      local.artworks.unshift(updated);
    }
    await saveLocalPortfolioDataAsync(local);

    if (!isStaticHost()) {
      try {
        await request(`/api/admin/artworks/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch (e) {
        console.warn('Backend server update note:', e);
      }
    }

    return updated;
  },

  deleteArtwork: async (id: string) => {
    // Permanently delete from Firestore collection 'artworks'
    await deleteFirestoreArtwork(id);

    const local = await getLocalPortfolioDataAsync();
    local.artworks = local.artworks.filter(a => a.id !== id);
    await saveLocalPortfolioDataAsync(local);

    if (!isStaticHost()) {
      try {
        await request(`/api/admin/artworks/${id}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('Backend server delete note:', e);
      }
    }

    return { success: true };
  },

  toggleFeatured: async (id: string): Promise<Artwork> => {
    try {
      return await request<Artwork>(`/api/admin/artworks/${id}/toggle-featured`, {
        method: 'POST',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const idx = local.artworks.findIndex(a => a.id === id);
        if (idx !== -1) {
          local.artworks[idx].isFeatured = !local.artworks[idx].isFeatured;
          saveLocalPortfolioData(local);
          return local.artworks[idx];
        }
      }
      throw err;
    }
  },

  reorderArtworks: async (orderedIds: string[]): Promise<Artwork[]> => {
    try {
      const res = await request<Artwork[]>('/api/admin/artworks/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      });
      const local = getLocalPortfolioData();
      orderedIds.forEach((id, idx) => {
        const art = local.artworks.find(a => a.id === id);
        if (art) {
          art.order = idx + 1;
        }
      });
      local.artworks.sort((a, b) => (a.order || 9999) - (b.order || 9999));
      saveLocalPortfolioData(local);

      // Fast atomic update of order indices in cloud Firestore
      updateFirestoreArtworksOrder(orderedIds).catch(() => {});

      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        orderedIds.forEach((id, idx) => {
          const art = local.artworks.find(a => a.id === id);
          if (art) {
            art.order = idx + 1;
          }
        });
        local.artworks.sort((a, b) => (a.order || 9999) - (b.order || 9999));
        await saveLocalPortfolioDataAsync(local);

        // Fast atomic update of order indices in cloud Firestore
        await updateFirestoreArtworksOrder(orderedIds).catch(() => {});

        return local.artworks;
      }
      throw err;
    }
  },

  batchSyncArtworks: async (artworks: Artwork[]): Promise<Artwork[]> => {
    try {
      const res = await request<{ success: boolean; count: number; artworks: Artwork[] }>('/api/admin/artworks/batch-sync', {
        method: 'POST',
        body: JSON.stringify({ artworks }),
      });
      if (res && Array.isArray(res.artworks)) {
        const local = await getLocalPortfolioDataAsync();
        local.artworks = res.artworks;
        await saveLocalPortfolioDataAsync(local);
        return res.artworks;
      }
      return artworks;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.artworks = artworks;
        await saveLocalPortfolioDataAsync(local);
        return artworks;
      }
      throw err;
    }
  },

  // Categories
  addCategory: async (category: Partial<Category>): Promise<Category> => {
    try {
      const created = await request<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
      saveFirestoreCategory(created).catch(() => {});
      const local = getLocalPortfolioData();
      local.categories.push(created);
      saveLocalPortfolioData(local);
      return created;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: category.name || 'New Category',
          slug: (category.slug || category.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: category.description || '',
          order: category.order || local.categories.length + 1,
          coverImage: category.coverImage || '',
        };
        local.categories.push(newCat);
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreCategory(newCat).catch(() => {});
        return newCat;
      }
      throw err;
    }
  },

  createCategory: async (category: Partial<Category>): Promise<Category> => {
    return api.addCategory(category);
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<Category> => {
    try {
      const updated = await request<Category>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      saveFirestoreCategory(updated).catch(() => {});
      const local = getLocalPortfolioData();
      const idx = local.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        local.categories[idx] = updated;
        saveLocalPortfolioData(local);
      }
      return updated;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const idx = local.categories.findIndex(c => c.id === id);
        if (idx !== -1) {
          local.categories[idx] = { ...local.categories[idx], ...updates };
          await saveLocalPortfolioDataAsync(local);
          saveFirestoreCategory(local.categories[idx]).catch(() => {});
          return local.categories[idx];
        }
      }
      throw err;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const res = await request<{ success: boolean }>(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      deleteFirestoreCategory(id).catch(() => {});
      const local = getLocalPortfolioData();
      local.categories = local.categories.filter(c => c.id !== id);
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.categories = local.categories.filter(c => c.id !== id);
        await saveLocalPortfolioDataAsync(local);
        deleteFirestoreCategory(id).catch(() => {});
        return { success: true };
      }
      throw err;
    }
  },

  reorderCategories: async (orderedIds: string[]): Promise<Category[]> => {
    try {
      const res = await request<Category[]>('/api/admin/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      });
      const local = getLocalPortfolioData();
      orderedIds.forEach((id, idx) => {
        const cat = local.categories.find(c => c.id === id);
        if (cat) {
          cat.order = idx + 1;
          saveFirestoreCategory(cat).catch(() => {});
        }
      });
      local.categories.sort((a, b) => (a.order || 9999) - (b.order || 9999));
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        orderedIds.forEach((id, idx) => {
          const cat = local.categories.find(c => c.id === id);
          if (cat) {
            cat.order = idx + 1;
            saveFirestoreCategory(cat).catch(() => {});
          }
        });
        local.categories.sort((a, b) => (a.order || 9999) - (b.order || 9999));
        await saveLocalPortfolioDataAsync(local);
        return local.categories;
      }
      throw err;
    }
  },

  // Exhibitions
  addExhibition: async (exhibition: Partial<Exhibition>): Promise<Exhibition> => {
    try {
      const created = await request<Exhibition>('/api/admin/exhibitions', {
        method: 'POST',
        body: JSON.stringify(exhibition),
      });
      saveFirestoreExhibition(created).catch(() => {});
      const local = getLocalPortfolioData();
      local.exhibitions.push(created);
      saveLocalPortfolioData(local);
      return created;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const newEx: Exhibition = {
          id: `ex-${Date.now()}`,
          title: exhibition.title || 'Exhibition Title',
          year: exhibition.year || new Date().getFullYear(),
          dateString: exhibition.dateString || '',
          venue: exhibition.venue || '',
          location: exhibition.location || '',
          type: exhibition.type || 'Solo',
          description: exhibition.description || '',
          externalLink: exhibition.externalLink,
          order: exhibition.order || local.exhibitions.length + 1,
        };
        local.exhibitions.push(newEx);
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreExhibition(newEx).catch(() => {});
        return newEx;
      }
      throw err;
    }
  },

  createExhibition: async (exhibition: Partial<Exhibition>): Promise<Exhibition> => {
    return api.addExhibition(exhibition);
  },

  updateExhibition: async (id: string, updates: Partial<Exhibition>): Promise<Exhibition> => {
    try {
      const updated = await request<Exhibition>(`/api/admin/exhibitions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      saveFirestoreExhibition(updated).catch(() => {});
      const local = getLocalPortfolioData();
      const idx = local.exhibitions.findIndex(e => e.id === id);
      if (idx !== -1) {
        local.exhibitions[idx] = updated;
        saveLocalPortfolioData(local);
      }
      return updated;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const idx = local.exhibitions.findIndex(e => e.id === id);
        if (idx !== -1) {
          local.exhibitions[idx] = { ...local.exhibitions[idx], ...updates };
          await saveLocalPortfolioDataAsync(local);
          saveFirestoreExhibition(local.exhibitions[idx]).catch(() => {});
          return local.exhibitions[idx];
        }
      }
      throw err;
    }
  },

  deleteExhibition: async (id: string) => {
    try {
      const res = await request<{ success: boolean }>(`/api/admin/exhibitions/${id}`, {
        method: 'DELETE',
      });
      deleteFirestoreExhibition(id).catch(() => {});
      const local = getLocalPortfolioData();
      local.exhibitions = local.exhibitions.filter(e => e.id !== id);
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.exhibitions = local.exhibitions.filter(e => e.id !== id);
        await saveLocalPortfolioDataAsync(local);
        deleteFirestoreExhibition(id).catch(() => {});
        return { success: true };
      }
      throw err;
    }
  },

  reorderExhibitions: async (orderedIds: string[]): Promise<Exhibition[]> => {
    try {
      const res = await request<Exhibition[]>('/api/admin/exhibitions/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      });
      const local = getLocalPortfolioData();
      orderedIds.forEach((id, idx) => {
        const ex = local.exhibitions.find(e => e.id === id);
        if (ex) {
          ex.order = idx + 1;
          saveFirestoreExhibition(ex).catch(() => {});
        }
      });
      local.exhibitions.sort((a, b) => (a.order || 9999) - (b.order || 9999));
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        orderedIds.forEach((id, idx) => {
          const ex = local.exhibitions.find(e => e.id === id);
          if (ex) {
            ex.order = idx + 1;
            saveFirestoreExhibition(ex).catch(() => {});
          }
        });
        local.exhibitions.sort((a, b) => (a.order || 9999) - (b.order || 9999));
        await saveLocalPortfolioDataAsync(local);
        return local.exhibitions;
      }
      throw err;
    }
  },

  // About
  updateAbout: async (about: Partial<AboutContent>): Promise<AboutContent> => {
    try {
      const updated = await request<AboutContent>('/api/admin/about', {
        method: 'PUT',
        body: JSON.stringify(about),
      });
      saveFirestoreAbout(updated).catch(() => {});
      const local = getLocalPortfolioData();
      local.about = { ...local.about, ...updated };
      saveLocalPortfolioData(local);
      return updated;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.about = { ...local.about, ...about };
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreAbout(local.about).catch(() => {});
        return local.about;
      }
      throw err;
    }
  },

  // Uploads
  uploadFile: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; filename: string; size: number; fileUrl?: string; isCloud?: boolean }> => {
    // If it's on static host or anywhere, smartMediaUpload handles Cloudinary, ImgBB, server, or IndexedDB fallback
    try {
      const result = await smartMediaUpload(file, undefined, onProgress);
      return {
        url: result.url,
        filename: result.filename,
        size: result.size,
        fileUrl: result.url,
        isCloud: result.isCloud,
      };
    } catch (err: any) {
      console.error('smartMediaUpload error, attempting basic fallback:', err);
      // Fallback
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, 1200, 1200, 0.7);
        return {
          url: compressed.dataUrl,
          filename: file.name,
          size: compressed.file.size,
          fileUrl: compressed.dataUrl,
        };
      }
      throw err;
    }
  },

  uploadMultipleFiles: async (
    files: File[]
  ): Promise<{ success: boolean; files: Array<{ id: string; url: string; filename: string; order: number }> }> => {
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      return await request('/api/admin/upload-multiple', {
        method: 'POST',
        body: formData,
      });
    } catch (err: any) {
      const results: Array<{ id: string; url: string; filename: string; order: number }> = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const res = await api.uploadFile(f);
        results.push({
          id: `img-${Date.now()}-${i}`,
          url: res.url,
          filename: res.filename,
          order: i + 1,
        });
      }
      return { success: true, files: results };
    }
  },

  saveEditedImage: async (dataUrl: string, _prefix = 'edited'): Promise<{ success: boolean; url: string; fileUrl: string }> => {
    try {
      const res = await request<{ success: boolean; url: string }>('/api/admin/save-edited-image', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, prefix: _prefix }),
      });
      return { ...res, fileUrl: res.url };
    } catch (err: any) {
      return { success: true, url: dataUrl, fileUrl: dataUrl };
    }
  },

  // CV
  uploadCV: async (file: File): Promise<CVDoc> => {
    try {
      const formData = new FormData();
      formData.append('cvFile', file);
      const res = await request<CVDoc>('/api/admin/cv/upload', {
        method: 'POST',
        body: formData,
      });
      saveFirestoreCV(res).catch(() => {});
      const local = getLocalPortfolioData();
      local.cv = res;
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const cv: CVDoc = {
            id: `cv-${Date.now()}`,
            url: dataUrl,
            filename: file.name,
            uploadedAt: new Date().toISOString(),
            sizeBytes: file.size,
          };
          const local = await getLocalPortfolioDataAsync();
          local.cv = cv;
          await saveLocalPortfolioDataAsync(local);
          saveFirestoreCV(cv).catch(() => {});
          resolve(cv);
        };
        reader.onerror = () => reject(new Error('Failed to read CV file'));
        reader.readAsDataURL(file);
      });
    }
  },

  deleteCV: async () => {
    try {
      const res = await request<{ success: boolean }>('/api/admin/cv', {
        method: 'DELETE',
      });
      saveFirestoreCV(null).catch(() => {});
      const local = getLocalPortfolioData();
      local.cv = null;
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.cv = null;
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreCV(null).catch(() => {});
        return { success: true };
      }
      throw err;
    }
  },

  // Social & Settings
  updateSocialLinks: async (links: SocialLink[]): Promise<SocialLink[]> => {
    try {
      const res = await request<SocialLink[]>('/api/admin/social', {
        method: 'PUT',
        body: JSON.stringify({ links }),
      });
      saveFirestoreSocialLinks(links).catch(() => {});
      const local = getLocalPortfolioData();
      local.socialLinks = links;
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.socialLinks = links;
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreSocialLinks(links).catch(() => {});
        return links;
      }
      throw err;
    }
  },

  createSocialLink: async (link: { platform: string; url: string; label?: string; order?: number }) => {
    const data = await api.getPublicData();
    const newLinks: SocialLink[] = [
      ...(data.socialLinks || []),
      {
        id: `soc-${Date.now()}`,
        platform: link.platform,
        label: link.label || link.platform,
        url: link.url,
        isEnabled: true,
        order: link.order || (data.socialLinks ? data.socialLinks.length + 1 : 1),
      },
    ];
    return api.updateSocialLinks(newLinks);
  },

  updateSocialLink: async (id: string, updates: Partial<SocialLink>) => {
    const data = await api.getPublicData();
    const newLinks: SocialLink[] = (data.socialLinks || []).map(l => (l.id === id ? { ...l, ...updates } : l));
    return api.updateSocialLinks(newLinks);
  },

  deleteSocialLink: async (id: string) => {
    const data = await api.getPublicData();
    const newLinks: SocialLink[] = (data.socialLinks || []).filter(l => l.id !== id);
    return api.updateSocialLinks(newLinks);
  },

  updateSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    try {
      const res = await request<SiteSettings>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      saveFirestoreSettings(settings).catch(() => {});
      const local = getLocalPortfolioData();
      local.settings = { ...local.settings, ...settings };
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.settings = { ...local.settings, ...settings };
        await saveLocalPortfolioDataAsync(local);

        // Sync settings to Cloud Firestore database
        saveFirestoreSettings(settings).catch(e => console.warn('Firestore settings sync note:', e));

        return local.settings;
      }
      throw err;
    }
  },

  // Years
  getYears: async (): Promise<string[]> => {
    try {
      return await request<string[]>('/api/years');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        return local.years || ['2025', '2024', '2023', '2022', '2021', '2020'];
      }
      throw err;
    }
  },

  addYear: async (year: string): Promise<string[]> => {
    try {
      return await request<string[]>('/api/admin/years', {
        method: 'POST',
        body: JSON.stringify({ year }),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const years = new Set(local.years || []);
        years.add(year);
        local.years = Array.from(years).sort((a, b) => Number(b) - Number(a));
        saveLocalPortfolioData(local);
        return local.years;
      }
      throw err;
    }
  },

  deleteYear: async (year: string): Promise<string[]> => {
    try {
      return await request<string[]>(`/api/admin/years/${encodeURIComponent(year)}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        local.years = (local.years || []).filter(y => y !== year);
        saveLocalPortfolioData(local);
        return local.years;
      }
      throw err;
    }
  },

  updateYears: async (years: string[]): Promise<string[]> => {
    try {
      return await request<string[]>('/api/admin/years', {
        method: 'PUT',
        body: JSON.stringify({ years }),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        local.years = years;
        saveLocalPortfolioData(local);
        return local.years;
      }
      throw err;
    }
  },

  // Messages
  getMessages: async (): Promise<ContactMessage[]> => {
    try {
      return await request<ContactMessage[]>('/api/admin/messages');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        return local.messages || [];
      }
      throw err;
    }
  },

  markMessageRead: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/api/admin/messages/${id}/read`, {
        method: 'PUT',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const msg = (local.messages || []).find(m => m.id === id);
        if (msg) msg.read = true;
        saveLocalPortfolioData(local);
        return { success: true };
      }
      throw err;
    }
  },

  updateInquiry: async (id: string, updates: { read?: boolean }) => {
    return api.markMessageRead(id);
  },

  deleteMessage: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        local.messages = (local.messages || []).filter(m => m.id !== id);
        saveLocalPortfolioData(local);
        return { success: true };
      }
      throw err;
    }
  },

  deleteInquiry: async (id: string) => {
    return api.deleteMessage(id);
  },
};

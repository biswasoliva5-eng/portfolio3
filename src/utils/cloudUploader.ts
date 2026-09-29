import { compressImage } from './imageCompressor';
import { uploadToFirebaseStorage } from '../lib/firestoreService';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  imgbbApiKey?: string;
}

const CLOUDINARY_KEY = 'oliva_portfolio_cloudinary_cfg';

export function getSavedCloudinaryConfig(): CloudinaryConfig {
  if (typeof window === 'undefined') {
    return { cloudName: '', uploadPreset: '' };
  }
  try {
    const raw = localStorage.getItem(CLOUDINARY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading cloudinary config from localStorage', e);
  }
  return {
    cloudName: '',
    uploadPreset: '',
  };
}

export function saveSavedCloudinaryConfig(config: CloudinaryConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLOUDINARY_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Error saving cloudinary config', e);
  }
}

/**
 * Upload an image or video directly to Cloudinary using an Unsigned Upload Preset
 */
export async function uploadToCloudinary(
  file: File,
  config?: CloudinaryConfig,
  onProgress?: (percent: number) => void
): Promise<{ url: string; publicId?: string; format?: string; size: number }> {
  const activeConfig = config || getSavedCloudinaryConfig();
  const cloudName = activeConfig.cloudName?.trim();
  const uploadPreset = activeConfig.uploadPreset?.trim();

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary Cloud Name and Upload Preset are not configured.');
  }

  const isVideo = file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const secureUrl = res.secure_url || res.url;
          if (secureUrl) {
            resolve({
              url: secureUrl,
              publicId: res.public_id,
              format: res.format,
              size: res.bytes || file.size,
            });
          } else {
            reject(new Error('Cloudinary response did not contain a URL'));
          }
        } catch (e) {
          reject(new Error('Failed to parse Cloudinary response: ' + xhr.responseText));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during Cloudinary upload. Please check your internet connection.'));
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (!isVideo) {
      formData.append('tags', 'portfolio_artwork');
    }

    xhr.send(formData);
  });
}

/**
 * Upload an image to ImgBB
 */
export async function uploadToImgBB(
  file: File,
  apiKey: string
): Promise<{ url: string; size: number }> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey.trim()}`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (data.success && data.data?.url) {
    return {
      url: data.data.display_url || data.data.url,
      size: data.data.size || file.size,
    };
  }
  throw new Error(data.error?.message || 'ImgBB upload failed');
}

// -------------------------------------------------------------
// IndexedDB Local Storage Provider
// -------------------------------------------------------------
const IDB_NAME = 'OlivaBiswasPortfolioMedia';
const IDB_STORE = 'media_blobs';
let idbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return idbPromise;
}

export async function storeInIndexedDB(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(dataUrl, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IndexedDB write warning:', e);
  }
}

export async function getFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Universal media upload with Firebase Storage & Cloudinary support:
 * 1. Try Firebase Storage directly (Public CDN download URL for all visitors)
 * 2. Try Cloudinary if configured
 * 3. Try ImgBB if configured
 * 4. Try fullstack backend server `/api/admin/upload`
 * 5. If all fail, fallback to compressed image dataUrl
 */
export async function smartMediaUpload(
  file: File,
  config?: CloudinaryConfig,
  onProgress?: (percent: number) => void
): Promise<{ url: string; filename: string; size: number; isCloud: boolean }> {
  const isVideo = file.type.startsWith('video/');
  const activeConfig = config || getSavedCloudinaryConfig();

  // 1. Primary: Firebase Storage Upload
  try {
    const fbRes = await uploadToFirebaseStorage(file, isVideo ? 'videos' : 'artworks', onProgress);
    if (fbRes && fbRes.url) {
      return {
        url: fbRes.url,
        filename: fbRes.filename,
        size: fbRes.size,
        isCloud: true,
      };
    }
  } catch (fbErr: any) {
    console.warn('Firebase Storage upload notice, trying next provider:', fbErr.message);
  }

  // 2. Try Cloudinary if configured
  if (activeConfig.cloudName?.trim() && activeConfig.uploadPreset?.trim()) {
    try {
      const result = await uploadToCloudinary(file, activeConfig, onProgress);
      return {
        url: result.url,
        filename: file.name,
        size: result.size,
        isCloud: true,
      };
    } catch (cErr: any) {
      console.warn('Cloudinary upload attempt error:', cErr.message);
      if (isVideo) {
        throw new Error(`Cloudinary video upload failed: ${cErr.message}`);
      }
    }
  }

  // 3. Try ImgBB if configured (images only)
  if (!isVideo && activeConfig.imgbbApiKey?.trim()) {
    try {
      const result = await uploadToImgBB(file, activeConfig, activeConfig.imgbbApiKey);
      return {
        url: result.url,
        filename: file.name,
        size: result.size,
        isCloud: true,
      };
    } catch (imgbbErr: any) {
      console.warn('ImgBB upload error:', imgbbErr.message);
    }
  }

  // 4. Try Backend Server endpoint if running fullstack
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('oliva_biswas_admin_token') : null;
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return {
          url: data.url,
          filename: data.filename || file.name,
          size: data.size || file.size,
          isCloud: true,
        };
      }
    }
  } catch {
    // Backend server not responding
  }

  // 5. Fallback for image compression
  if (!isVideo) {
    const compressed = await compressImage(file, 1200, 1200, 0.74);
    const mediaKey = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await storeInIndexedDB(mediaKey, compressed.dataUrl);

    return {
      url: compressed.dataUrl,
      filename: file.name,
      size: compressed.file.size,
      isCloud: false,
    };
  }

  throw new Error('Upload failed. Please check your network connection or Firebase Storage configuration.');
}

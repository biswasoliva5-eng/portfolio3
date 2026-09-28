import { compressImage } from './imageCompressor';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  imgbbApiKey?: string;
}

// ⚠️ ১. এখানে আপনার Cloudinary-র Cloud Name এবং Unsigned Upload Preset দিন
// এতে করে GitHub Pages থেকে ওয়েবসাইট খুললে সব ইউজারের জন্য Cloudinary সক্রিয় থাকবে।
const DEFAULT_CLOUD_NAME = 'o1yfme6l'; // এখানে আপনার Cloud Name লিখুন
const DEFAULT_UPLOAD_PRESET = 'portfolio'; // এখানে আপনার Preset Name লিখুন

const CLOUDINARY_KEY = 'oliva_portfolio_cloudinary_cfg';

export function getSavedCloudinaryConfig(): CloudinaryConfig {
  if (typeof window === 'undefined') {
    return { cloudName: DEFAULT_CLOUD_NAME, uploadPreset: DEFAULT_UPLOAD_PRESET };
  }
  try {
    const raw = localStorage.getItem(CLOUDINARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        cloudName: parsed.cloudName?.trim() || DEFAULT_CLOUD_NAME,
        uploadPreset: parsed.uploadPreset?.trim() || DEFAULT_UPLOAD_PRESET,
        imgbbApiKey: parsed.imgbbApiKey || '',
      };
    }
  } catch (e) {
    console.warn('Error reading cloudinary config from localStorage', e);
  }
  return {
    cloudName: DEFAULT_CLOUD_NAME,
    uploadPreset: DEFAULT_UPLOAD_PRESET,
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
            // Cloudinary URL অপটিমাইজেশন (f_auto, q_auto যোগ করে ছবি দ্রুত লোড করার জন্য)
            const optimizedUrl = isVideo 
              ? secureUrl 
              : secureUrl.replace('/upload/', '/upload/f_auto,q_auto/');

            resolve({
              url: optimizedUrl,
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
 * Universal smart upload for GitHub Pages (Cloudinary Primary)
 */
export async function smartMediaUpload(
  file: File,
  config?: CloudinaryConfig,
  onProgress?: (percent: number) => void
): Promise<{ url: string; filename: string; size: number; isCloud: boolean }> {
  const activeConfig = config || getSavedCloudinaryConfig();

  // Always force Cloudinary upload first for global syncing
  try {
    const result = await uploadToCloudinary(file, activeConfig, onProgress);
    return {
      url: result.url,
      filename: file.name,
      size: result.size,
      isCloud: true,
    };
  } catch (cErr: any) {
    console.error('Cloudinary upload error:', cErr.message);
    throw new Error(`ছবি আপলোড ব্যর্থ হয়েছে: ${cErr.message}। অনুগ্রহ করে Unsigned Upload Preset চেক করুন।`);
  }
}

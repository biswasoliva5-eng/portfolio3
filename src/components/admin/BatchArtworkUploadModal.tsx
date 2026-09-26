import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Layers,
  Calendar,
  Sparkles,
  Check,
  Star,
} from 'lucide-react';
import { Category, Artwork } from '../../types';
import { smartMediaUpload } from '../../utils/cloudUploader';
import { api } from '../../api/client';

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  categorySlug: string;
  year: number;
  medium: string;
  dimensions: string;
  status: 'idle' | 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

interface BatchArtworkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Convert a filename like "mountain-sunrise_oil_2024.jpg" into "Mountain Sunrise Oil 2024"
function cleanFilenameToTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleaned = withoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export const BatchArtworkUploadModal: React.FC<BatchArtworkUploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
  showToast,
}) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Batch mode: 'individual' (multiple separate artworks) vs 'bundled' (1 artwork with multiple angle photos)
  const [batchMode, setBatchMode] = useState<'individual' | 'bundled'>('individual');
  const [bundledTitle, setBundledTitle] = useState('');
  const [bundledDescription, setBundledDescription] = useState('');
  const [bundledDimensions, setBundledDimensions] = useState('');
  const [primaryIndex, setPrimaryIndex] = useState(0);

  // Global default batch fields
  const defaultCategorySlug = categories[0]?.slug || 'painting';
  const currentYear = new Date().getFullYear();
  const [batchCategory, setBatchCategory] = useState(defaultCategorySlug);
  const [batchYear, setBatchYear] = useState<number>(currentYear);
  const [batchMedium, setBatchMedium] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesAdded = (files: FileList | File[]) => {
    const validImageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      showToast('অনুগ্রহ করে শুধুমাত্র ইমেজ (JPG, PNG, WebP) ফাইল নির্বাচন করুন।', 'error');
      return;
    }

    const ANGLE_PRESETS = [
      'সামনের মূল ভিউ (Front View)',
      'বাম পাশের অ্যাঙ্গেল (Left Side)',
      'ডান পাশের অ্যাঙ্গেল (Right Side)',
      'পেছনের দিক (Back View)',
      'ক্লোজ-আপ ডিটেইল (Close-up / Texture)',
      '৪৫° কোণ ভিউ (45° Angle)',
      'ফ্রেম সহ ডিসপ্লে (Framed View)',
    ];

    const newItems: BatchItem[] = validImageFiles.map((file, idx) => {
      const previewUrl = URL.createObjectURL(file);
      const cleaned = cleanFilenameToTitle(file.name);
      const fallbackAngleTitle = ANGLE_PRESETS[items.length + idx] || cleaned;

      return {
        id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl,
        title: batchMode === 'bundled' ? fallbackAngleTitle : cleaned,
        categorySlug: batchCategory || defaultCategorySlug,
        year: batchYear || currentYear,
        medium: batchMedium,
        dimensions: '',
        status: 'idle',
      };
    });

    setItems(prev => [...prev, ...newItems]);
    if (!bundledTitle && validImageFiles[0]) {
      setBundledTitle(cleanFilenameToTitle(validImageFiles[0].name));
    }
    showToast(`${validImageFiles.length}টি ছবি তালিকায় যোগ হয়েছে`, 'info');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
    // reset input so same files can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => {
      const target = prev.find(i => i.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleApplyBatchSettings = () => {
    setItems(prev =>
      prev.map(item => ({
        ...item,
        categorySlug: batchCategory || item.categorySlug,
        year: batchYear || item.year,
        medium: batchMedium.trim() ? batchMedium.trim() : item.medium,
      }))
    );
    showToast('সকল ছবিতে ক্যাটাগরি ও বছর প্রয়োগ করা হয়েছে', 'success');
  };

  const handleStartUpload = async () => {
    if (items.length === 0) {
      showToast('আপলোড করার জন্য কোনো ছবি নির্বাচিত নেই।', 'error');
      return;
    }

    if (batchMode === 'bundled' && !bundledTitle.trim()) {
      showToast('অনুগ্রহ করে আর্টওয়ার্কটির মূল নাম (Title) লিখুন', 'error');
      return;
    }

    setIsUploading(true);

    // MODE 2: BUNDLED (1 Artwork with multiple angles/views)
    if (batchMode === 'bundled') {
      const uploadedImages: { id: string; url: string; alt: string; order: number; isPrimary: boolean }[] = [];
      let failCount = 0;

      for (let i = 0; i < items.length; i++) {
        setCurrentUploadIndex(i);
        setOverallProgress(Math.round(((i) / items.length) * 100));
        const item = items[i];

        setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, status: 'uploading' } : it)));

        try {
          const uploadResult = await smartMediaUpload(item.file);
          uploadedImages.push({
            id: `img-${Date.now()}-${i}`,
            url: uploadResult.url,
            alt: item.title.trim() || `ভিউ ${i + 1}`,
            order: i + 1,
            isPrimary: i === primaryIndex,
          });
          setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, status: 'done' } : it)));
        } catch (err: any) {
          console.error('Multi-angle upload error on item', item.title, err);
          failCount++;
          setItems(prev =>
            prev.map((it, idx) =>
              idx === i ? { ...it, status: 'error', errorMessage: err.message || 'আপলোড ব্যর্থ' } : it
            )
          );
        }
      }

      setOverallProgress(100);
      setIsUploading(false);

      if (uploadedImages.length > 0) {
        const primaryImg = uploadedImages.find(img => img.isPrimary) || uploadedImages[0];
        const catObj = categories.find(c => c.slug === (batchCategory || defaultCategorySlug));
        const categoryName = catObj ? catObj.name : (batchCategory || defaultCategorySlug);

        const newArt: Partial<Artwork> = {
          title: bundledTitle.trim() || 'Untitled Portrait',
          year: Number(batchYear) || currentYear,
          categorySlug: batchCategory || defaultCategorySlug,
          categoryName,
          medium: batchMedium.trim() || undefined,
          dimensions: bundledDimensions.trim() || undefined,
          description: bundledDescription.trim() || undefined,
          mainImage: primaryImg.url,
          images: uploadedImages,
          isFeatured: false,
        };

        try {
          await api.addArtwork(newArt);
          await onSuccess();
          showToast(`"${newArt.title}" আর্টওয়ার্কটি ${uploadedImages.length}টি সাইড/অ্যাঙ্গেল ভিউ সহ সফলভাবে তৈরি হয়েছে!`, 'success');
          setTimeout(() => {
            onClose();
            items.forEach(it => {
              if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
            });
            setItems([]);
          }, 1200);
        } catch (err: any) {
          showToast(err.message || 'আর্টওয়ার্ক সেভ করা সম্ভব হয়নি', 'error');
        }
      } else {
        showToast('ছবিগুলো আপলোড করা সম্ভব হয়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।', 'error');
      }
      return;
    }

    // MODE 1: INDIVIDUAL (Separate artworks for each photo)
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      setCurrentUploadIndex(i);
      setOverallProgress(Math.round(((i) / items.length) * 100));

      const item = items[i];
      if (item.status === 'done') {
        successCount++;
        continue;
      }

      // Mark current as uploading
      setItems(prev =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'uploading' } : it))
      );

      try {
        // 1. Upload media safely
        const uploadResult = await smartMediaUpload(item.file);

        // 2. Lookup category name
        const catObj = categories.find(c => c.slug === item.categorySlug);
        const categoryName = catObj ? catObj.name : item.categorySlug;

        // 3. Create artwork
        const newArt: Partial<Artwork> = {
          title: item.title.trim() || cleanFilenameToTitle(item.file.name) || 'Untitled Artwork',
          year: Number(item.year) || currentYear,
          categorySlug: item.categorySlug,
          categoryName,
          medium: item.medium.trim() || undefined,
          dimensions: item.dimensions.trim() || undefined,
          mainImage: uploadResult.url,
          images: [
            {
              id: `img-${Date.now()}-${i}`,
              url: uploadResult.url,
              alt: item.title,
              order: 1,
              isPrimary: true,
            },
          ],
          isFeatured: false,
        };

        await api.addArtwork(newArt);

        // Mark as done
        setItems(prev =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'done' } : it))
        );
        successCount++;
      } catch (err: any) {
        console.error('Batch artwork upload error on item', item.title, err);
        setItems(prev =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, status: 'error', errorMessage: err.message || 'আপলোড ব্যর্থ হয়েছে' }
              : it
          )
        );
        failCount++;
      }
    }

    setOverallProgress(100);
    setIsUploading(false);

    // Refresh context data
    await onSuccess();

    if (failCount === 0) {
      showToast(`${successCount}টি আর্টওয়ার্ক সফলভাবে গ্যালারিতে যোগ করা হয়েছে!`, 'success');
      setTimeout(() => {
        onClose();
        // Clear object URLs
        items.forEach(it => {
          if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
        });
        setItems([]);
      }, 1200);
    } else {
      showToast(
        `${successCount}টি আর্টওয়ার্ক আপলোড সফল, ${failCount}টি ব্যর্থ হয়েছে। ত্রুটিগুলো সংশোধন করে আবার চেষ্টা করুন।`,
        'error'
      );
    }
  };

  const handleClose = () => {
    if (isUploading) {
      if (!confirm('ছবি আপলোড প্রক্রিয়া চলছে। আপনি কি এটি বন্ধ করতে চান?')) return;
    }
    items.forEach(it => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    });
    setItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-neutral-900 border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">একসাথে একাধিক ছবি আপলোড (Batch Artwork Upload)</h2>
              <p className="text-[11px] text-neutral-300">
                একসাথে একাধিক আর্টওয়ার্কের ছবি নির্বাচন করুন এবং সরাসরি গ্যালারিতে যোগ করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-neutral-50/50 text-xs">
          {/* File Selection Dropzone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDraggingOver
                ? 'border-neutral-900 bg-neutral-100/80 scale-[0.99]'
                : 'border-neutral-300 hover:border-neutral-500 bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileInputChange}
              className="hidden"
              id="batch-artwork-file-input"
            />
            <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 shadow-2xs">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-xs sm:text-sm">
                  কম্পিউটার বা ফোন থেকে ছবিগুলো টেনে এখানে ড্রপ করুন (Drag & Drop)
                </p>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  অথবা একাধিক ছবি একসাথে সিলেক্ট করতে নিচের বাটনে চাপ দিন (JPG, PNG, WebP)
                </p>
              </div>
            </div>

            <div className="mt-3">
              <label
                htmlFor="batch-artwork-file-input"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium text-xs hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>ছবি নির্বাচন করুন (Select Photos)</span>
              </label>
            </div>
          </div>

          {/* Mode Switcher */}
          {items.length > 0 && (
            <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBatchMode('individual')}
                  className={`py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    batchMode === 'individual'
                      ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>প্রতিটি ছবি আলাদা আর্টওয়ার্ক (Individual Artworks)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBatchMode('bundled')}
                  className={`py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    batchMode === 'bundled'
                      ? 'bg-neutral-950 text-white shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>১টি আর্টওয়ার্কের একাধিক সাইড / অ্যাঙ্গেল (যেমন: পোর্ট্রেট)</span>
                </button>
              </div>
            </div>
          )}

          {/* Bundled Mode: Main Artwork Details Card */}
          {items.length > 0 && batchMode === 'bundled' && (
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>মূল আর্টওয়ার্কের তথ্য (এই ১টি আর্টওয়ার্কে সকল ছবি যুক্ত হবে):</span>
                </span>
                <span className="text-[11px] font-mono bg-amber-200/70 px-2 py-0.5 rounded text-amber-900">
                  {items.length}টি সাইড/অ্যাঙ্গেল ছবি
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-900 mb-1 font-medium">
                    আর্টওয়ার্ক শিরোনাম (Title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bundledTitle}
                    disabled={isUploading}
                    onChange={e => setBundledTitle(e.target.value)}
                    placeholder="যেমন: Portrait Study in Charcoal"
                    className="w-full border border-amber-300 p-2 rounded-md bg-white text-xs font-medium focus:border-amber-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-amber-900 mb-1 font-medium">ক্যাটাগরি (Category)</label>
                  <select
                    value={batchCategory}
                    disabled={isUploading}
                    onChange={e => setBatchCategory(e.target.value)}
                    className="w-full border border-amber-300 p-2 rounded-md bg-white text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-amber-900 mb-1 font-medium">বছর (Year)</label>
                  <input
                    type="number"
                    value={batchYear}
                    disabled={isUploading}
                    onChange={e => setBatchYear(parseInt(e.target.value, 10) || currentYear)}
                    className="w-full border border-amber-300 p-1.5 rounded-md bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-amber-900 mb-1 font-medium">মিডিয়াম (Medium)</label>
                  <input
                    type="text"
                    value={batchMedium}
                    disabled={isUploading}
                    onChange={e => setBatchMedium(e.target.value)}
                    placeholder="যেমন: Oil on linen"
                    className="w-full border border-amber-300 p-1.5 rounded-md bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-amber-900 mb-1 font-medium">সাইজ / Dimensions</label>
                  <input
                    type="text"
                    value={bundledDimensions}
                    disabled={isUploading}
                    onChange={e => setBundledDimensions(e.target.value)}
                    placeholder="যেমন: 75 × 60 cm"
                    className="w-full border border-amber-300 p-1.5 rounded-md bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-900 mb-1 font-medium">বিবরণ / Description (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={bundledDescription}
                  disabled={isUploading}
                  onChange={e => setBundledDescription(e.target.value)}
                  placeholder="এই আর্টওয়ার্ক বা পোর্ট্রেট সম্পর্কিত বিবরণ..."
                  className="w-full border border-amber-300 p-1.5 rounded-md bg-white text-xs focus:border-amber-900 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Batch Default Settings Bar (Individual Mode Only) */}
          {items.length > 0 && batchMode === 'individual' && (
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>সকল নির্বাচিত ছবির জন্য কমন সেটিংস (Bulk Settings)</span>
                </span>
                <span className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                  মোট {items.length}টি ছবি নির্বাচিত
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Default Category */}
                <div>
                  <label className="block text-neutral-600 mb-1 font-medium">ক্যাটাগরি (Category)</label>
                  <select
                    value={batchCategory}
                    disabled={isUploading}
                    onChange={e => setBatchCategory(e.target.value)}
                    className="w-full border border-neutral-300 p-1.5 rounded-md bg-white text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Year */}
                <div>
                  <label className="block text-neutral-600 mb-1 font-medium">বছর (Year)</label>
                  <input
                    type="number"
                    value={batchYear}
                    disabled={isUploading}
                    onChange={e => setBatchYear(parseInt(e.target.value, 10) || currentYear)}
                    className="w-full border border-neutral-300 p-1.5 rounded-md text-xs font-mono"
                    placeholder="2024"
                  />
                </div>

                {/* Default Medium */}
                <div>
                  <label className="block text-neutral-600 mb-1 font-medium">মিডিয়াম (Medium - ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={batchMedium}
                    disabled={isUploading}
                    onChange={e => setBatchMedium(e.target.value)}
                    className="w-full border border-neutral-300 p-1.5 rounded-md text-xs"
                    placeholder="যেমন: Oil on Canvas, Charcoal"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleApplyBatchSettings}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium text-[11px] transition-colors cursor-pointer"
                >
                  সবার উপর এই ক্যাটাগরি ও বছর প্রয়োগ করুন
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress Bar if uploading */}
          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-blue-900 font-medium">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>
                    আপলোড ও প্রসেসিং হচ্ছে: {currentUploadIndex + 1} / {items.length} (
                    {items[currentUploadIndex]?.title || 'ছবি'})
                  </span>
                </span>
                <span className="font-mono">{overallProgress}%</span>
              </div>
              <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Selected Artworks List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 text-xs">
                  নির্বাচিত ছবির বিবরণ (প্রয়োজনে শিরোনাম বা ক্যাটাগরি পরিবর্তন করুন):
                </h3>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      items.forEach(it => {
                        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
                      });
                      setItems([]);
                    }}
                    className="text-red-600 hover:text-red-800 text-[11px] hover:underline cursor-pointer"
                  >
                    সবগুলো মুছে ফেলুন
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg border p-3 flex gap-3 transition-colors relative ${
                      item.status === 'done'
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : item.status === 'uploading'
                        ? 'border-blue-400 ring-2 ring-blue-100'
                        : item.status === 'error'
                        ? 'border-red-300 bg-red-50/30'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Item Thumbnail */}
                    <div className="w-24 h-24 shrink-0 rounded bg-neutral-100 overflow-hidden border border-neutral-200 relative">
                      <img
                        src={item.previewUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-black/70 text-white font-mono text-[9px] px-1 py-0.5 rounded">
                        #{idx + 1}
                      </span>

                      {/* Status Overlay */}
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-2xs flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      {item.status === 'done' && (
                        <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-2xs flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7 text-white" />
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div className="absolute inset-0 bg-red-900/50 backdrop-blur-2xs flex items-center justify-center">
                          <AlertCircle className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Item Details Form */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {batchMode === 'bundled' ? (
                        <>
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] text-neutral-500 font-medium">
                                  সাইড / অ্যাঙ্গেলের নাম:
                                </label>
                                {primaryIndex === idx ? (
                                  <span className="text-[10px] bg-amber-500 text-neutral-950 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-neutral-950" />
                                    <span>প্রধান কভার</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryIndex(idx)}
                                    className="text-[10px] text-neutral-600 hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Star className="w-2.5 h-2.5" />
                                    <span>কভার ছবি করুন</span>
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={item.title}
                                disabled={isUploading || item.status === 'done'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setItems(prev =>
                                    prev.map(it => (it.id === item.id ? { ...it, title: val } : it))
                                  );
                                }}
                                className="w-full border border-neutral-200 px-2 py-1 rounded text-xs font-medium focus:border-neutral-900 focus:outline-hidden"
                                placeholder="যেমন: সামনের দিক, সাইড ভিউ, ক্লোজ-আপ..."
                              />
                            </div>

                            {!isUploading && item.status !== 'done' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-neutral-400 hover:text-red-600 rounded cursor-pointer shrink-0 mt-3"
                                title="তালিকা থেকে বাদ দিন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Quick Angle Suggestions */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {['সামনের দিক', 'বাম পাশ', 'ডান পাশ', 'ক্লোজ-আপ'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => {
                                  setItems(prev =>
                                    prev.map(it => (it.id === item.id ? { ...it, title: chip } : it))
                                  );
                                }}
                                className="text-[9px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                + {chip}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1">
                              <label className="block text-[10px] text-neutral-500 font-medium">আর্টওয়ার্ক টাইটেল</label>
                              <input
                                type="text"
                                value={item.title}
                                disabled={isUploading || item.status === 'done'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setItems(prev =>
                                    prev.map(it => (it.id === item.id ? { ...it, title: val } : it))
                                  );
                                }}
                                className="w-full border border-neutral-200 px-2 py-1 rounded text-xs font-medium focus:border-neutral-900 focus:outline-hidden"
                                placeholder="Artwork Title"
                              />
                            </div>

                            {!isUploading && item.status !== 'done' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-neutral-400 hover:text-red-600 rounded cursor-pointer"
                                title="তালিকা থেকে বাদ দিন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-neutral-500 font-medium">ক্যাটাগরি</label>
                              <select
                                value={item.categorySlug}
                                disabled={isUploading || item.status === 'done'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setItems(prev =>
                                    prev.map(it => (it.id === item.id ? { ...it, categorySlug: val } : it))
                                  );
                                }}
                                className="w-full border border-neutral-200 px-1.5 py-1 rounded text-[11px] bg-white"
                              >
                                {categories.map(c => (
                                  <option key={c.id} value={c.slug}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-neutral-500 font-medium">বছর</label>
                              <input
                                type="number"
                                value={item.year}
                                disabled={isUploading || item.status === 'done'}
                                onChange={e => {
                                  const val = parseInt(e.target.value, 10) || currentYear;
                                  setItems(prev =>
                                    prev.map(it => (it.id === item.id ? { ...it, year: val } : it))
                                  );
                                }}
                                className="w-full border border-neutral-200 px-1.5 py-1 rounded text-[11px] font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={item.medium}
                              disabled={isUploading || item.status === 'done'}
                              onChange={e => {
                                const val = e.target.value;
                                setItems(prev =>
                                  prev.map(it => (it.id === item.id ? { ...it, medium: val } : it))
                                );
                              }}
                              placeholder="মিডিয়াম (যেমন: Oil, Acrylic, Mixed Media)"
                              className="w-full border border-neutral-200 px-2 py-0.5 rounded text-[11px]"
                            />
                          </div>
                        </>
                      )}

                      {item.status === 'error' && (
                        <p className="text-[10px] text-red-600 font-medium truncate">
                          {item.errorMessage || 'আপলোড ব্যর্থ'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="text-neutral-500 text-[11px]">
            {items.length > 0
              ? `${items.length}টি ছবির মধ্যে ${items.filter(i => i.status === 'done').length}টি সম্পন্ন`
              : 'কোনো ছবি নির্বাচিত নেই'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleClose}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg font-medium transition-colors cursor-pointer"
            >
              বাতিল (Cancel)
            </button>

            <button
              type="button"
              disabled={items.length === 0 || isUploading}
              onClick={handleStartUpload}
              className="inline-flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>আপলোড হচ্ছে ({currentUploadIndex + 1}/{items.length})...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>সবগুলো আর্টওয়ার্ক আপলোড করুন ({items.length}টি)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

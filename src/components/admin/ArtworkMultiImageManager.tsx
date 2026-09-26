import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ArtworkImage as ArtworkImageType } from '../../types';
import { ArtworkImage } from '../common/ArtworkImage';
import { api } from '../../api/client';

interface ArtworkMultiImageManagerProps {
  mainImage: string;
  images?: ArtworkImageType[];
  onChange: (data: { mainImage: string; images: ArtworkImageType[] }) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const COMMON_ANGLE_SUGGESTIONS = [
  'সামনের দিক (Front View)',
  'বাম পাশ (Left Side Angle)',
  'ডান পাশ (Right Side Angle)',
  'পেছনের দিক (Back View)',
  'ক্লোজ-আপ ডিটেইল (Close-up / Texture)',
  '৪৫° কোণ (45° Angle View)',
  'ফ্রেম সহ ডিসপ্লে (Framed View)',
  'স্টুডিও লাইট (Studio Lighting)',
];

export const ArtworkMultiImageManager: React.FC<ArtworkMultiImageManagerProps> = ({
  mainImage,
  images = [],
  onChange,
  showToast,
}) => {
  const [imageList, setImageList] = useState<ArtworkImageType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlAltInput, setUrlAltInput] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync incoming props to internal list
  useEffect(() => {
    if (images && images.length > 0) {
      // Ensure at least one isPrimary or matches mainImage
      const hasPrimary = images.some(img => img.isPrimary || (mainImage && img.url === mainImage));
      const normalized = images.map((img, idx) => ({
        ...img,
        id: img.id || `img-${Date.now()}-${idx}`,
        order: img.order || idx + 1,
        isPrimary: mainImage ? img.url === mainImage : idx === 0,
      }));
      setImageList(normalized);
    } else if (mainImage && mainImage.trim() !== '') {
      setImageList([
        {
          id: `img-${Date.now()}-main`,
          url: mainImage,
          alt: 'সামনের মূল ভিউ (Front / Main)',
          order: 1,
          isPrimary: true,
        },
      ]);
    } else {
      setImageList([]);
    }
  }, [images, mainImage]);

  const notifyChange = (updatedList: ArtworkImageType[], forcedMainUrl?: string) => {
    setImageList(updatedList);

    // Determine the mainImage URL
    let primaryUrl = forcedMainUrl;
    if (!primaryUrl) {
      const primaryImg = updatedList.find(img => img.isPrimary);
      primaryUrl = primaryImg ? primaryImg.url : updatedList[0]?.url || '';
    }

    onChange({
      mainImage: primaryUrl,
      images: updatedList,
    });
  };

  // Set an image as the Primary / Cover image
  const handleSetPrimary = (index: number) => {
    const updated = imageList.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    notifyChange(updated, updated[index]?.url);
    showToast(`"${updated[index]?.alt || 'ছবি ' + (index + 1)}" প্রধান কভার হিসেবে সেট হয়েছে`, 'success');
  };

  // Reorder: Move image left/right
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imageList.length) return;

    const copy = [...imageList];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Re-index orders
    const reordered = copy.map((img, idx) => ({
      ...img,
      order: idx + 1,
    }));

    notifyChange(reordered);
  };

  // Delete an image
  const handleDeleteImage = (index: number) => {
    const removedImg = imageList[index];
    const copy = imageList.filter((_, idx) => idx !== index);

    // If we removed the primary image, make the 1st remaining image primary
    let newPrimaryUrl: string | undefined = undefined;
    if (removedImg.isPrimary && copy.length > 0) {
      copy[0] = { ...copy[0], isPrimary: true };
      newPrimaryUrl = copy[0].url;
    } else if (copy.length === 0) {
      newPrimaryUrl = '';
    }

    const reordered = copy.map((img, idx) => ({
      ...img,
      order: idx + 1,
    }));

    notifyChange(reordered, newPrimaryUrl);
    showToast('ছবি তালিকা থেকে সরানো হয়েছে', 'info');
  };

  // Update alt / caption for a specific image
  const handleUpdateAlt = (index: number, newAlt: string) => {
    const updated = imageList.map((img, idx) => (idx === index ? { ...img, alt: newAlt } : img));
    notifyChange(updated);
  };

  // Add multiple files from file picker or drag & drop
  const handleFilesAdded = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showToast('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।', 'error');
      return;
    }

    setIsUploading(true);
    const newItems: ArtworkImageType[] = [];
    const total = imageFiles.length;

    try {
      for (let i = 0; i < total; i++) {
        const file = imageFiles[i];
        setUploadProgressText(`ছবি আপলোড হচ্ছে (${i + 1}/${total}): ${file.name}...`);
        
        try {
          const res = await api.uploadFile(file);
          const cleanName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .trim();

          const isFirstEver = imageList.length === 0 && i === 0;

          newItems.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            url: res.url,
            alt: isFirstEver ? 'সামনের মূল ভিউ (Front View)' : `ভিউ ${imageList.length + i + 1} (${cleanName})`,
            order: imageList.length + i + 1,
            isPrimary: isFirstEver,
          });
        } catch (err: any) {
          console.error('Failed to upload image:', file.name, err);
          showToast(`"${file.name}" আপলোড ব্যর্থ: ${err.message || 'ত্রুটি'}`, 'error');
        }
      }

      if (newItems.length > 0) {
        const combined = [...imageList, ...newItems].map((img, idx) => ({
          ...img,
          order: idx + 1,
        }));
        
        // Ensure at least one primary
        const hasPrimary = combined.some(img => img.isPrimary);
        if (!hasPrimary && combined.length > 0) {
          combined[0].isPrimary = true;
        }

        notifyChange(combined);
        showToast(`${newItems.length}টি ছবির ভিউ সফলভাবে যুক্ত করা হয়েছে!`, 'success');
      }
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add an image via URL
  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      showToast('অনুগ্রহ করে ছবির একটি বৈধ URL দিন', 'error');
      return;
    }

    const isFirstEver = imageList.length === 0;
    const newImg: ArtworkImageType = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url: trimmed,
      alt: urlAltInput.trim() || `ভিউ ${imageList.length + 1}`,
      order: imageList.length + 1,
      isPrimary: isFirstEver,
    };

    const updated = [...imageList, newImg];
    notifyChange(updated);
    setUrlInput('');
    setUrlAltInput('');
    setShowUrlInput(false);
    showToast('ছবির লিংক সফলভাবে যুক্ত হয়েছে', 'success');
  };

  return (
    <div className="space-y-4 bg-neutral-50/80 border border-neutral-200 rounded-lg p-4">
      {/* Header section with instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-800" />
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              আর্টওয়ার্কের ছবি ও বিভিন্ন সাইড / অ্যাঙ্গেল (Multi-Angle Photos)
            </h4>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-200/80 text-neutral-700 rounded-full">
              {imageList.length} টি ছবি
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            একটি আর্টওয়ার্ক বা পোর্ট্রেটের বিভিন্ন পাশ (সামনে, বাম, ডান, পেছনের কোণ, ফ্রেম বা টেক্সচারের ডিটেইল ছবি) একসাথে আপলোড করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-neutral-600 hover:text-neutral-900 px-2 py-1 border border-neutral-200 rounded bg-white hover:bg-neutral-50 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'লিংক ইনপুট বন্ধ' : 'URL লিংক দিয়ে যোগ'}</span>
          </button>

          <label className="text-[11px] bg-neutral-950 hover:bg-neutral-800 text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer font-medium shadow-2xs">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>একসাথে একাধিক ছবি আপলোড</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading}
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilesAdded(e.target.files);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Uploading progress bar */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-900 flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="font-medium">{uploadProgressText || 'ছবিগুলো প্রসেস ও আপলোড হচ্ছে...'}</span>
        </div>
      )}

      {/* Manual URL Input Card */}
      {showUrlInput && (
        <div className="p-3 bg-white border border-neutral-200 rounded-md space-y-2 text-xs">
          <div className="font-medium text-neutral-800">ইমেজ URL দিয়ে একটি সাইড/ভিউ যোগ করুন:</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-7">
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://... ইমেজ ওয়েব লিংক বা Cloudinary URL"
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-xs font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={urlAltInput}
                onChange={e => setUrlAltInput(e.target.value)}
                placeholder="অ্যাঙ্গেল নাম (যেমন: Left Side)"
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddUrl}
                className="w-full bg-neutral-900 text-white hover:bg-neutral-800 py-1.5 px-3 rounded text-xs font-medium cursor-pointer"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDraggingOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesAdded(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
          isDraggingOver
            ? 'border-neutral-900 bg-neutral-100 scale-[1.01]'
            : 'border-neutral-300 hover:border-neutral-400 bg-white/70 hover:bg-white'
        }`}
      >
        <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-1.5" />
        <p className="text-xs font-medium text-neutral-800">
          এখানে একাধিক ছবি ড্র্যাগ করে এনে ছেড়ে দিন, অথবা ক্লিক করে ফাইল সিলেক্ট করুন
        </p>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          (একসাথে একাধিক ছবি নির্বাচন করতে কীবোর্ডের <kbd className="px-1 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-[10px]">Ctrl</kbd> বা <kbd className="px-1 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-[10px]">Shift</kbd> চেপে সব ছবি একসাথে সিলেক্ট করুন)
        </p>
      </div>

      {/* Image Gallery Cards */}
      {imageList.length === 0 ? (
        <div className="text-center py-6 border border-neutral-200/70 rounded-md bg-white text-xs text-neutral-400">
          এখনও কোনো ছবি যোগ করা হয়নি। উপরের বাটন থেকে ছবি আপলোড করুন।
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
            <span className="font-medium">সংযুক্ত ছবি ও অ্যাঙ্গেলসমূহ (ক্রম অনুযায়ী সাজানো):</span>
            <span className="text-[11px] text-neutral-500">
              টিপ: যে ছবিটি কভার বা মূল তালিকায় দেখাতে চান তাতে <strong>"প্রধান ছবি করুন"</strong> চাপুন।
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {imageList.map((img, idx) => {
              const isPrimary = img.isPrimary || (mainImage && img.url === mainImage);

              return (
                <div
                  key={img.id || idx}
                  className={`bg-white border rounded-lg overflow-hidden shadow-2xs transition-all flex flex-col justify-between ${
                    isPrimary
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Top Image Preview & Badges */}
                  <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                    <ArtworkImage
                      src={img.url}
                      alt={img.alt || `Angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Order badge */}
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      #{idx + 1}
                    </div>

                    {/* Primary Badge */}
                    {isPrimary ? (
                      <div className="absolute top-2 right-2 bg-amber-500 text-neutral-950 font-bold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-neutral-950 text-neutral-950" />
                        <span>প্রধান কভার ছবি</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-amber-400 text-neutral-800 hover:text-neutral-950 text-[10px] font-medium px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="এই ছবিটিকে আর্টওয়ার্কের প্রধান কভার হিসেবে সেট করুন"
                      >
                        <Star className="w-3 h-3 text-neutral-600" />
                        <span>প্রধান ছবি করুন</span>
                      </button>
                    )}
                  </div>

                  {/* Body: Label & Fast Suggestions */}
                  <div className="p-3 space-y-2 text-xs flex-1 flex flex-col justify-between">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                        সাইড / অ্যাঙ্গেলের নাম:
                      </label>
                      <input
                        type="text"
                        value={img.alt || ''}
                        onChange={e => handleUpdateAlt(idx, e.target.value)}
                        placeholder="যেমন: সামনের দিক, সাইড ভিউ, ক্লোজ-আপ..."
                        className="w-full border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
                      />

                      {/* Quick angle selection chips */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {COMMON_ANGLE_SUGGESTIONS.slice(0, 4).map(sug => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleUpdateAlt(idx, sug)}
                            className="text-[9px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                            title="এই লেবেলটি সেট করুন"
                          >
                            + {sug.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions: Reorder and Delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'left')}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 cursor-pointer"
                          title="আগে নিন (Move Left)"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === imageList.length - 1}
                          onClick={() => handleMoveImage(idx, 'right')}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 cursor-pointer"
                          title="পরে নিন (Move Right)"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="এই ছবিটি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

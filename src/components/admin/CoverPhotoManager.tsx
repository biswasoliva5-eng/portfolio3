import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../api/client';
import { SiteSettings, CoverPosition, Artwork } from '../../types';
import { CoverCropModal } from './CoverCropModal';
import {
  Upload,
  Crop,
  Image as ImageIcon,
  Type,
  Palette,
  Eye,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Maximize2,
  Smartphone,
  Monitor,
  Grid,
  Info,
} from 'lucide-react';

interface CoverPhotoManagerProps {
  onSaved?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CoverPhotoManager: React.FC<CoverPhotoManagerProps> = ({ onSaved, showToast }) => {
  const { data, refreshData, navigate, formatUrl } = usePortfolio();
  const currentSettings = data?.settings || ({} as SiteSettings);

  // Form State
  const [form, setForm] = useState<SiteSettings>({
    artistName: currentSettings.artistName || 'OLIVA BISWAS',
    siteTitle: currentSettings.siteTitle || 'Oliva Biswas — Contemporary Visual Artist',
    headerSubtitle: currentSettings.headerSubtitle || 'Contemporary Visual Artist',
    coverAdditionalText: currentSettings.coverAdditionalText || '',
    contactEmail: currentSettings.contactEmail || 'oliva@example.com',
    studioLocation: currentSettings.studioLocation || 'Dhaka & Berlin',
    coverImage:
      currentSettings.coverImage ||
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=2400&auto=format&fit=crop',
    enterButtonText: currentSettings.enterButtonText || 'ENTER',
    showCoverTitle: currentSettings.showCoverTitle !== false,
    showCoverSubtitle: currentSettings.showCoverSubtitle !== false,
    showCoverEnter: currentSettings.showCoverEnter !== false,
    showCoverAdditional: currentSettings.showCoverAdditional ?? false,
    coverNamePosition: currentSettings.coverNamePosition || 'bottom-left',
    coverEnterPosition: currentSettings.coverEnterPosition || 'bottom-right',
    coverNameFontSize: currentSettings.coverNameFontSize || '8xl',
    coverSubtitleFontSize: currentSettings.coverSubtitleFontSize || 'sm',
    coverEnterFontSize: currentSettings.coverEnterFontSize || 'sm',
    coverFontFamily: currentSettings.coverFontFamily || 'sans',
    coverNameFontWeight: currentSettings.coverNameFontWeight || 'normal',
    coverNameLetterSpacing: currentSettings.coverNameLetterSpacing || 'wider',
    coverTextTransform: currentSettings.coverTextTransform || 'uppercase',
    coverTextShadow: currentSettings.coverTextShadow || 'medium',
    coverEnterShape: currentSettings.coverEnterShape || 'rectangle',
    coverOverlayStyle: currentSettings.coverOverlayStyle || 'gradient',
    coverOverlayOpacity: currentSettings.coverOverlayOpacity ?? 80,
    coverNameColor: currentSettings.coverNameColor || '#ffffff',
    coverSubtitleColor: currentSettings.coverSubtitleColor || '#e2e8f0',
    coverEnterTextColor: currentSettings.coverEnterTextColor || '#ffffff',
    coverEnterBgColor: currentSettings.coverEnterBgColor || 'transparent',
    coverEnterBorderColor: currentSettings.coverEnterBorderColor || '#ffffff',
    coverFocalX: currentSettings.coverFocalX ?? 50,
    coverFocalY: currentSettings.coverFocalY ?? 50,
    coverZoom: currentSettings.coverZoom ?? 100,
    coverBrightness: currentSettings.coverBrightness ?? 100,
    coverContrast: currentSettings.coverContrast ?? 100,
    coverBlur: currentSettings.coverBlur ?? 0,
    coverFitMode: currentSettings.coverFitMode || 'cover',
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'photo' | 'text' | 'style' | 'position'>('photo');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isArtworkPickerOpen, setIsArtworkPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quick Color Palettes
  const textPalettes = [
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Gallery Cream', hex: '#faf7f2' },
    { name: 'Champagne Gold', hex: '#e2c077' },
    { name: 'Silver Slate', hex: '#cbd5e1' },
    { name: 'Charcoal Black', hex: '#18181b' },
    { name: 'Warm Terracotta', hex: '#ea580c' },
    { name: 'Deep Crimson', hex: '#e11d48' },
  ];

  const buttonBgPalettes = [
    { name: 'Transparent', hex: 'transparent' },
    { name: 'Solid Black', hex: '#000000' },
    { name: 'Dark Tint (50%)', hex: 'rgba(0,0,0,0.5)' },
    { name: 'Solid White', hex: '#ffffff' },
    { name: 'White Tint (20%)', hex: 'rgba(255,255,255,0.2)' },
    { name: 'Gold Fill', hex: '#e2c077' },
  ];

  // Save Settings
  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateSettings(form);
      await refreshData();
      showToast('Cover & site settings saved successfully', 'success');
      if (onSaved) onSaved();
    } catch (err: any) {
      showToast(err.message || 'Failed to save cover settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Upload Cover Image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await api.uploadFile(file);
      setForm(prev => ({ ...prev, coverImage: res.url }));
      showToast('Cover photo uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Select Artwork as Cover
  const handleSelectArtwork = (art: Artwork) => {
    setForm(prev => ({
      ...prev,
      coverImage: art.mainImage,
      coverAdditionalText: prev.coverAdditionalText || `${art.title} (${art.year})`,
    }));
    setIsArtworkPickerOpen(false);
    showToast(`Set cover to "${art.title}"`, 'success');
  };

  // Handle Cropped Image from Canvas Studio
  const handleApplyCrop = async (croppedDataUrl: string) => {
    try {
      setUploadingImage(true);
      const res = await api.saveEditedImage(croppedDataUrl, 'cover-crop');
      setForm(prev => ({
        ...prev,
        coverImage: res.url || croppedDataUrl,
        // Reset pan & zoom since crop is baked in
        coverFocalX: 50,
        coverFocalY: 50,
        coverZoom: 100,
      }));
      showToast('Cropped cover image applied', 'success');
    } catch (e) {
      setForm(prev => ({ ...prev, coverImage: croppedDataUrl }));
      showToast('Cropped cover image applied', 'success');
    } finally {
      setUploadingImage(false);
    }
  };

  // Helpers for Preview styling
  const getPreviewFontFamily = () => {
    switch (form.coverFontFamily) {
      case 'serif':
        return 'font-serif';
      case 'playfair':
        return 'font-serif italic';
      case 'cinzel':
        return 'font-serif tracking-[0.2em]';
      case 'mono':
        return 'font-mono';
      case 'display':
        return 'font-sans font-black';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getPreviewFontWeight = () => {
    switch (form.coverNameFontWeight) {
      case 'light':
        return 'font-light';
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      case 'black':
        return 'font-black';
      case 'normal':
      default:
        return 'font-normal';
    }
  };

  const getPreviewLetterSpacing = () => {
    switch (form.coverNameLetterSpacing) {
      case 'tight':
        return 'tracking-tight';
      case 'normal':
        return 'tracking-normal';
      case 'wide':
        return 'tracking-wide';
      case 'widest':
        return 'tracking-[0.22em]';
      case 'ultra':
        return 'tracking-[0.35em]';
      case 'wider':
      default:
        return 'tracking-[0.14em]';
    }
  };

  const getPreviewTextTransform = () => {
    switch (form.coverTextTransform) {
      case 'capitalize':
        return 'capitalize';
      case 'none':
        return 'normal-case';
      case 'uppercase':
      default:
        return 'uppercase';
    }
  };

  const getPreviewTextShadow = () => {
    switch (form.coverTextShadow) {
      case 'none':
        return '';
      case 'subtle':
        return 'drop-shadow-sm';
      case 'strong':
        return 'drop-shadow-2xl';
      case 'glow':
        return '[text-shadow:_0_0_16px_rgba(0,0,0,0.95)]';
      case 'medium':
      default:
        return 'drop-shadow-lg';
    }
  };

  const getPreviewOverlay = () => {
    switch (form.coverOverlayStyle) {
      case 'dark':
        return 'bg-black/75';
      case 'medium':
        return 'bg-black/50';
      case 'light':
        return 'bg-black/25';
      case 'none':
        return 'bg-transparent';
      case 'warm':
        return 'bg-amber-950/45 mix-blend-multiply';
      case 'cool':
        return 'bg-slate-950/50';
      case 'gradient':
      default:
        return 'bg-gradient-to-t from-black/90 via-black/30 to-black/35';
    }
  };

  const getPositionClasses = (position?: CoverPosition) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4 text-left items-start';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2 text-center items-center';
      case 'top-right':
        return 'top-4 right-4 text-right items-end';
      case 'center-left':
        return 'top-1/2 left-4 -translate-y-1/2 text-left items-start';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center';
      case 'center-right':
        return 'top-1/2 right-4 -translate-y-1/2 text-right items-end';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2 text-center items-center';
      case 'bottom-right':
        return 'bottom-4 right-4 text-right items-end';
      case 'bottom-left':
      default:
        return 'bottom-4 left-4 text-left items-start';
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Banner / Action Bar */}
      <div className="bg-neutral-900 text-white p-5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold">Cover Photo & Hero Studio</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Customize cover photo, cropping, sizing, text, fonts, colors, and layout with live preview
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href={formatUrl('/cover')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live</span>
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-white text-black font-semibold hover:bg-neutral-200 rounded text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Changes...' : 'Save Cover Settings'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-neutral-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'photo'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>1. Photo & Crop</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>2. Text & Titles</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'style'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>3. Fonts & Colors</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('position')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'position'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>4. Layout & Frame</span>
            </button>
          </div>

          {/* TAB 1: Photo & Crop Studio */}
          {activeTab === 'photo' && (
            <div className="space-y-5 text-xs">
              {/* Photo Source Card */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900">Cover Photo Source</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCropModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Crop & Frame Canvas</span>
                    </button>
                  </div>
                </div>

                {/* Upload or Choose Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="border border-neutral-300 border-dashed rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-neutral-50 transition-colors">
                    <Upload className="w-4 h-4 text-neutral-500" />
                    <span className="font-medium text-neutral-700">
                      {uploadingImage ? 'Uploading...' : 'Upload Image from Computer'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsArtworkPickerOpen(true)}
                    className="border border-neutral-300 rounded-lg p-3 flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-700 font-medium"
                  >
                    <ImageIcon className="w-4 h-4 text-neutral-500" />
                    <span>Choose from Portfolio Artworks</span>
                  </button>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-neutral-600 mb-1">Or direct Image URL</label>
                  <input
                    type="text"
                    value={form.coverImage || ''}
                    onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-neutral-200 bg-white p-2 rounded text-xs focus:outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>
              </div>

              {/* Photo Framing & Focal Repositioning ("কভার ফটো কতটুকু রাখতে হবে") */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      Focal Point & Framing (এডিট / পজিশনিং)
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Click the grid or adjust sliders to shift which part of the photo stays in frame
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm(f => ({
                        ...f,
                        coverFocalX: 50,
                        coverFocalY: 50,
                        coverZoom: 100,
                        coverBrightness: 100,
                        coverContrast: 100,
                        coverBlur: 0,
                      }))
                    }
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Interactive 3x3 Focal Alignment Matrix */}
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <span className="block text-neutral-600 mb-1.5 text-[11px] font-medium">
                      Quick Focal Alignment:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 w-36">
                      {[
                        { label: 'TL', x: 10, y: 15 },
                        { label: 'TC', x: 50, y: 15 },
                        { label: 'TR', x: 90, y: 15 },
                        { label: 'CL', x: 10, y: 50 },
                        { label: 'Center', x: 50, y: 50 },
                        { label: 'CR', x: 90, y: 50 },
                        { label: 'BL', x: 10, y: 85 },
                        { label: 'BC', x: 50, y: 85 },
                        { label: 'BR', x: 90, y: 85 },
                      ].map(pos => {
                        const isActive = form.coverFocalX === pos.x && form.coverFocalY === pos.y;
                        return (
                          <button
                            key={pos.label}
                            type="button"
                            onClick={() =>
                              setForm(f => ({
                                ...f,
                                coverFocalX: pos.x,
                                coverFocalY: pos.y,
                              }))
                            }
                            className={`p-1.5 rounded text-[10px] font-mono border transition-all ${
                              isActive
                                ? 'bg-neutral-950 text-white border-neutral-950 font-bold'
                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sliders for precise X and Y focal point */}
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Horizontal Center (X)</span>
                        <span className="font-mono font-medium">{form.coverFocalX}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.coverFocalX ?? 50}
                        onChange={e =>
                          setForm(f => ({ ...f, coverFocalX: parseInt(e.target.value) }))
                        }
                        className="w-full accent-neutral-900 h-1 bg-neutral-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Vertical Center (Y)</span>
                        <span className="font-mono font-medium">{form.coverFocalY}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.coverFocalY ?? 50}
                        onChange={e =>
                          setForm(f => ({ ...f, coverFocalY: parseInt(e.target.value) }))
                        }
                        className="w-full accent-neutral-900 h-1 bg-neutral-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Scale / Zoom Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                    <span>Photo Zoom & Resize Scale</span>
                    <span className="font-mono font-medium">{form.coverZoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    step="2"
                    value={form.coverZoom ?? 100}
                    onChange={e => setForm(f => ({ ...f, coverZoom: parseInt(e.target.value) }))}
                    className="w-full accent-neutral-900 h-1 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>100% (Fit)</span>
                    <span>150% (Medium Close-up)</span>
                    <span>220% (Macro Focus)</span>
                  </div>
                </div>

                {/* Image Filters: Brightness & Contrast */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                      <span>Brightness</span>
                      <span className="font-mono">{form.coverBrightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={form.coverBrightness ?? 100}
                      onChange={e =>
                        setForm(f => ({ ...f, coverBrightness: parseInt(e.target.value) }))
                      }
                      className="w-full accent-neutral-900 h-1 bg-neutral-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                      <span>Contrast</span>
                      <span className="font-mono">{form.coverContrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="150"
                      value={form.coverContrast ?? 100}
                      onChange={e =>
                        setForm(f => ({ ...f, coverContrast: parseInt(e.target.value) }))
                      }
                      className="w-full accent-neutral-900 h-1 bg-neutral-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Scrim Overlay Style */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
                <h3 className="font-semibold text-neutral-900">Atmospheric Scrim & Contrast Shade</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'gradient', label: 'Dark Gradient', desc: 'Fade from bottom' },
                    { id: 'dark', label: 'Dark Scrim', desc: 'Solid black tint' },
                    { id: 'medium', label: 'Medium Scrim', desc: 'Balanced 50%' },
                    { id: 'light', label: 'Light Scrim', desc: 'Subtle 25%' },
                    { id: 'warm', label: 'Warm Tint', desc: 'Amber gallery shade' },
                    { id: 'cool', label: 'Cool Slate', desc: 'Deep blue-gray' },
                    { id: 'none', label: 'No Overlay', desc: 'Raw artwork' },
                  ].map(ov => (
                    <button
                      key={ov.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, coverOverlayStyle: ov.id }))}
                      className={`p-2.5 text-left rounded-lg border transition-all ${
                        form.coverOverlayStyle === ov.id
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                      }`}
                    >
                      <div className="font-medium text-xs">{ov.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          form.coverOverlayStyle === ov.id ? 'text-neutral-300' : 'text-neutral-400'
                        }`}
                      >
                        {ov.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Text & Content ("কভার ফটোর উপরে কি কি লেখা থাকবে") */}
          {activeTab === 'text' && (
            <div className="space-y-4 text-xs">
              {/* Main Headline / Artist Name */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-900 flex items-center gap-2">
                    <span>Artist Title / Headline Text</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-600">
                    <input
                      type="checkbox"
                      checked={form.showCoverTitle !== false}
                      onChange={e => setForm(f => ({ ...f, showCoverTitle: e.target.checked }))}
                      className="rounded accent-neutral-900"
                    />
                    <span>Show on Cover</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={form.artistName}
                  onChange={e => setForm(f => ({ ...f, artistName: e.target.value }))}
                  placeholder="OLIVA BISWAS"
                  className="w-full border border-neutral-200 p-2.5 rounded text-sm font-medium focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Subtitle / Tagline */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-900">Subtitle / Tagline Text</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-600">
                    <input
                      type="checkbox"
                      checked={form.showCoverSubtitle !== false}
                      onChange={e => setForm(f => ({ ...f, showCoverSubtitle: e.target.checked }))}
                      className="rounded accent-neutral-900"
                    />
                    <span>Show Subtitle</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={form.headerSubtitle || ''}
                  onChange={e => setForm(f => ({ ...f, headerSubtitle: e.target.value }))}
                  placeholder="Contemporary Visual Artist"
                  className="w-full border border-neutral-200 p-2 rounded focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Enter Button Label */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-900">Enter Button Label</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-600">
                    <input
                      type="checkbox"
                      checked={form.showCoverEnter !== false}
                      onChange={e => setForm(f => ({ ...f, showCoverEnter: e.target.checked }))}
                      className="rounded accent-neutral-900"
                    />
                    <span>Show Enter Button</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={form.enterButtonText || ''}
                  onChange={e => setForm(f => ({ ...f, enterButtonText: e.target.value }))}
                  placeholder="ENTER"
                  className="w-full border border-neutral-200 p-2 rounded focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Additional Custom Badge / Note */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-900">
                    Additional Badge / Location / Year Note
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-600">
                    <input
                      type="checkbox"
                      checked={!!form.showCoverAdditional}
                      onChange={e => setForm(f => ({ ...f, showCoverAdditional: e.target.checked }))}
                      className="rounded accent-neutral-900"
                    />
                    <span>Show Note</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={form.coverAdditionalText || ''}
                  onChange={e => setForm(f => ({ ...f, coverAdditionalText: e.target.value }))}
                  placeholder="e.g. Selected Works 2020–2025 • Dhaka / Berlin"
                  className="w-full border border-neutral-200 p-2 rounded focus:outline-hidden focus:border-neutral-900"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Fonts & Colors ("কোন রঙের হবে, কোন অক্ষরের হবে") */}
          {activeTab === 'style' && (
            <div className="space-y-5 text-xs">
              {/* Typography / Font Family ("কোন অক্ষরের হবে") */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-4">
                <h3 className="font-semibold text-neutral-900">
                  Font Family & Letter Style (অক্ষরের ধরণ)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'sans', name: 'Modern Sans', sample: 'OLIVA BISWAS', fontClass: 'font-sans' },
                    { id: 'serif', name: 'Editorial Serif', sample: 'Oliva Biswas', fontClass: 'font-serif' },
                    { id: 'playfair', name: 'Italic Serif', sample: 'Oliva Biswas', fontClass: 'font-serif italic' },
                    { id: 'cinzel', name: 'Classic Monumental', sample: 'OLIVA BISWAS', fontClass: 'font-serif tracking-widest' },
                    { id: 'mono', name: 'Minimal Monospace', sample: 'oliva.biswas', fontClass: 'font-mono' },
                    { id: 'display', name: 'Bold Impact', sample: 'OLIVA', fontClass: 'font-sans font-black tracking-tighter' },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, coverFontFamily: f.id }))}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        form.coverFontFamily === f.id
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-900'
                      }`}
                    >
                      <div className="text-[11px] font-medium opacity-70 mb-1">{f.name}</div>
                      <div className={`text-sm truncate ${f.fontClass}`}>{f.sample}</div>
                    </button>
                  ))}
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
                  <div>
                    <label className="block text-neutral-600 mb-1">Headline Size</label>
                    <select
                      value={form.coverNameFontSize || '8xl'}
                      onChange={e => setForm(f => ({ ...f, coverNameFontSize: e.target.value }))}
                      className="w-full border border-neutral-200 p-2 rounded bg-white"
                    >
                      <option value="4xl">Medium (4xl)</option>
                      <option value="5xl">Large (5xl)</option>
                      <option value="6xl">Very Large (6xl)</option>
                      <option value="7xl">Monumental (7xl)</option>
                      <option value="8xl">Epic (8xl) — Standard</option>
                      <option value="9xl">Ultra Epic (9xl)</option>
                      <option value="10xl">Maximum Bleed (10xl)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 mb-1">Font Weight</label>
                    <select
                      value={form.coverNameFontWeight || 'normal'}
                      onChange={e => setForm(f => ({ ...f, coverNameFontWeight: e.target.value }))}
                      className="w-full border border-neutral-200 p-2 rounded bg-white"
                    >
                      <option value="light">Light (300)</option>
                      <option value="normal">Normal (400)</option>
                      <option value="medium">Medium (500)</option>
                      <option value="semibold">Semibold (600)</option>
                      <option value="bold">Bold (700)</option>
                      <option value="black">Black (900)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 mb-1">Letter Spacing</label>
                    <select
                      value={form.coverNameLetterSpacing || 'wider'}
                      onChange={e => setForm(f => ({ ...f, coverNameLetterSpacing: e.target.value }))}
                      className="w-full border border-neutral-200 p-2 rounded bg-white"
                    >
                      <option value="tight">Tight</option>
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                      <option value="wider">Wider (Standard)</option>
                      <option value="widest">Widest</option>
                      <option value="ultra">Ultra-Spaced</option>
                    </select>
                  </div>
                </div>

                {/* Text Case & Shadow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                  <div>
                    <label className="block text-neutral-600 mb-1">Capitalization</label>
                    <select
                      value={form.coverTextTransform || 'uppercase'}
                      onChange={e => setForm(f => ({ ...f, coverTextTransform: e.target.value }))}
                      className="w-full border border-neutral-200 p-2 rounded bg-white"
                    >
                      <option value="uppercase">ALL UPPERCASE (Recommended)</option>
                      <option value="capitalize">Title Case (First Letters Capital)</option>
                      <option value="none">As Typed (Normal Case)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 mb-1">
                      Text Contrast & Readability Glow
                    </label>
                    <select
                      value={form.coverTextShadow || 'medium'}
                      onChange={e => setForm(f => ({ ...f, coverTextShadow: e.target.value }))}
                      className="w-full border border-neutral-200 p-2 rounded bg-white"
                    >
                      <option value="none">None (Flat Text)</option>
                      <option value="subtle">Subtle Shadow</option>
                      <option value="medium">Standard Drop Shadow</option>
                      <option value="strong">Dramatic Deep Shadow</option>
                      <option value="glow">Contrast Halo (For Bright Artwork)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Text Colors ("কোন রঙের হবে") */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-4">
                <h3 className="font-semibold text-neutral-900">
                  Text & Button Colors (রঙ নির্বাচন)
                </h3>

                {/* Title / Name Color */}
                <div className="space-y-2">
                  <label className="block text-neutral-700 font-medium">
                    Headline / Artist Name Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="color"
                      value={form.coverNameColor || '#ffffff'}
                      onChange={e => setForm(f => ({ ...f, coverNameColor: e.target.value }))}
                      className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={form.coverNameColor || '#ffffff'}
                      onChange={e => setForm(f => ({ ...f, coverNameColor: e.target.value }))}
                      className="w-28 border border-neutral-200 px-2 py-1.5 rounded font-mono text-xs"
                    />
                    <div className="flex items-center gap-1.5 ml-2">
                      {textPalettes.map(p => (
                        <button
                          key={p.hex}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, coverNameColor: p.hex }))}
                          title={p.name}
                          style={{ backgroundColor: p.hex }}
                          className={`w-6 h-6 rounded-full border ${
                            form.coverNameColor === p.hex
                              ? 'ring-2 ring-neutral-950 scale-110'
                              : 'border-neutral-300 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subtitle Color */}
                <div className="space-y-2 pt-3 border-t border-neutral-100">
                  <label className="block text-neutral-700 font-medium">Subtitle Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.coverSubtitleColor || '#e2e8f0'}
                      onChange={e => setForm(f => ({ ...f, coverSubtitleColor: e.target.value }))}
                      className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={form.coverSubtitleColor || '#e2e8f0'}
                      onChange={e => setForm(f => ({ ...f, coverSubtitleColor: e.target.value }))}
                      className="w-28 border border-neutral-200 px-2 py-1.5 rounded font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Enter Button Styling */}
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <label className="block text-neutral-700 font-medium">Enter Button Styling</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] text-neutral-500 mb-1">Text Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={form.coverEnterTextColor || '#ffffff'}
                          onChange={e => setForm(f => ({ ...f, coverEnterTextColor: e.target.value }))}
                          className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={form.coverEnterTextColor || '#ffffff'}
                          onChange={e => setForm(f => ({ ...f, coverEnterTextColor: e.target.value }))}
                          className="w-20 border border-neutral-200 px-2 py-1 rounded font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] text-neutral-500 mb-1">Border Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={form.coverEnterBorderColor || '#ffffff'}
                          onChange={e =>
                            setForm(f => ({ ...f, coverEnterBorderColor: e.target.value }))
                          }
                          className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={form.coverEnterBorderColor || '#ffffff'}
                          onChange={e =>
                            setForm(f => ({ ...f, coverEnterBorderColor: e.target.value }))
                          }
                          className="w-20 border border-neutral-200 px-2 py-1 rounded font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] text-neutral-500 mb-1">Button Shape</span>
                      <select
                        value={form.coverEnterShape || 'rectangle'}
                        onChange={e => setForm(f => ({ ...f, coverEnterShape: e.target.value }))}
                        className="w-full border border-neutral-200 p-1.5 rounded bg-white text-xs"
                      >
                        <option value="rectangle">Square / Rectangle</option>
                        <option value="rounded">Soft Rounded</option>
                        <option value="pill">Pill Capsule</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Layout & Screen Positioning */}
          {activeTab === 'position' && (
            <div className="space-y-4 text-xs">
              {/* Title Position */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
                <h3 className="font-semibold text-neutral-900">
                  Headline Position on Screen (স্ক্রিনে লেখার অবস্থান)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'top-center', label: 'Top Center' },
                    { id: 'top-right', label: 'Top Right' },
                    { id: 'center-left', label: 'Center Left' },
                    { id: 'center', label: 'Center' },
                    { id: 'center-right', label: 'Center Right' },
                    { id: 'bottom-left', label: 'Bottom Left (Standard)' },
                    { id: 'bottom-center', label: 'Bottom Center' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() =>
                        setForm(f => ({ ...f, coverNamePosition: pos.id as CoverPosition }))
                      }
                      className={`p-2.5 text-center rounded border transition-all ${
                        form.coverNamePosition === pos.id
                          ? 'bg-neutral-950 text-white font-medium shadow-xs'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter Button Position */}
              <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
                <h3 className="font-semibold text-neutral-900">Enter Button Position</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bottom-right', label: 'Bottom Right (Standard)' },
                    { id: 'bottom-center', label: 'Bottom Center' },
                    { id: 'bottom-left', label: 'Together with Name' },
                    { id: 'center', label: 'Dead Center' },
                    { id: 'top-right', label: 'Top Right' },
                    { id: 'top-center', label: 'Top Center' },
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() =>
                        setForm(f => ({ ...f, coverEnterPosition: pos.id as CoverPosition }))
                      }
                      className={`p-2.5 text-center rounded border transition-all ${
                        form.coverEnterPosition === pos.id
                          ? 'bg-neutral-950 text-white font-medium shadow-xs'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Responsive Preview (5 cols on lg) */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              <span>Live Visual Monitor</span>
            </span>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded border border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1 rounded flex items-center gap-1 ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-neutral-950 shadow-xs font-medium'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3 h-3" />
                <span className="text-[10px]">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1 rounded flex items-center gap-1 ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-neutral-950 shadow-xs font-medium'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3 h-3" />
                <span className="text-[10px]">Mobile</span>
              </button>
            </div>
          </div>

          {/* Interactive Simulation Frame */}
          <div className="bg-neutral-950 p-2 sm:p-3 rounded-xl border border-neutral-800 shadow-xl flex items-center justify-center overflow-hidden">
            <div
              style={{
                width: previewDevice === 'desktop' ? '100%' : '260px',
                aspectRatio: previewDevice === 'desktop' ? '16/9' : '9/16',
              }}
              className="relative rounded-lg overflow-hidden bg-black select-none border border-neutral-800 shadow-inner flex flex-col justify-between transition-all duration-300"
            >
              {/* Background Cover Image */}
              <img
                src={form.coverImage}
                alt="Live cover preview"
                style={{
                  objectPosition: `${form.coverFocalX ?? 50}% ${form.coverFocalY ?? 50}%`,
                  transform: `scale(${(form.coverZoom ?? 100) / 100})`,
                  filter: `brightness(${form.coverBrightness ?? 100}%) contrast(${
                    form.coverContrast ?? 100
                  }%) blur(${form.coverBlur ?? 0}px)`,
                }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
              />

              {/* Scrim Overlay */}
              <div
                style={
                  typeof form.coverOverlayOpacity === 'number'
                    ? { opacity: form.coverOverlayOpacity / 100 }
                    : undefined
                }
                className={`absolute inset-0 pointer-events-none ${getPreviewOverlay()}`}
              />

              {/* Simulated Admin Tag */}
              <div className="absolute top-2 right-2 z-10 text-[9px] uppercase tracking-widest text-white/50 bg-black/40 px-1.5 py-0.5 rounded border border-white/20">
                ADMIN
              </div>

              {/* Rendered Text Elements */}
              {form.coverNamePosition === form.coverEnterPosition ? (
                /* Unified */
                <div
                  className={`absolute z-10 p-2 flex flex-col gap-2 max-w-[85%] ${getPositionClasses(
                    form.coverNamePosition
                  )}`}
                >
                  {form.showCoverSubtitle !== false && form.headerSubtitle && (
                    <div
                      style={{ color: form.coverSubtitleColor }}
                      className={`text-[9px] tracking-widest uppercase font-light drop-shadow-sm ${getPreviewTextTransform()}`}
                    >
                      {form.headerSubtitle}
                    </div>
                  )}

                  {form.showCoverTitle !== false && (
                    <div
                      style={{ color: form.coverNameColor }}
                      className={`text-lg sm:text-2xl leading-none ${getPreviewFontFamily()} ${getPreviewFontWeight()} ${getPreviewLetterSpacing()} ${getPreviewTextTransform()} ${getPreviewTextShadow()}`}
                    >
                      {form.artistName}
                    </div>
                  )}

                  {form.showCoverAdditional && form.coverAdditionalText && (
                    <div
                      style={{ color: form.coverSubtitleColor }}
                      className="text-[8px] opacity-75 uppercase tracking-wider"
                    >
                      {form.coverAdditionalText}
                    </div>
                  )}

                  {form.showCoverEnter !== false && (
                    <div
                      style={{
                        color: form.coverEnterTextColor,
                        backgroundColor: form.coverEnterBgColor || 'transparent',
                        borderColor: form.coverEnterBorderColor,
                      }}
                      className={`border px-3 py-1 text-[9px] uppercase font-light tracking-widest w-fit shadow-xs ${
                        form.coverEnterShape === 'pill'
                          ? 'rounded-full'
                          : form.coverEnterShape === 'rounded'
                          ? 'rounded-md'
                          : 'rounded-none'
                      }`}
                    >
                      {form.enterButtonText || 'ENTER'}
                    </div>
                  )}
                </div>
              ) : (
                /* Independent */
                <>
                  <div
                    className={`absolute z-10 p-2 flex flex-col max-w-[80%] ${getPositionClasses(
                      form.coverNamePosition
                    )}`}
                  >
                    {form.showCoverSubtitle !== false && form.headerSubtitle && (
                      <div
                        style={{ color: form.coverSubtitleColor }}
                        className={`text-[9px] tracking-widest uppercase font-light drop-shadow-sm mb-1 ${getPreviewTextTransform()}`}
                      >
                        {form.headerSubtitle}
                      </div>
                    )}

                    {form.showCoverTitle !== false && (
                      <div
                        style={{ color: form.coverNameColor }}
                        className={`text-lg sm:text-2xl leading-none ${getPreviewFontFamily()} ${getPreviewFontWeight()} ${getPreviewLetterSpacing()} ${getPreviewTextTransform()} ${getPreviewTextShadow()}`}
                      >
                        {form.artistName}
                      </div>
                    )}

                    {form.showCoverAdditional && form.coverAdditionalText && (
                      <div
                        style={{ color: form.coverSubtitleColor }}
                        className="text-[8px] opacity-75 uppercase tracking-wider mt-1"
                      >
                        {form.coverAdditionalText}
                      </div>
                    )}
                  </div>

                  {form.showCoverEnter !== false && (
                    <div className={`absolute z-10 p-2 ${getPositionClasses(form.coverEnterPosition)}`}>
                      <div
                        style={{
                          color: form.coverEnterTextColor,
                          backgroundColor: form.coverEnterBgColor || 'transparent',
                          borderColor: form.coverEnterBorderColor,
                        }}
                        className={`border px-3 py-1 text-[9px] uppercase font-light tracking-widest shadow-xs ${
                          form.coverEnterShape === 'pill'
                            ? 'rounded-full'
                            : form.coverEnterShape === 'rounded'
                            ? 'rounded-md'
                            : 'rounded-none'
                        }`}
                      >
                        {form.enterButtonText || 'ENTER'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-neutral-600 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-neutral-900">
              <Info className="w-3.5 h-3.5 text-neutral-500" />
              <span>Cover Screen Tips</span>
            </div>
            <p>
              The cover screen greets every visitor. Use high-contrast font colors or the "Contrast
              Halo" setting if your cover painting has light or multi-colored areas.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Canvas Cropper */}
      <CoverCropModal
        isOpen={isCropModalOpen}
        imageUrl={form.coverImage || ''}
        onClose={() => setIsCropModalOpen(false)}
        onApplyCrop={handleApplyCrop}
      />

      {/* MODAL 2: Portfolio Artwork Picker */}
      {isArtworkPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl text-xs space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-neutral-950">
                  Select Artwork as Cover Photo
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Click on any artwork image from your portfolio to set it as the cover
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsArtworkPickerOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {(!data?.artworks || data.artworks.length === 0) ? (
                <div className="col-span-full py-12 text-center text-neutral-400">
                  No artworks found in portfolio. Upload an image above instead.
                </div>
              ) : (
                data.artworks.map(art => (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArtwork(art)}
                    className="group border border-neutral-200 hover:border-neutral-900 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md flex flex-col"
                  >
                    <div className="aspect-4/3 bg-neutral-100 relative overflow-hidden">
                      <img
                        src={art.mainImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white text-black px-2 py-1 rounded text-[10px] font-semibold transition-opacity shadow-sm">
                          Set Cover
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-white flex-1">
                      <div className="font-medium text-neutral-900 truncate">{art.title}</div>
                      <div className="text-[10px] text-neutral-400">{art.year}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

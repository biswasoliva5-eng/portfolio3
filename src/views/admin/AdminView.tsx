import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../api/client';
import {
  Palette,
  Layers,
  Calendar,
  FileText,
  Sliders,
  Mail,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  User,
  Image as ImageIcon,
  Shield,
  KeyRound,
  ArrowUp,
  ArrowDown,
  Video,
  ChevronsUp,
  ChevronsDown,
  ArrowUpDown,
  CheckCircle2,
  GripVertical,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { Artwork, Category, Exhibition } from '../../types';
import { CoverPhotoManager } from '../../components/admin/CoverPhotoManager';
import { AdminSecurityManager } from '../../components/admin/AdminSecurityManager';
import { CVManager } from '../../components/admin/CVManager';
import { CloudinarySettingsCard } from '../../components/admin/CloudinarySettingsCard';
import { ArtworkImage } from '../../components/common/ArtworkImage';
import { BatchArtworkUploadModal } from '../../components/admin/BatchArtworkUploadModal';
import { VisualArtworkReorderModal } from '../../components/admin/VisualArtworkReorderModal';

type AdminTab =
  | 'artworks'
  | 'categories'
  | 'exhibitions'
  | 'cover'
  | 'about'
  | 'cv'
  | 'settings'
  | 'security'
  | 'messages';

export const AdminView: React.FC = () => {
  const { data, refreshData, logoutAdmin, navigate, showToast, formatUrl } = usePortfolio();
  const [currentTab, setCurrentTab] = useState<AdminTab>('artworks');

  // Artwork state
  const [editingArtwork, setEditingArtwork] = useState<Partial<Artwork> | null>(null);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [isBatchUploadModalOpen, setIsBatchUploadModalOpen] = useState(false);
  const [isVisualReorderModalOpen, setIsVisualReorderModalOpen] = useState(false);
  const [uploadingArtImage, setUploadingArtImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isReorderingMode, setIsReorderingMode] = useState(false);
  const [draggedArtIndex, setDraggedArtIndex] = useState<number | null>(null);
  const [dragOverArtIndex, setDragOverArtIndex] = useState<number | null>(null);

  // Category state
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState<number | null>(null);

  // Exhibition state
  const [editingExhibition, setEditingExhibition] = useState<Partial<Exhibition> | null>(null);
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);

  // About form state
  const [aboutForm, setAboutForm] = useState({
    artistBio: data?.about?.artistBio || '',
    artistStatement: data?.about?.artistStatement || '',
    portraitUrl: data?.about?.portraitUrl || '',
    representation: data?.about?.representation || '',
    studioLocation: data?.settings?.studioLocation || '',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    artistName: data?.settings?.artistName || 'OLIVA BISWAS',
    siteTitle: data?.settings?.siteTitle || 'Oliva Biswas — Contemporary Artist',
    headerSubtitle: data?.settings?.headerSubtitle || '',
    contactEmail: data?.settings?.contactEmail || '',
    studioLocation: data?.settings?.studioLocation || '',
    coverImage: data?.settings?.coverImage || '',
    enterButtonText: data?.settings?.enterButtonText || 'ENTER',
    coverNamePosition: data?.settings?.coverNamePosition || 'bottom-left',
    coverEnterPosition: data?.settings?.coverEnterPosition || 'bottom-right',
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.updateSettings(settingsForm as any);
      await refreshData();
      showToast('Settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Save About
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAbout(true);
      await api.updateAbout(aboutForm);
      if (aboutForm.studioLocation) {
        await api.updateSettings({ studioLocation: aboutForm.studioLocation });
      }
      await refreshData();
      showToast('About content saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save about content', 'error');
    } finally {
      setSavingAbout(false);
    }
  };

  // Upload CV PDF
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCV(true);
      await api.uploadCV(file);
      await refreshData();
      showToast('CV uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload CV', 'error');
    } finally {
      setUploadingCV(false);
    }
  };

  // Delete CV
  const handleDeleteCV = async () => {
    if (!confirm('Are you sure you want to remove the current CV?')) return;
    try {
      await api.deleteCV();
      await refreshData();
      showToast('CV removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove CV', 'error');
    }
  };

  // Artwork Save
  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork?.title || !editingArtwork?.mainImage) {
      showToast('Please provide a title and image.', 'error');
      return;
    }

    try {
      if (editingArtwork.id) {
        await api.updateArtwork(editingArtwork.id, editingArtwork);
        showToast('Artwork updated', 'success');
      } else {
        await api.addArtwork(editingArtwork);
        showToast('Artwork created', 'success');
      }
      await refreshData();
      setIsArtworkModalOpen(false);
      setEditingArtwork(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save artwork', 'error');
    }
  };

  // Artwork Delete
  const handleDeleteArtwork = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;
    try {
      await api.deleteArtwork(id);
      await refreshData();
      showToast('Artwork deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete artwork', 'error');
    }
  };

  // Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, editingCategory);
        showToast('Category updated', 'success');
      } else {
        await api.addCategory({
          name: editingCategory.name,
          slug: editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: editingCategory.description || '',
          order: editingCategory.order || (data?.categories.length || 0) + 1,
        });
        showToast('Category created', 'success');
      }
      await refreshData();
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save category', 'error');
    }
  };

  // Category Delete
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      await refreshData();
      showToast('Category deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Exhibition Save
  const handleSaveExhibition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExhibition?.title || !editingExhibition?.venue) return;
    try {
      if (editingExhibition.id) {
        await api.updateExhibition(editingExhibition.id, editingExhibition);
        showToast('Exhibition updated', 'success');
      } else {
        await api.addExhibition({
          title: editingExhibition.title,
          year: editingExhibition.year || new Date().getFullYear(),
          type: editingExhibition.type || 'Solo',
          venue: editingExhibition.venue,
          location: editingExhibition.location || '',
          curator: editingExhibition.curator || '',
          link: editingExhibition.link || '',
        });
        showToast('Exhibition added', 'success');
      }
      await refreshData();
      setIsExhibitionModalOpen(false);
      setEditingExhibition(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save exhibition', 'error');
    }
  };

  // Exhibition Delete
  const handleDeleteExhibition = async (id: string) => {
    if (!confirm('Delete this exhibition entry?')) return;
    try {
      await api.deleteExhibition(id);
      await refreshData();
      showToast('Exhibition deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete exhibition', 'error');
    }
  };

  // Reorder Artworks handler
  const handleMoveArtwork = async (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const list = [...(data?.artworks || [])].sort((a, b) => (a.order || 9999) - (b.order || 9999));
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else if (direction === 'top' && index > 0) {
      const [item] = list.splice(index, 1);
      list.unshift(item);
    } else if (direction === 'bottom' && index < list.length - 1) {
      const [item] = list.splice(index, 1);
      list.push(item);
    } else {
      return;
    }

    try {
      const orderedIds = list.map(a => a.id);
      await api.reorderArtworks(orderedIds);
      await refreshData();
      showToast('আর্টওয়ার্কের নতুন ক্রম সেভ হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'ক্রম সেভ করতে ব্যর্থ', 'error');
    }
  };

  // Set specific numeric rank for artwork
  const handleSetArtworkExactOrder = async (artId: string, newOrder: number) => {
    const list = [...(data?.artworks || [])].sort((a, b) => (a.order || 9999) - (b.order || 9999));
    const targetIdx = list.findIndex(a => a.id === artId);
    if (targetIdx === -1) return;
    const [item] = list.splice(targetIdx, 1);
    const clampedIndex = Math.max(0, Math.min(newOrder - 1, list.length));
    list.splice(clampedIndex, 0, item);

    try {
      const orderedIds = list.map(a => a.id);
      await api.reorderArtworks(orderedIds);
      await refreshData();
      showToast('ক্রম আপডেট হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update order', 'error');
    }
  };

  // Drag and drop reorder for artworks
  const handleArtworkDrop = async (sourceIdx: number, targetIdx: number) => {
    if (sourceIdx === targetIdx) return;
    const list = [...(data?.artworks || [])].sort((a, b) => (a.order || 9999) - (b.order || 9999));
    const [moved] = list.splice(sourceIdx, 1);
    list.splice(targetIdx, 0, moved);
    try {
      const orderedIds = list.map(a => a.id);
      await api.reorderArtworks(orderedIds);
      await refreshData();
      showToast('আর্টওয়ার্ক ড্র্যাগ করে নতুন ক্রমে সাজানো হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'ক্রম সেভ করতে ব্যর্থ', 'error');
    }
  };

  // Reorder Categories handler (Directional buttons)
  const handleMoveCategory = async (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const list = [...(data?.categories || [])].sort((a, b) => (a.order || 9999) - (b.order || 9999));
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else if (direction === 'top' && index > 0) {
      const [item] = list.splice(index, 1);
      list.unshift(item);
    } else if (direction === 'bottom' && index < list.length - 1) {
      const [item] = list.splice(index, 1);
      list.push(item);
    } else {
      return;
    }

    try {
      const orderedIds = list.map(c => c.id);
      await api.reorderCategories(orderedIds);
      await refreshData();
      showToast('ক্যাটাগরির নতুন ক্রম সেভ হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'ক্যাটাগরি ক্রম সেভ করতে ব্যর্থ', 'error');
    }
  };

  // Drag and drop reorder for categories
  const handleCategoryDrop = async (sourceIdx: number, targetIdx: number) => {
    if (sourceIdx === targetIdx) return;
    const list = [...(data?.categories || [])].sort((a, b) => (a.order || 9999) - (b.order || 9999));
    const [moved] = list.splice(sourceIdx, 1);
    list.splice(targetIdx, 0, moved);
    try {
      const orderedIds = list.map(c => c.id);
      await api.reorderCategories(orderedIds);
      await refreshData();
      showToast('ক্যাটাগরি ড্র্যাগ করে সফলভাবে সাজানো হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'ব্যর্থ হয়েছে', 'error');
    }
  };

  // Exact rank setter for category
  const handleSetCategoryExactOrder = async (catId: string, newOrder: number) => {
    const list = [...(data?.categories || [])].sort((a, b) => (a.order || 9999) - (b.order || 9999));
    const targetIdx = list.findIndex(c => c.id === catId);
    if (targetIdx === -1) return;
    const [item] = list.splice(targetIdx, 1);
    const clampedIndex = Math.max(0, Math.min(newOrder - 1, list.length));
    list.splice(clampedIndex, 0, item);

    try {
      const orderedIds = list.map(c => c.id);
      await api.reorderCategories(orderedIds);
      await refreshData();
      showToast('ক্যাটাগরি ক্রম আপডেট হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update category order', 'error');
    }
  };

  // Exhibition Reorder
  const handleMoveExhibition = async (index: number, direction: 'up' | 'down') => {
    const list = [...(data?.exhibitions || [])].sort((a, b) => (a.order || 9999) - (b.order || 9999));
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else {
      return;
    }
    try {
      const orderedIds = list.map(e => e.id);
      await api.reorderExhibitions(orderedIds);
      await refreshData();
      showToast('এক্সিবিশন ক্রম সেভ হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder exhibitions', 'error');
    }
  };

  // Clear all demo exhibitions
  const handleClearAllDemoExhibitions = async () => {
    if (!confirm('সতর্কতা: আপনি কি সকল এক্সিবিশন মুছে ফেলতে চান? এরপর আপনি নিজের আসল এক্সিবিশন যোগ করতে পারবেন।')) return;
    try {
      const list = [...(data?.exhibitions || [])];
      for (const ex of list) {
        await api.deleteExhibition(ex.id);
      }
      await refreshData();
      showToast('সকল এক্সিবিশন মুছে ফেলা হয়েছে', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear exhibitions', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-900">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold tracking-tight text-neutral-950">
            Oliva Biswas Studio CMS
          </h1>
          <span className="hidden sm:inline-block text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
            {data?.artworks.length || 0} Artworks
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <a
            href={formatUrl('/')}
            onClick={e => {
              e.preventDefault();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
          <button
            onClick={() => {
              logoutAdmin();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Navigation Sidebar */}
        <nav className="w-48 sm:w-56 shrink-0 bg-white border border-neutral-200/80 rounded-md p-3 space-y-1 h-fit sticky top-20 shadow-xs text-xs">
          <button
            onClick={() => setCurrentTab('artworks')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'artworks'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Artworks</span>
          </button>

          <button
            onClick={() => setCurrentTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'categories'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setCurrentTab('exhibitions')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'exhibitions'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Exhibitions</span>
          </button>

          <button
            onClick={() => setCurrentTab('cover')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'cover'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Cover Photo & Hero</span>
          </button>

          <button
            onClick={() => setCurrentTab('about')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'about'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>About & Bio</span>
          </button>

          <button
            onClick={() => setCurrentTab('cv')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'cv'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Curriculum Vitae</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setCurrentTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'security'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setCurrentTab('messages')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'messages'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries</span>
          </button>
        </nav>

        {/* Content Pane */}
        <main className="flex-1 bg-white border border-neutral-200/80 rounded-md p-6 shadow-xs min-w-0">
          {/* 1. ARTWORKS TAB */}
          {currentTab === 'artworks' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-neutral-950">Artworks</h2>
                    <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
                      {(data?.artworks || []).length} items
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    আর্টওয়ার্ক আপলোড করুন, ইচ্ছামতো আগে-পরে সাজান (Reorder) এবং ভিডিও যুক্ত করুন
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs transition-colors cursor-pointer shadow-2xs font-medium"
                    title="একসাথে একাধিক ছবি নির্বাচন করে গ্যালারিতে আপলোড করুন"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>একসাথে একাধিক ছবি আপলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVisualReorderModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs transition-colors cursor-pointer shadow-2xs font-medium"
                    title="পার্সেল / ড্র্যাগ অ্যান্ড ড্রপ দিয়ে সহজে আর্টওয়ার্কের ক্রম পরিবর্তন করুন"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>ফ্লেক্সিবল ক্রম সাজান (Visual Board)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReorderingMode(!isReorderingMode)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer border ${
                      isReorderingMode
                        ? 'bg-amber-500 text-white border-amber-600 font-medium'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>{isReorderingMode ? 'সাজানো সম্পন্ন' : 'তালিকায় ক্রম বাটন'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingArtwork({
                        year: new Date().getFullYear(),
                        categorySlug: data?.categories[0]?.slug || 'painting',
                        images: [],
                      });
                      setIsArtworkModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন আর্টওয়ার্ক</span>
                  </button>
                </div>
              </div>

              {isReorderingMode && (
                <div className="bg-amber-50/70 border border-amber-200 p-3 rounded text-xs text-amber-900 flex items-center justify-between">
                  <div>
                    <strong>ফ্লেক্সিবল ক্রম মোড:</strong> যেকোনো কার্ড মাউস দিয়ে ড্র্যাগ (Drag & Drop) করে পছন্দের ঘরে বসান অথবা <strong>⤒ শুরুতে</strong> / <strong>↑ উপরে</strong> চাপুন অথবা সরাসরি নম্বর লিখুন।
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReorderingMode(false)}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-medium hover:bg-amber-700 shrink-0 ml-3 cursor-pointer"
                  >
                    ঠিক আছে
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...(data?.artworks || [])]
                  .sort((a, b) => (a.order || 9999) - (b.order || 9999))
                  .map((artwork, idx, arr) => (
                    <div
                      key={artwork.id}
                      draggable
                      onDragStart={e => {
                        setDraggedArtIndex(idx);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(idx));
                      }}
                      onDragOver={e => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverArtIndex !== idx) setDragOverArtIndex(idx);
                      }}
                      onDragEnd={() => {
                        setDraggedArtIndex(null);
                        setDragOverArtIndex(null);
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        if (draggedArtIndex !== null && draggedArtIndex !== idx) {
                          handleArtworkDrop(draggedArtIndex, idx);
                        }
                        setDraggedArtIndex(null);
                        setDragOverArtIndex(null);
                      }}
                      className={`border rounded-lg p-3 flex flex-col justify-between transition-all bg-white cursor-grab active:cursor-grabbing select-none ${
                        draggedArtIndex === idx
                          ? 'opacity-30 border-blue-500 scale-98'
                          : dragOverArtIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-300 bg-blue-50/20'
                          : isReorderingMode
                          ? 'border-amber-300 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div>
                        {/* Position badge, Drag handle and video indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-neutral-400 hover:text-neutral-800 p-0.5 rounded cursor-grab"
                              title="মাউস দিয়ে টেনে আগে-পিছে নিন (Drag to Reorder)"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-white shadow-2xs">
                              #{idx + 1}
                            </span>
                            {artwork.videoUrl && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium border border-red-200">
                                <Video className="w-3 h-3" />
                                <span>Video</span>
                              </span>
                            )}
                          </div>

                          {/* Quick Order Input */}
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500" onClick={e => e.stopPropagation()}>
                            <span>ক্রম:</span>
                            <input
                              type="number"
                              min={1}
                              max={arr.length}
                              defaultValue={idx + 1}
                              key={`${artwork.id}-${idx}`}
                              onBlur={e => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val > 0 && val !== idx + 1) {
                                  handleSetArtworkExactOrder(artwork.id, val);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                                  if (!isNaN(val) && val > 0 && val !== idx + 1) {
                                    handleSetArtworkExactOrder(artwork.id, val);
                                  }
                                }
                              }}
                              className="w-11 px-1 py-0.5 text-center border border-neutral-300 rounded font-mono text-xs focus:outline-hidden focus:border-neutral-900"
                              title="সরাসরি পজিশন নম্বর লিখে Enter চাপুন"
                            />
                          </div>
                        </div>

                        <div className="aspect-4/3 bg-neutral-100 mb-3 overflow-hidden rounded relative">
                          <ArtworkImage
                            src={artwork.mainImage}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-medium text-xs text-neutral-950 truncate">
                          {artwork.title}
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          {artwork.year} • {artwork.categoryName || artwork.categorySlug}
                        </p>
                      </div>

                      {/* Reorder arrows and edit/delete actions */}
                      <div className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-neutral-100" onClick={e => e.stopPropagation()}>
                        {/* Directional buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveArtwork(idx, 'top')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded disabled:opacity-20 cursor-pointer"
                            title="সবার শুরুতে নিয়ে যান (First)"
                          >
                            <ChevronsUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveArtwork(idx, 'up')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded disabled:opacity-20 cursor-pointer"
                            title="এক ধাপ উপরে (Move Up)"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveArtwork(idx, 'down')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded disabled:opacity-20 cursor-pointer"
                            title="এক ধাপ নিচে (Move Down)"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveArtwork(idx, 'bottom')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded disabled:opacity-20 cursor-pointer"
                            title="সবার শেষে নিয়ে যান (Last)"
                          >
                            <ChevronsDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Edit and Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingArtwork(artwork);
                              setIsArtworkModalOpen(true);
                            }}
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded cursor-pointer"
                            title="Edit artwork"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArtwork(artwork.id)}
                            className="p-1 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded cursor-pointer"
                            title="Delete artwork"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 2. CATEGORIES TAB */}
          {currentTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-neutral-950">Categories</h2>
                    <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
                      {(data?.categories || []).length} categories
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    ক্যাটাগরি তৈরি করুন এবং মাউস দিয়ে টেনে (Drag & Drop) পছন্দের ক্রমে আগে-পরে সাজান
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory({ order: (data?.categories.length || 0) + 1 });
                    setIsCategoryModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন ক্যাটাগরি</span>
                </button>
              </div>

              {/* Live Navigation Ribbon Preview */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>ওয়েবসাইটে মেনু প্রদর্শনের ক্রম (Live Navigation Order):</span>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    যে ক্যাটাগরি প্রথমে থাকবে সেটি ভিজিটরদের সামনে আগে আসবে
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-neutral-400 font-mono">Works ▾</span>
                  {[...(data?.categories || [])]
                    .sort((a, b) => (a.order || 9999) - (b.order || 9999))
                    .map((c, i) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 text-xs bg-white border border-neutral-300 px-2.5 py-1 rounded-md font-medium text-neutral-800 shadow-2xs"
                      >
                        <span className="text-amber-600 font-mono font-bold">#{i + 1}</span>
                        <span>{c.name}</span>
                      </span>
                    ))}
                </div>
              </div>

              {/* Draggable Category Cards */}
              <div className="space-y-2.5">
                {[...(data?.categories || [])]
                  .sort((a, b) => (a.order || 9999) - (b.order || 9999))
                  .map((cat, idx, arr) => (
                    <div
                      key={cat.id}
                      draggable
                      onDragStart={e => {
                        setDraggedCatIndex(idx);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(idx));
                      }}
                      onDragOver={e => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverCatIndex !== idx) setDragOverCatIndex(idx);
                      }}
                      onDragEnd={() => {
                        setDraggedCatIndex(null);
                        setDragOverCatIndex(null);
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        if (draggedCatIndex !== null && draggedCatIndex !== idx) {
                          handleCategoryDrop(draggedCatIndex, idx);
                        }
                        setDraggedCatIndex(null);
                        setDragOverCatIndex(null);
                      }}
                      className={`border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white transition-all cursor-grab active:cursor-grabbing select-none ${
                        draggedCatIndex === idx
                          ? 'opacity-30 border-blue-500 scale-98'
                          : dragOverCatIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-300 bg-blue-50/20'
                          : 'border-neutral-200 hover:border-neutral-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Drag Grip Handle */}
                        <div
                          className="text-neutral-400 hover:text-neutral-900 cursor-grab active:cursor-grabbing p-1"
                          title="মাউস দিয়ে টেনে যেকোনো পজিশনে বসান (Drag & Drop)"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Rank Badge */}
                        <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          #{idx + 1}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-xs text-neutral-950 uppercase tracking-wider">
                              {cat.name}
                            </h3>
                            <span className="text-[10px] text-neutral-400 font-mono">/{cat.slug}</span>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1 max-w-md">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                        {/* Numeric Rank Input */}
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500 mr-2">
                          <span>পজিশন:</span>
                          <input
                            type="number"
                            min={1}
                            max={arr.length}
                            defaultValue={idx + 1}
                            key={`${cat.id}-${idx}`}
                            onBlur={e => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val > 0 && val !== idx + 1) {
                                handleSetCategoryExactOrder(cat.id, val);
                              }
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = parseInt((e.target as HTMLInputElement).value, 10);
                                if (!isNaN(val) && val > 0 && val !== idx + 1) {
                                  handleSetCategoryExactOrder(cat.id, val);
                                }
                              }
                            }}
                            className="w-10 px-1 py-0.5 text-center border border-neutral-300 rounded font-mono text-xs focus:outline-hidden focus:border-neutral-900"
                            title="পজিশন নম্বর লিখে Enter চাপুন"
                          />
                        </div>

                        {/* Quick directional buttons */}
                        <div className="flex items-center gap-0.5 bg-neutral-100 p-0.5 rounded border border-neutral-200">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCategory(idx, 'top')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-white rounded disabled:opacity-20 cursor-pointer"
                            title="সবার শুরুতে নিয়ে যান (First)"
                          >
                            <ChevronsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCategory(idx, 'up')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-white rounded disabled:opacity-20 cursor-pointer"
                            title="এক ধাপ উপরে (Move Up)"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveCategory(idx, 'down')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-white rounded disabled:opacity-20 cursor-pointer"
                            title="এক ধাপ নিচে (Move Down)"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveCategory(idx, 'bottom')}
                            className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-white rounded disabled:opacity-20 cursor-pointer"
                            title="সবার শেষে নিয়ে যান (Last)"
                          >
                            <ChevronsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 border-l border-neutral-200 pl-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 3. EXHIBITIONS TAB */}
          {currentTab === 'exhibitions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-neutral-950">Exhibitions</h2>
                    <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
                      {(data?.exhibitions || []).length} items
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    এক্সিবিশন যোগ করুন, এডিট করুন, মুছুন বা ক্রম সাজান
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(data?.exhibitions || []).length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllDemoExhibitions}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 bg-red-50/40 hover:bg-red-50 rounded text-xs transition-colors cursor-pointer"
                      title="সকল ডেমো এক্সিবিশন এক ক্লিকে মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>সকল ডেমো মুছুন</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingExhibition({
                        year: new Date().getFullYear(),
                        type: 'Solo',
                        title: '',
                        venue: '',
                        location: '',
                      });
                      setIsExhibitionModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন এক্সিবিশন যোগ করুন</span>
                  </button>
                </div>
              </div>

              {(data?.exhibitions || []).length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-neutral-200 rounded-lg p-6 bg-white">
                  <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-700 font-medium">কোনো এক্সিবিশন যোগ করা নেই</p>
                  <p className="text-[11px] text-neutral-400 mt-1 mb-3">
                    আপনার একক (Solo) বা যৌথ (Group) প্রদর্শনীর তথ্য যোগ করতে উপরের বাটনে ক্লিক করুন
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExhibition({
                        year: new Date().getFullYear(),
                        type: 'Solo',
                        title: '',
                        venue: '',
                      });
                      setIsExhibitionModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-950 text-white text-xs rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>প্রথম এক্সিবিশন যোগ করুন</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...(data?.exhibitions || [])]
                    .sort((a, b) => (a.order || 9999) - (b.order || 9999))
                    .map((ex, idx, arr) => (
                      <div
                        key={ex.id}
                        className="border border-neutral-200 rounded p-4 flex items-center justify-between bg-white hover:border-neutral-300 transition-colors"
                      >
                        <div className="min-w-0 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-mono font-bold text-neutral-800">
                              {ex.year}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium ${
                              ex.type?.toLowerCase() === 'solo'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {ex.type}
                            </span>
                          </div>
                          <h3 className="font-medium text-xs text-neutral-950 mt-1.5 truncate">{ex.title}</h3>
                          <p className="text-[11px] text-neutral-600 mt-0.5">
                            {ex.venue} {ex.location && `• ${ex.location}`}
                            {ex.curator && ` • Curated by ${ex.curator}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reorder arrows */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveExhibition(idx, 'up')}
                            className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                            title="উপরে নিন"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveExhibition(idx, 'down')}
                            className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                            title="নিচে নিন"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingExhibition(ex);
                              setIsExhibitionModalOpen(true);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExhibition(ex.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* 4. ABOUT TAB */}
          {currentTab === 'about' && (
            <form onSubmit={handleSaveAbout} className="space-y-6 max-w-2xl text-xs font-sans">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold text-neutral-950">About & Bio</h2>
                <p className="text-xs text-neutral-400">
                  Update biography, artist statement, representation, and portrait
                </p>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1.5">Biography</label>
                <textarea
                  rows={6}
                  value={aboutForm.artistBio}
                  onChange={e => setAboutForm(a => ({ ...a, artistBio: e.target.value }))}
                  className="w-full border border-neutral-200 p-3 rounded focus:outline-hidden focus:border-neutral-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1.5">
                  Artist Statement
                </label>
                <textarea
                  rows={5}
                  value={aboutForm.artistStatement}
                  onChange={e => setAboutForm(a => ({ ...a, artistStatement: e.target.value }))}
                  className="w-full border border-neutral-200 p-3 rounded focus:outline-hidden focus:border-neutral-900 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">
                    Portrait Image URL
                  </label>
                  <input
                    type="text"
                    value={aboutForm.portraitUrl}
                    onChange={e => setAboutForm(a => ({ ...a, portraitUrl: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">
                    Gallery Representation
                  </label>
                  <input
                    type="text"
                    value={aboutForm.representation}
                    onChange={e => setAboutForm(a => ({ ...a, representation: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAbout}
                className="bg-neutral-950 text-white px-5 py-2.5 rounded text-xs uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
              >
                {savingAbout ? 'Saving...' : 'Save About Information'}
              </button>
            </form>
          )}

          {/* 5. CV TAB */}
          {currentTab === 'cv' && (
            <CVManager showToast={showToast} onSaved={refreshData} />
          )}

          {/* COVER & HERO STUDIO TAB */}
          {currentTab === 'cover' && (
            <CoverPhotoManager
              showToast={showToast}
              onSaved={refreshData}
            />
          )}

          {/* 6. SETTINGS TAB */}
          {currentTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl text-xs font-sans">
              <div className="pb-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-neutral-950">Site & General Settings</h2>
                  <p className="text-xs text-neutral-400">
                    Artist identity, contact coordinates, and studio info
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('cover')}
                  className="px-3 py-1.5 bg-neutral-950 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Cover Photo Studio →</span>
                </button>
              </div>

              {/* Quick Callout to Cover Studio */}
              <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-amber-950">
                  <div className="p-1.5 bg-amber-100 rounded text-amber-800">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-amber-900">
                      Looking to customize the Cover Photo, Crop, Fonts & Colors?
                    </div>
                    <div className="text-[11px] text-amber-700">
                      Use the dedicated Cover Studio with live interactive preview, canvas cropper, and color pickers.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('cover')}
                  className="px-3 py-1.5 bg-amber-900 text-white rounded text-xs font-medium hover:bg-amber-800 transition-colors shrink-0 ml-3"
                >
                  Open Studio
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">Artist Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.artistName}
                    onChange={e => setSettingsForm(s => ({ ...s, artistName: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">Site Title</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.siteTitle}
                    onChange={e => setSettingsForm(s => ({ ...s, siteTitle: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={e => setSettingsForm(s => ({ ...s, contactEmail: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">
                    Studio Location
                  </label>
                  <input
                    type="text"
                    value={settingsForm.studioLocation}
                    onChange={e => setSettingsForm(s => ({ ...s, studioLocation: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1.5">
                  Cover Hero Image URL
                </label>
                <input
                  type="text"
                  value={settingsForm.coverImage}
                  onChange={e => setSettingsForm(s => ({ ...s, coverImage: e.target.value }))}
                  className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">
                    Enter Button Label
                  </label>
                  <input
                    type="text"
                    value={settingsForm.enterButtonText}
                    onChange={e => setSettingsForm(s => ({ ...s, enterButtonText: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1.5">
                    Cover Subtitle Header
                  </label>
                  <input
                    type="text"
                    value={settingsForm.headerSubtitle}
                    onChange={e => setSettingsForm(s => ({ ...s, headerSubtitle: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900"
                    placeholder="Contemporary Visual Artist"
                  />
                </div>
              </div>

              {/* Cloudinary & Image/Video Hosting Card */}
              <CloudinarySettingsCard showToast={showToast} />

              {/* Security & Password Card */}
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-neutral-200 rounded text-neutral-800">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-neutral-900">
                      Admin Password & Username Security
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Update your login password and username to prevent unauthorized access.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('security')}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors shrink-0 ml-3"
                >
                  Manage Security →
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="bg-neutral-950 text-white px-5 py-2.5 rounded text-xs uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          )}

          {/* SECURITY & PASSWORD TAB */}
          {currentTab === 'security' && (
            <AdminSecurityManager showToast={showToast} />
          )}

          {/* 7. INQUIRIES TAB */}
          {currentTab === 'messages' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold text-neutral-950">Inquiries</h2>
                <p className="text-xs text-neutral-400">
                  Messages submitted through the public contact form
                </p>
              </div>

              {(!data?.inquiries || data.inquiries.length === 0) ? (
                <div className="py-16 text-center text-neutral-400 text-xs">
                  No inquiries received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.inquiries.map(inq => (
                    <div
                      key={inq.id}
                      className="border border-neutral-200 rounded p-4 text-xs space-y-2 bg-neutral-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-950">{inq.name}</span>
                        <span className="text-[11px] text-neutral-400">
                          {new Date(inq.createdAt || inq.receivedAt || Date.now()).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-neutral-500">
                        Email:{' '}
                        <a
                          href={`mailto:${inq.email}`}
                          className="text-neutral-900 underline underline-offset-2"
                        >
                          {inq.email}
                        </a>
                      </p>
                      {inq.subject && (
                        <p className="font-medium text-neutral-800">Subject: {inq.subject}</p>
                      )}
                      <p className="text-neutral-700 bg-white p-3 border border-neutral-100 rounded leading-relaxed whitespace-pre-line">
                        {inq.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add/Edit Artwork */}
      {isArtworkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-semibold text-sm text-neutral-950">
                {editingArtwork?.id ? 'Edit Artwork' : 'New Artwork'}
              </h3>
              <button
                onClick={() => setIsArtworkModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-950"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArtwork} className="space-y-4">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingArtwork?.title || ''}
                  onChange={e => setEditingArtwork(a => ({ ...a, title: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={editingArtwork?.year || new Date().getFullYear()}
                    onChange={e =>
                      setEditingArtwork(a => ({ ...a, year: parseInt(e.target.value) || 2024 }))
                    }
                    className="w-full border border-neutral-200 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Category</label>
                  <select
                    value={editingArtwork?.categorySlug || 'painting'}
                    onChange={e => {
                      const slug = e.target.value;
                      const cat = data?.categories.find(c => c.slug === slug);
                      setEditingArtwork(a => ({
                        ...a,
                        categorySlug: slug,
                        categoryName: cat?.name || slug,
                      }));
                    }}
                    className="w-full border border-neutral-200 p-2 rounded"
                  >
                    {(data?.categories || []).map(cat => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Medium</label>
                <input
                  type="text"
                  value={editingArtwork?.medium || ''}
                  onChange={e => setEditingArtwork(a => ({ ...a, medium: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                  placeholder="Oil, raw pigment on linen"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Dimensions</label>
                <input
                  type="text"
                  value={editingArtwork?.dimensions || ''}
                  onChange={e => setEditingArtwork(a => ({ ...a, dimensions: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                  placeholder="195 × 160 cm"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Main Image URL or Upload <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingArtwork?.mainImage || ''}
                    onChange={e => setEditingArtwork(a => ({ ...a, mainImage: e.target.value }))}
                    className="flex-1 border border-neutral-200 p-2 rounded text-xs font-mono"
                    placeholder="https://... অথবা পাশের Upload বাটন চাপুন"
                  />
                  <label className="bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900 px-3.5 py-2 rounded flex items-center gap-1.5 cursor-pointer text-xs font-medium transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingArtImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingArtImage}
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingArtImage(true);
                          const res = await api.uploadFile(file);
                          setEditingArtwork(a => ({ ...a, mainImage: res.url }));
                          showToast('ছবি সফলভাবে আপলোড হয়েছে!', 'success');
                        } catch (err: any) {
                          showToast(err.message || 'ছবি আপলোড ব্যর্থ', 'error');
                        } finally {
                          setUploadingArtImage(false);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Uploading progress indicator */}
                {uploadingArtImage && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3 flex items-center gap-2.5 text-xs text-blue-800">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>ছবি আপলোড ও প্রসেসিং হচ্ছে... অনুগ্রহ করে এক মুহূর্ত অপেক্ষা করুন...</span>
                  </div>
                )}

                {/* Live Image Preview inside modal */}
                {editingArtwork?.mainImage && !uploadingArtImage && (
                  <div className="mt-2.5 p-3 bg-neutral-50 rounded border border-neutral-200">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ছবি প্রিভিউ (Photo Loaded):</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingArtwork(a => ({ ...a, mainImage: '' }))}
                        className="text-[11px] text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                      >
                        ছবি সরান (Remove)
                      </button>
                    </div>
                    <div className="max-w-xs aspect-4/3 bg-neutral-200/60 rounded overflow-hidden shadow-2xs border border-neutral-300">
                      <ArtworkImage
                        src={editingArtwork.mainImage}
                        alt={editingArtwork.title || 'Artwork Preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingArtwork?.description || ''}
                  onChange={e => setEditingArtwork(a => ({ ...a, description: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                />
              </div>

              {/* Video upload and URL section */}
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Artwork Video (ভিডিও আপলোড বা লিংক - ঐচ্ছিক)
                </label>
                <div className="space-y-3 bg-neutral-50 p-3 rounded border border-neutral-200">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editingArtwork?.videoUrl || ''}
                      onChange={e => setEditingArtwork(a => ({ ...a, videoUrl: e.target.value }))}
                      className="flex-1 border border-neutral-200 p-2 rounded bg-white text-xs font-mono"
                      placeholder="https://... Cloudinary video / MP4 / YouTube / Vimeo লিংক"
                    />
                    <label className="bg-neutral-900 text-white hover:bg-neutral-800 px-3 py-2 rounded flex items-center justify-center gap-1.5 cursor-pointer text-xs shrink-0">
                      <Video className="w-3.5 h-3.5" />
                      <span>{uploadingVideo ? `ভিডিও আপলোড হচ্ছে (${videoProgress}%)` : 'ভিডিও ফাইল আপলোড'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        disabled={uploadingVideo}
                        className="hidden"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingVideo(true);
                            setVideoProgress(0);
                            const res = await api.uploadFile(file, p => setVideoProgress(p));
                            setEditingArtwork(a => ({
                              ...a,
                              videoUrl: res.url,
                              mediaType: 'video',
                            }));
                            showToast('ভিডিও সফলভাবে আপলোড হয়েছে!', 'success');
                          } catch (err: any) {
                            showToast(err.message || 'ভিডিও আপলোড ব্যর্থ', 'error');
                          } finally {
                            setUploadingVideo(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {editingArtwork?.videoUrl && (
                    <div className="pt-2 border-t border-neutral-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-neutral-600">ভিডিও প্রিভিউ:</span>
                        <button
                          type="button"
                          onClick={() => setEditingArtwork(a => ({ ...a, videoUrl: '' }))}
                          className="text-[11px] text-red-600 hover:underline cursor-pointer"
                        >
                          ভিডিও সরান
                        </button>
                      </div>
                      <div className="max-w-sm aspect-video bg-black rounded overflow-hidden">
                        <video
                          src={editingArtwork.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsArtworkModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 text-white rounded hover:bg-neutral-800"
                >
                  Save Artwork
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="font-semibold text-sm text-neutral-950">
              {editingCategory?.id ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory?.name || ''}
                  onChange={e => setEditingCategory(c => ({ ...c, name: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                  placeholder="e.g. Sculpture"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCategory?.description || ''}
                  onChange={e => setEditingCategory(c => ({ ...c, description: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 text-white rounded hover:bg-neutral-800"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Exhibition */}
      {isExhibitionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="font-semibold text-sm text-neutral-950">
              {editingExhibition?.id ? 'Edit Exhibition' : 'New Exhibition'}
            </h3>
            <form onSubmit={handleSaveExhibition} className="space-y-4">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Exhibition Title</label>
                <input
                  type="text"
                  required
                  value={editingExhibition?.title || ''}
                  onChange={e => setEditingExhibition(x => ({ ...x, title: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={editingExhibition?.year || new Date().getFullYear()}
                    onChange={e =>
                      setEditingExhibition(x => ({
                        ...x,
                        year: parseInt(e.target.value) || 2024,
                      }))
                    }
                    className="w-full border border-neutral-200 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Type</label>
                  <input
                    type="text"
                    value={editingExhibition?.type || 'Solo'}
                    onChange={e => setEditingExhibition(x => ({ ...x, type: e.target.value }))}
                    className="w-full border border-neutral-200 p-2 rounded"
                    placeholder="Solo, Group, Biennale"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Venue</label>
                <input
                  type="text"
                  required
                  value={editingExhibition?.venue || ''}
                  onChange={e => setEditingExhibition(x => ({ ...x, venue: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={editingExhibition?.location || ''}
                  onChange={e => setEditingExhibition(x => ({ ...x, location: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                  placeholder="Paris, France"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Press Link (URL)</label>
                <input
                  type="text"
                  value={editingExhibition?.link || ''}
                  onChange={e => setEditingExhibition(x => ({ ...x, link: e.target.value }))}
                  className="w-full border border-neutral-200 p-2 rounded"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsExhibitionModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 text-white rounded hover:bg-neutral-800"
                >
                  Save Exhibition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Artwork Upload Modal */}
      <BatchArtworkUploadModal
        isOpen={isBatchUploadModalOpen}
        onClose={() => setIsBatchUploadModalOpen(false)}
        categories={data?.categories || []}
        onSuccess={async () => {
          await refreshData();
        }}
        showToast={showToast}
      />

      {/* Visual Artwork Sequence Reorder Board */}
      <VisualArtworkReorderModal
        isOpen={isVisualReorderModalOpen}
        onClose={() => setIsVisualReorderModalOpen(false)}
        artworks={data?.artworks || []}
        categories={data?.categories || []}
        onSaveOrder={async (orderedIds: string[]) => {
          await api.reorderArtworks(orderedIds);
          await refreshData();
        }}
        showToast={showToast}
      />
    </div>
  );
};

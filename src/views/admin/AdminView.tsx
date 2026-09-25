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
} from 'lucide-react';
import { Artwork, Category, Exhibition } from '../../types';
import { CoverPhotoManager } from '../../components/admin/CoverPhotoManager';
import { AdminSecurityManager } from '../../components/admin/AdminSecurityManager';

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
  const [uploadingArtImage, setUploadingArtImage] = useState(false);

  // Category state
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-base font-semibold text-neutral-950">Artworks</h2>
                  <p className="text-xs text-neutral-400">
                    Manage cataloged paintings, drawings, sculptures, and digital works
                  </p>
                </div>
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
                  <span>Add Artwork</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data?.artworks || []).map(artwork => (
                  <div
                    key={artwork.id}
                    className="border border-neutral-200 rounded p-3 flex flex-col justify-between hover:border-neutral-400 transition-colors"
                  >
                    <div>
                      <div className="aspect-4/3 bg-neutral-100 mb-3 overflow-hidden rounded">
                        <img
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

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-100">
                      <button
                        onClick={() => {
                          setEditingArtwork(artwork);
                          setIsArtworkModalOpen(true);
                        }}
                        className="p-1 text-neutral-500 hover:text-neutral-900"
                        title="Edit artwork"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArtwork(artwork.id)}
                        className="p-1 text-neutral-500 hover:text-red-600"
                        title="Delete artwork"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CATEGORIES TAB */}
          {currentTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-base font-semibold text-neutral-950">Categories</h2>
                  <p className="text-xs text-neutral-400">Manage artistic mediums and sections</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory({ order: (data?.categories.length || 0) + 1 });
                    setIsCategoryModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="space-y-3">
                {(data?.categories || []).map(cat => (
                  <div
                    key={cat.id}
                    className="border border-neutral-200 rounded p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-xs text-neutral-950 uppercase tracking-wider">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400">Slug: /{cat.slug}</p>
                      {cat.description && (
                        <p className="text-xs text-neutral-600 mt-1 max-w-lg">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. EXHIBITIONS TAB */}
          {currentTab === 'exhibitions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-base font-semibold text-neutral-950">Exhibitions</h2>
                  <p className="text-xs text-neutral-400">
                    Solo and group exhibition history
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingExhibition({
                      year: new Date().getFullYear(),
                      type: 'Solo',
                    });
                    setIsExhibitionModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Exhibition</span>
                </button>
              </div>

              <div className="space-y-3">
                {(data?.exhibitions || []).map(ex => (
                  <div
                    key={ex.id}
                    className="border border-neutral-200 rounded p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-neutral-500">
                          {ex.year}
                        </span>
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {ex.type}
                        </span>
                      </div>
                      <h3 className="font-medium text-xs text-neutral-950 mt-1">{ex.title}</h3>
                      <p className="text-[11px] text-neutral-600">
                        {ex.venue} {ex.location && `• ${ex.location}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingExhibition(ex);
                          setIsExhibitionModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExhibition(ex.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
            <div className="space-y-6 max-w-xl text-xs">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold text-neutral-950">Curriculum Vitae</h2>
                <p className="text-xs text-neutral-400">
                  Upload or replace the downloadable PDF version of the artist CV
                </p>
              </div>

              {data?.cv ? (
                <div className="border border-neutral-200 rounded p-4 flex items-center justify-between bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-neutral-500" />
                    <div>
                      <p className="font-medium text-neutral-900">{data.cv.filename}</p>
                      <p className="text-[11px] text-neutral-400">
                        Updated {new Date(data.cv.updatedAt || data.cv.uploadedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={data.cv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-neutral-200 bg-white rounded hover:bg-neutral-100 transition-colors"
                    >
                      Download
                    </a>
                    <button
                      onClick={handleDeleteCV}
                      className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center">
                  <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-600 font-medium">No CV PDF uploaded</p>
                  <p className="text-neutral-400 text-[11px] mt-1">
                    Upload a PDF file to enable the Download CV button on the site
                  </p>
                </div>
              )}

              <div>
                <label className="block text-neutral-700 font-medium mb-2">
                  Upload New CV (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCVUpload}
                  disabled={uploadingCV}
                  className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-medium file:bg-neutral-950 file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
              </div>
            </div>
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
                    className="flex-1 border border-neutral-200 p-2 rounded"
                    placeholder="https://..."
                  />
                  <label className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-3 py-2 rounded flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingArtImage(true);
                          const res = await api.uploadFile(file);
                          setEditingArtwork(a => ({ ...a, mainImage: res.url }));
                          showToast('Image uploaded', 'success');
                        } catch (err: any) {
                          showToast(err.message || 'Upload failed', 'error');
                        } finally {
                          setUploadingArtImage(false);
                        }
                      }}
                    />
                  </label>
                </div>
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
    </div>
  );
};

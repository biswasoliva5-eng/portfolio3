import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../api/client';
import { AboutContent } from '../../types';
import {
  GraduationCap,
  Trophy,
  Compass,
  Building2,
  Newspaper,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  Upload,
  Download,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

interface CVManagerProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onSaved: () => Promise<void> | void;
}

type CVSectionKey = 'education' | 'awards' | 'residencies' | 'collections' | 'press';

interface SectionConfig {
  key: CVSectionKey;
  label: string;
  labelBn: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  example: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'education',
    label: 'Education',
    labelBn: 'শিক্ষাগত যোগ্যতা',
    icon: GraduationCap,
    placeholder: 'e.g. BFA in Fine Arts, University of Dhaka (2020)',
    example: 'BFA in Painting, Faculty of Fine Art, University of Dhaka (2022)',
  },
  {
    key: 'awards',
    label: 'Awards & Honors',
    labelBn: 'পুরস্কার ও সম্মাননা',
    icon: Trophy,
    placeholder: 'e.g. Best Artist Award, Annual Art Exhibition (2023)',
    example: 'Grand Prize, National Youth Art Biennale (2024)',
  },
  {
    key: 'residencies',
    label: 'Residencies & Workshops',
    labelBn: 'রেসিডেন্সি ও কর্মশালা',
    icon: Compass,
    placeholder: 'e.g. Artist-in-Residence, Britto Arts Trust (2023)',
    example: 'International Artists Residency, Dhaka (2023)',
  },
  {
    key: 'collections',
    label: 'Selected Collections',
    labelBn: 'সংগ্রহশালা (পাবলিক / প্রাইভেট কালেকশন)',
    icon: Building2,
    placeholder: 'e.g. National Art Gallery Collection, Dhaka',
    example: 'Private collection, Dhaka and international collections',
  },
  {
    key: 'press',
    label: 'Press & Publications',
    labelBn: 'পত্রিকা / প্রেস ও প্রকাশনা',
    icon: Newspaper,
    placeholder: 'e.g. Daily Star: "Sculpting Quiet Horizons" (2024)',
    example: 'The Daily Star: "Solo Exhibition Review" (2024)',
  },
];

function toArray(val?: string[] | string): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  return String(val)
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

export const CVManager: React.FC<CVManagerProps> = ({ showToast, onSaved }) => {
  const { data, refreshData } = usePortfolio();
  const about = data?.about;
  const cv = data?.cv;

  // Active section
  const [activeSection, setActiveSection] = useState<CVSectionKey>('education');

  // Lists state
  const [itemsMap, setItemsMap] = useState<Record<CVSectionKey, string[]>>({
    education: [],
    awards: [],
    residencies: [],
    collections: [],
    press: [],
  });

  // Modal / Form state for Add/Edit item
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [itemInputValue, setItemInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PDF upload
  const [uploadingCV, setUploadingCV] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  // Sync from incoming data
  useEffect(() => {
    if (about) {
      setItemsMap({
        education: toArray(about.education),
        awards: toArray(about.awards),
        residencies: toArray(about.residencies),
        collections: toArray(about.collections),
        press: toArray(about.press),
      });
    }
  }, [about]);

  // Save changes to API & Firestore
  const saveSectionChanges = async (newMap: Record<CVSectionKey, string[]>, targetKey: CVSectionKey) => {
    setSavingSection(true);
    try {
      const payload: Partial<AboutContent> = {
        education: newMap.education,
        awards: newMap.awards,
        residencies: newMap.residencies,
        collections: newMap.collections,
        press: newMap.press,
      };
      await api.updateAbout(payload);
      await refreshData();
      await onSaved();
      showToast('CV তথ্য সফলভাবে সেভ হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save CV changes', 'error');
    } finally {
      setSavingSection(false);
    }
  };

  // Add or Edit item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = itemInputValue.trim();
    if (!text) {
      showToast('অনুগ্রহ করে তথ্য লিখুন', 'error');
      return;
    }

    const currentList = [...(itemsMap[activeSection] || [])];
    if (editingItemIdx !== null) {
      currentList[editingItemIdx] = text;
    } else {
      currentList.push(text);
    }

    const updated = {
      ...itemsMap,
      [activeSection]: currentList,
    };
    setItemsMap(updated);
    setIsModalOpen(false);
    setItemInputValue('');
    setEditingItemIdx(null);
    await saveSectionChanges(updated, activeSection);
  };

  // Delete item
  const handleDeleteItem = async (idx: number) => {
    const currentList = [...(itemsMap[activeSection] || [])];
    const itemToDelete = currentList[idx];
    if (!confirm(`আপনি কি এই এন্ট্রিটি মুছে ফেলতে চান?\n"${itemToDelete}"`)) return;

    currentList.splice(idx, 1);
    const updated = {
      ...itemsMap,
      [activeSection]: currentList,
    };
    setItemsMap(updated);
    await saveSectionChanges(updated, activeSection);
    showToast('আইটেম মুছে ফেলা হয়েছে', 'info');
  };

  // Move Up
  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const currentList = [...(itemsMap[activeSection] || [])];
    const temp = currentList[idx];
    currentList[idx] = currentList[idx - 1];
    currentList[idx - 1] = temp;

    const updated = {
      ...itemsMap,
      [activeSection]: currentList,
    };
    setItemsMap(updated);
    await saveSectionChanges(updated, activeSection);
  };

  // Move Down
  const handleMoveDown = async (idx: number) => {
    const currentList = [...(itemsMap[activeSection] || [])];
    if (idx >= currentList.length - 1) return;
    const temp = currentList[idx];
    currentList[idx] = currentList[idx + 1];
    currentList[idx + 1] = temp;

    const updated = {
      ...itemsMap,
      [activeSection]: currentList,
    };
    setItemsMap(updated);
    await saveSectionChanges(updated, activeSection);
  };

  // Clear demo data
  const handleClearDemoData = async () => {
    if (
      !confirm(
        'সতর্কতা: আপনি কি CV এর সব ডেমো তথ্য (Yale, Villa Medici, Pollock-Krasner ইত্যাদি) একসাথে খালি করতে চান? এরপর আপনি নিজের আসল তথ্য যোগ করতে পারবেন।'
      )
    ) {
      return;
    }

    const emptyMap: Record<CVSectionKey, string[]> = {
      education: [],
      awards: [],
      residencies: [],
      collections: [],
      press: [],
    };
    setItemsMap(emptyMap);
    await saveSectionChanges(emptyMap, activeSection);
    showToast('CV এর সকল ডেমো তথ্য মুছে ফেলা হয়েছে। এখন নতুন তথ্য যোগ করুন।', 'success');
  };

  // PDF Upload
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCV(true);
      await api.uploadCV(file);
      await refreshData();
      await onSaved();
      showToast('CV PDF সফলভাবে আপলোড হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload CV', 'error');
    } finally {
      setUploadingCV(false);
    }
  };

  // Delete PDF
  const handleDeleteCV = async () => {
    if (!confirm('আপনি কি বর্তমান CV PDF ফাইলটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteCV();
      await refreshData();
      await onSaved();
      showToast('CV PDF ফাইল সরানো হয়েছে', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove CV', 'error');
    }
  };

  const currentConfig = SECTIONS.find(s => s.key === activeSection) || SECTIONS[0];
  const activeItems = itemsMap[activeSection] || [];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-950">Curriculum Vitae (CV) Manager</h2>
            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
              পূর্ণাঙ্গ এডিট ও ডিলিট
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            আপনার ডিগ্রি, পুরস্কার, রেসিডেন্সি ও কালেকশন সরাসরি এডিট করুন, নতুন যোগ করুন বা মুছুন
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearDemoData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 text-xs rounded transition-colors cursor-pointer shrink-0"
          title="সকল ডেমো তথ্য এক ক্লিকে মুছে নতুন শুরু করুন"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>সকল ডেমো তথ্য মুছুন</span>
        </button>
      </div>

      {/* Section Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-neutral-200 pb-3">
        {SECTIONS.map(sec => {
          const Icon = sec.icon;
          const count = (itemsMap[sec.key] || []).length;
          const isActive = activeSection === sec.key;
          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSection(sec.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded text-xs text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-950 text-white font-medium shadow-xs'
                  : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="truncate min-w-0">
                <div className="truncate">{sec.label}</div>
                <div className={`text-[10px] ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                  {count} {count === 1 ? 'entry' : 'entries'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Section Content */}
      <div className="space-y-4 bg-neutral-50/40 p-5 rounded-lg border border-neutral-200/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
              <span>{currentConfig.label}</span>
              <span className="text-xs text-neutral-400 font-normal">({currentConfig.labelBn})</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              এই সেকশনে মোট {activeItems.length} টি তথ্য যুক্ত আছে। যে কোনোটি এডিট, ডিলিট বা ক্রম পরিবর্তন করতে পারেন।
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingItemIdx(null);
              setItemInputValue('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন যোগ করুন</span>
          </button>
        </div>

        {/* List of items */}
        {activeItems.length === 0 ? (
          <div className="py-12 text-center bg-white rounded border border-dashed border-neutral-200">
            <currentConfig.icon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-600 font-medium">কোনো এন্ট্রি যোগ করা নেই</p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto">
              উদাহরণ: {currentConfig.example}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingItemIdx(null);
                setItemInputValue('');
                setIsModalOpen(true);
              }}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 text-white text-xs rounded hover:bg-neutral-800 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>প্রথমটি যোগ করুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {activeItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral-200/90 rounded p-3 flex items-start justify-between gap-3 hover:border-neutral-300 transition-colors group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <p className="text-xs text-neutral-900 font-normal leading-relaxed break-words">
                    {item}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                    title="উপরে নিন"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={idx === activeItems.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                    title="নিচে নিন"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItemIdx(idx);
                      setItemInputValue(item);
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                    title="এডিট করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(idx)}
                    className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Downloadable PDF CV Section */}
      <div className="pt-6 border-t border-neutral-200 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-600" />
            <span>Downloadable PDF CV (ডাউনলোডযোগ্য সিভি ফাইল)</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            সাইটের CV পেজে ভিজিটরদের ডাউনলোডের জন্য একটি অফিসিয়াল PDF ফাইল আপলোড করে রাখুন
          </p>
        </div>

        {cv && cv.url ? (
          <div className="border border-neutral-200 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-neutral-700 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-xs text-neutral-900 truncate">{cv.filename}</p>
                <p className="text-[11px] text-neutral-400">
                  Updated: {new Date(cv.updatedAt || cv.uploadedAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={cv.url}
                target="_blank"
                rel="noopener noreferrer"
                download={cv.filename}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 bg-white rounded text-xs hover:bg-neutral-100 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>ডাউনলোড দেখুন</span>
              </a>

              <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>{uploadingCV ? 'আপলোড হচ্ছে...' : 'নতুন PDF বদলান'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={uploadingCV}
                  onChange={handleCVUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleDeleteCV}
                className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                title="PDF মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center bg-white">
            <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs text-neutral-700 font-medium">কোনো CV PDF আপলোড করা নেই</p>
            <p className="text-[11px] text-neutral-400 mt-0.5 mb-3">
              আপনার তৈরি করা সিভি PDF ফাইল আপলোড করলে সাইটের সিভি পেজে ডাউনলোড বাটন সক্রিয় হবে
            </p>

            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 text-white rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingCV ? 'আপলোড হচ্ছে...' : 'PDF ফাইল নির্বাচন করুন'}</span>
              <input
                type="file"
                accept="application/pdf"
                disabled={uploadingCV}
                onChange={handleCVUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-semibold text-sm text-neutral-950">
                {editingItemIdx !== null ? 'এন্ট্রি এডিট করুন' : 'নতুন এন্ট্রি যোগ করুন'} ({currentConfig.label})
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1.5">
                  বিবরণ / তথ্য লিখুন <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={itemInputValue}
                  onChange={e => setItemInputValue(e.target.value)}
                  placeholder={currentConfig.placeholder}
                  className="w-full border border-neutral-300 p-2.5 rounded focus:outline-hidden focus:border-neutral-900 leading-relaxed font-sans"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  উদাহরণ: {currentConfig.example}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingSection}
                  className="px-4 py-1.5 bg-neutral-950 text-white rounded hover:bg-neutral-800 disabled:opacity-50 cursor-pointer font-medium"
                >
                  {savingSection ? 'সেভ হচ্ছে...' : editingItemIdx !== null ? 'পরিবর্তন সেভ করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

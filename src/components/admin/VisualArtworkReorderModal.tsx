import React, { useState, useEffect } from 'react';
import {
  X,
  GripVertical,
  ChevronsUp,
  ChevronsDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Filter,
  Layers,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { Artwork, Category } from '../../types';
import { ArtworkImage } from '../common/ArtworkImage';

interface VisualArtworkReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  categories: Category[];
  onSaveOrder: (orderedIds: string[]) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VisualArtworkReorderModal: React.FC<VisualArtworkReorderModalProps> = ({
  isOpen,
  onClose,
  artworks,
  categories,
  onSaveOrder,
  showToast,
}) => {
  const [items, setItems] = useState<Artwork[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Initialize and keep in sync with artworks sorted by order
  useEffect(() => {
    if (artworks) {
      const sorted = [...artworks].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      setItems(sorted);
    }
  }, [artworks, isOpen]);

  if (!isOpen) return null;

  // Filtered view vs full master list
  const filteredItems = selectedCategoryFilter === 'all'
    ? items
    : items.filter(a => a.categorySlug === selectedCategoryFilter);

  const saveCurrentOrder = async (newList: Artwork[]) => {
    try {
      setIsSaving(true);
      const orderedIds = newList.map(a => a.id);
      await onSaveOrder(orderedIds);
      setLastSavedTime(new Date().toLocaleTimeString());
      showToast('আর্টওয়ার্কের নতুন ক্রম সেভ হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'ক্রম সেভ করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, indexInFiltered: number) => {
    setDraggedIndex(indexInFiltered);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(indexInFiltered));
  };

  const handleDragOver = (e: React.DragEvent, indexInFiltered: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== indexInFiltered) {
      setDragOverIndex(indexInFiltered);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndexInFiltered: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndexInFiltered) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (selectedCategoryFilter === 'all') {
      const updated = [...items];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndexInFiltered, 0, movedItem);
      // update order attributes
      updated.forEach((a, idx) => {
        a.order = idx + 1;
      });
      setItems(updated);
      setDraggedIndex(null);
      setDragOverIndex(null);
      await saveCurrentOrder(updated);
    } else {
      // Reordering within a specific category
      const targetItem = filteredItems[targetIndexInFiltered];
      const sourceItem = filteredItems[draggedIndex];
      if (!targetItem || !sourceItem) return;

      const masterSourceIdx = items.findIndex(a => a.id === sourceItem.id);
      const masterTargetIdx = items.findIndex(a => a.id === targetItem.id);

      const updated = [...items];
      const [movedItem] = updated.splice(masterSourceIdx, 1);
      updated.splice(masterTargetIdx, 0, movedItem);
      updated.forEach((a, idx) => {
        a.order = idx + 1;
      });
      setItems(updated);
      setDraggedIndex(null);
      setDragOverIndex(null);
      await saveCurrentOrder(updated);
    }
  };

  // Quick 1-click moves
  const handleQuickMove = async (artId: string, action: 'top' | 'bottom' | 'prev' | 'next') => {
    const masterIdx = items.findIndex(a => a.id === artId);
    if (masterIdx === -1) return;

    const updated = [...items];
    const [item] = updated.splice(masterIdx, 1);

    if (action === 'top') {
      updated.unshift(item);
    } else if (action === 'bottom') {
      updated.push(item);
    } else if (action === 'prev') {
      const newPos = Math.max(0, masterIdx - 1);
      updated.splice(newPos, 0, item);
    } else if (action === 'next') {
      const newPos = Math.min(updated.length, masterIdx + 1);
      updated.splice(newPos, 0, item);
    }

    updated.forEach((a, idx) => {
      a.order = idx + 1;
    });

    setItems(updated);
    await saveCurrentOrder(updated);
  };

  const handleExactJump = async (artId: string, newPosition: number) => {
    const masterIdx = items.findIndex(a => a.id === artId);
    if (masterIdx === -1) return;

    const updated = [...items];
    const [item] = updated.splice(masterIdx, 1);
    const clamped = Math.max(0, Math.min(newPosition - 1, updated.length));
    updated.splice(clamped, 0, item);

    updated.forEach((a, idx) => {
      a.order = idx + 1;
    });

    setItems(updated);
    await saveCurrentOrder(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden text-neutral-900 border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                ফ্লেক্সিবল ভিজুয়াল ক্রম সাজান (Visual Artwork Reorder Board)
              </h2>
              <p className="text-[11px] text-neutral-300">
                যেকোনো আর্টওয়ার্ক মাউস দিয়ে টেনে (Drag & Drop) পছন্দের স্থানে বসিয়ে দিন অথবা ১-ক্লিক বাটন চাপুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastSavedTime && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-white/10 px-2.5 py-1 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>সেভ হয়েছে: {lastSavedTime}</span>
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Instruction Bar */}
        <div className="px-6 py-3 bg-neutral-100/90 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-neutral-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>ফিল্টার:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              সকল কাজ ({items.length})
            </button>
            {categories.map(c => {
              const count = items.filter(a => a.categorySlug === c.slug).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(c.slug)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategoryFilter === c.slug
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-neutral-600 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>টিপস:</strong> কার্ডের উপর মাউস ধরে টেনে যেকোনো ঘরে ড্রপ করলে পজিশন সাথে সাথে পরিবর্তন ও সেভ হবে।
            </span>
          </div>
        </div>

        {/* Visual Reorder Grid */}
        <div className="p-6 flex-1 overflow-y-auto bg-neutral-50/50">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 text-xs">
              এই ক্যাটাগরিতে কোনো আর্টওয়ার্ক নেই।
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredItems.map((art, idx) => {
                const masterIdx = items.findIndex(a => a.id === art.id);
                const isBeingDragged = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

                return (
                  <div
                    key={art.id}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDrop={e => handleDrop(e, idx)}
                    className={`group bg-white rounded-lg border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-2xs cursor-grab active:cursor-grabbing select-none relative ${
                      isBeingDragged
                        ? 'opacity-30 border-blue-500 scale-95'
                        : isDragOver
                        ? 'border-blue-600 ring-2 ring-blue-400 scale-102 bg-blue-50/20'
                        : 'border-neutral-200 hover:border-neutral-400 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Bar with Position Badge & Drag Handle */}
                      <div className="px-2.5 py-1.5 bg-neutral-100/90 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-800" />
                          <span className="font-mono text-xs font-bold text-neutral-900 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                            #{masterIdx + 1}
                          </span>
                        </div>

                        {/* Numeric Jump input */}
                        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="number"
                            min={1}
                            max={items.length}
                            defaultValue={masterIdx + 1}
                            key={`${art.id}-${masterIdx}`}
                            onBlur={e => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val > 0 && val !== masterIdx + 1) {
                                handleExactJump(art.id, val);
                              }
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = parseInt((e.target as HTMLInputElement).value, 10);
                                if (!isNaN(val) && val > 0 && val !== masterIdx + 1) {
                                  handleExactJump(art.id, val);
                                }
                              }
                            }}
                            className="w-10 px-1 py-0.5 text-center text-[10px] font-mono border border-neutral-300 rounded bg-white focus:outline-hidden focus:border-neutral-900"
                            title="পজিশন নম্বর লিখে Enter চাপুন"
                          />
                        </div>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="aspect-square bg-neutral-100 overflow-hidden relative">
                        <ArtworkImage
                          src={art.mainImage}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded font-mono">
                          {art.year}
                        </div>
                      </div>

                      {/* Title & Category */}
                      <div className="p-2 space-y-0.5">
                        <h4 className="font-medium text-xs text-neutral-900 truncate" title={art.title}>
                          {art.title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider truncate">
                          {art.categoryName || art.categorySlug}
                        </p>
                      </div>
                    </div>

                    {/* Quick Move Action Buttons */}
                    <div
                      className="px-2 py-1.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={masterIdx === 0 || isSaving}
                        onClick={() => handleQuickMove(art.id, 'top')}
                        className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 rounded disabled:opacity-20 transition-colors cursor-pointer text-[10px] font-medium flex items-center gap-0.5"
                        title="সবার শুরুতে (#১) আনুন"
                      >
                        <ChevronsUp className="w-3.5 h-3.5" />
                        <span className="hidden group-hover:inline">#১</span>
                      </button>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={masterIdx === 0 || isSaving}
                          onClick={() => handleQuickMove(art.id, 'prev')}
                          className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 rounded disabled:opacity-20 cursor-pointer"
                          title="এক ধাপ আগে"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={masterIdx === items.length - 1 || isSaving}
                          onClick={() => handleQuickMove(art.id, 'next')}
                          className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 rounded disabled:opacity-20 cursor-pointer"
                          title="এক ধাপ পরে"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={masterIdx === items.length - 1 || isSaving}
                        onClick={() => handleQuickMove(art.id, 'bottom')}
                        className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 rounded disabled:opacity-20 transition-colors cursor-pointer text-[10px] font-medium flex items-center gap-0.5"
                        title="সবার শেষে পাঠান"
                      >
                        <span className="hidden group-hover:inline">শেষ</span>
                        <ChevronsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-500">
            {isSaving ? (
              <span className="text-blue-600 font-medium">ক্রম সংরক্ষণ করা হচ্ছে...</span>
            ) : (
              <span>মোট {items.length}টি আর্টওয়ার্ক গ্যালারিতে নির্ধারিত ক্রমে প্রদর্শিত হবে</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
            >
              সম্পন্ন (Done)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

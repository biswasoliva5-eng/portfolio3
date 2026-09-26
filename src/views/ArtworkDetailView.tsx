import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lightbox } from '../components/Lightbox';
import { ArrowLeft, Maximize2, ChevronLeft, ChevronRight, Video, Image as ImageIcon, Play } from 'lucide-react';
import { Artwork } from '../types';
import { ArtworkImage } from '../components/common/ArtworkImage';

interface ArtworkDetailViewProps {
  slug: string;
}

function getEmbedVideoUrl(url?: string): { isEmbed: boolean; embedUrl?: string } {
  if (!url) return { isEmbed: false };
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { isEmbed: true, embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` };
  }
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return { isEmbed: true, embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  return { isEmbed: false };
}

export const ArtworkDetailView: React.FC<ArtworkDetailViewProps> = ({ slug }) => {
  const { data, navigate, formatUrl } = usePortfolio();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>('image');

  const artworks = data?.artworks || [];
  const currentIndex = artworks.findIndex(a => a.slug === slug);
  const artwork = artworks[currentIndex] || null;

  const prevArtwork = currentIndex > 0 ? artworks[currentIndex - 1] : null;
  const nextArtwork = currentIndex < artworks.length - 1 ? artworks[currentIndex + 1] : null;

  const images = useMemo(() => {
    if (!artwork) return [];
    if (artwork.images && artwork.images.length > 0) {
      return artwork.images;
    }
    return [{ id: 'main', url: artwork.mainImage, alt: artwork.title, isPrimary: true }];
  }, [artwork]);

  if (!artwork) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-neutral-500 mb-4">Artwork not found.</p>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
        >
          Return to gallery
        </button>
      </div>
    );
  }

  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div id="artwork-detail-view" className="w-full max-w-6xl pb-24">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-8 text-xs text-neutral-600">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 hover:text-neutral-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Works</span>
        </button>

        <div className="flex items-center gap-4">
          {prevArtwork && (
            <button
              onClick={() => {
                setSelectedImageIndex(0);
                navigate(`/artwork/${prevArtwork.slug}`);
              }}
              className="inline-flex items-center gap-1 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}
          {nextArtwork && (
            <button
              onClick={() => {
                setSelectedImageIndex(0);
                navigate(`/artwork/${nextArtwork.slug}`);
              }}
              className="inline-flex items-center gap-1 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left: Artwork Image / Video Presentation */}
        <div className="lg:col-span-8 space-y-4">
          {/* Media Switcher Tabs if Video exists */}
          {artwork.videoUrl && (
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveMediaTab('image')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                  activeMediaTab === 'image'
                    ? 'bg-neutral-950 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos ({images.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('video')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                  activeMediaTab === 'video'
                    ? 'bg-neutral-950 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span>Video Documentation</span>
              </button>
            </div>
          )}

          {/* Video Player */}
          {artwork.videoUrl && activeMediaTab === 'video' ? (
            <div className="space-y-3">
              <div className="relative aspect-video bg-black rounded overflow-hidden shadow-xs">
                {(() => {
                  const { isEmbed, embedUrl } = getEmbedVideoUrl(artwork.videoUrl);
                  if (isEmbed && embedUrl) {
                    return (
                      <iframe
                        src={embedUrl}
                        title={artwork.videoTitle || artwork.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    );
                  }
                  return (
                    <video
                      src={artwork.videoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  );
                })()}
              </div>
              {artwork.videoTitle && (
                <p className="text-xs text-neutral-500 font-light italic">
                  {artwork.videoTitle}
                </p>
              )}
            </div>
          ) : (
            /* Image Presentation */
            <>
              <div
                className="relative bg-neutral-50 overflow-hidden cursor-zoom-in group"
                onClick={() => setIsLightboxOpen(true)}
              >
                <ArtworkImage
                  src={activeImage?.url || artwork.mainImage}
                  alt={activeImage?.alt || artwork.title}
                  className="w-full h-auto max-h-[78vh] object-contain mx-auto"
                />
                <button
                  type="button"
                  className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-xs p-2 text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-neutral-950 shadow-xs"
                  title="Expand full screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnails if multiple images */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setActiveMediaTab('image');
                      }}
                      className={`w-16 h-16 shrink-0 border overflow-hidden transition-all cursor-pointer ${
                        selectedImageIndex === idx && activeMediaTab === 'image'
                          ? 'border-neutral-950 opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {artwork.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('video')}
                      className={`w-16 h-16 shrink-0 border overflow-hidden transition-all cursor-pointer bg-neutral-900 text-white flex flex-col items-center justify-center gap-1 ${
                        activeMediaTab === 'video'
                          ? 'border-neutral-950 opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title="Watch video"
                    >
                      <Play className="w-4 h-4 text-white" />
                      <span className="text-[9px] uppercase tracking-wider font-mono">Video</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Artwork Metadata & Inquiries */}
        <div className="lg:col-span-4 space-y-8 font-sans">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-normal text-neutral-950 tracking-tight leading-tight">
              {artwork.title}
            </h1>
            <p className="text-sm text-neutral-400 font-light">
              {artwork.year}
              {artwork.categoryName && ` • ${artwork.categoryName}`}
            </p>
          </div>

          <div className="space-y-2 text-xs text-neutral-600 border-t border-b border-neutral-100 py-6">
            {artwork.medium && (
              <div>
                <span className="text-neutral-400 block mb-0.5">Medium</span>
                <span className="text-neutral-900 font-medium">{artwork.medium}</span>
              </div>
            )}
            {artwork.dimensions && (
              <div className="pt-2">
                <span className="text-neutral-400 block mb-0.5">Dimensions</span>
                <span className="text-neutral-900 font-medium">{artwork.dimensions}</span>
              </div>
            )}
          </div>

          {artwork.description && (
            <div className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
              <p className="whitespace-pre-line">{artwork.description}</p>
            </div>
          )}

          {artwork.notes && (
            <div className="text-xs text-neutral-500 italic bg-neutral-50 p-4 border-l-2 border-neutral-300">
              {artwork.notes}
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="w-full border border-neutral-950 py-3 text-xs uppercase tracking-widest text-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors cursor-pointer"
            >
              Inquire About This Work
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={isLightboxOpen}
        artwork={artwork}
        imageIndex={selectedImageIndex}
        onClose={() => setIsLightboxOpen(false)}
        onPrev={() =>
          setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
        }
        onNext={() =>
          setSelectedImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
        }
        onSelectImageIndex={setSelectedImageIndex}
      />
    </div>
  );
};

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Artwork } from '../types';
import { Video, Layers } from 'lucide-react';
import { ArtworkImage } from '../components/common/ArtworkImage';

export const HomeView: React.FC = () => {
  const { data, selectedYear, selectedCategory, navigate, formatUrl } = usePortfolio();
  const [visibleCount, setVisibleCount] = useState<number>(18);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const artworks = useMemo(() => {
    let list = data?.artworks || [];

    // Filter out any default dummy artworks just in case
    list = list.filter(a => !/^(art-p[1-3]|art-d[1-2]|art-s[1-2]|art-dw[1-2]|art-exp[1-2])$/.test(a.id));

    if (selectedYear) {
      list = list.filter(a => String(a.year) === selectedYear);
    }

    if (selectedCategory) {
      list = list.filter(a => a.categorySlug === selectedCategory);
    }

    // Always sort strictly by custom order rank, then newest first
    return [...list].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 999999;
      const orderB = typeof b.order === 'number' ? b.order : 999999;
      if (orderA !== orderB) return orderA - orderB;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [data?.artworks, selectedYear, selectedCategory]);

  // Reset visibleCount whenever the user filters by year or category
  useEffect(() => {
    setVisibleCount(18);
  }, [selectedYear, selectedCategory]);

  // Infinite scroll / progressive loader for lightning-fast mobile performance
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= artworks.length) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 12, artworks.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [artworks.length, visibleCount]);

  const visibleArtworks = artworks.slice(0, visibleCount);

  return (
    <div id="home-view" className="w-full">
      {/* Active filter badge if any */}
      {(selectedYear || selectedCategory) && (
        <div className="mb-6 flex items-center gap-2 text-xs text-neutral-500">
          <span>Filter:</span>
          {selectedYear && (
            <span className="font-medium text-neutral-900 bg-neutral-100 px-2 py-0.5">
              {selectedYear}
            </span>
          )}
          {selectedCategory && (
            <span className="font-medium text-neutral-900 bg-neutral-100 px-2 py-0.5 uppercase tracking-wider">
              {selectedCategory}
            </span>
          )}
        </div>
      )}

      {artworks.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 font-light text-sm">
          No works found for the selected filter.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {visibleArtworks.map((artwork: Artwork) => (
              <article
                key={artwork.id}
                className="group cursor-pointer flex flex-col"
                onClick={() => navigate(`/artwork/${artwork.slug}`)}
              >
                <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 mb-3">
                  <ArtworkImage
                    src={artwork.mainImage}
                    alt={artwork.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-102"
                  />
                  {artwork.videoUrl && (
                    <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono tracking-wider">
                      <Video className="w-3 h-3 text-red-400" />
                      <span>Video</span>
                    </span>
                  )}
                  {artwork.images && artwork.images.length > 1 && (
                    <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono tracking-wider">
                      <Layers className="w-3 h-3 text-neutral-300" />
                      <span>{artwork.images.length} Photos</span>
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 text-xs text-neutral-600">
                  <h3 className="font-normal text-neutral-950 text-sm tracking-tight group-hover:text-neutral-600 transition-colors">
                    <a
                      href={formatUrl(`/artwork/${artwork.slug}`)}
                      onClick={e => {
                        e.preventDefault();
                        navigate(`/artwork/${artwork.slug}`);
                      }}
                    >
                      {artwork.title}
                    </a>
                    {artwork.year && (
                      <span className="text-neutral-400 ml-1.5 font-light">({artwork.year})</span>
                    )}
                  </h3>

                  {artwork.medium && (
                    <p className="line-clamp-1 text-neutral-500">{artwork.medium}</p>
                  )}
                  {artwork.dimensions && (
                    <p className="text-[11px] text-neutral-400">{artwork.dimensions}</p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Progressive scroll loader & Sentinel for smooth mobile rendering */}
          {visibleCount < artworks.length && (
            <div ref={sentinelRef} className="py-12 flex flex-col items-center justify-center gap-3">
              <span className="text-xs text-neutral-400 font-mono tracking-wider">
                Showing {visibleCount} of {artworks.length} works
              </span>
              <button
                type="button"
                onClick={() => setVisibleCount(prev => Math.min(prev + 12, artworks.length))}
                className="px-5 py-2 text-xs border border-neutral-300 text-neutral-800 hover:border-neutral-900 transition-colors tracking-widest font-mono uppercase bg-white cursor-pointer"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

import React, { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Artwork } from '../types';
import { Video } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { data, selectedYear, selectedCategory, navigate, formatUrl } = usePortfolio();

  const artworks = useMemo(() => {
    let list = data?.artworks || [];

    if (selectedYear) {
      list = list.filter(a => String(a.year) === selectedYear);
    }

    if (selectedCategory) {
      list = list.filter(a => a.categorySlug === selectedCategory);
    }

    // Always sort by custom order rank
    return [...list].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }, [data?.artworks, selectedYear, selectedCategory]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {artworks.map((artwork: Artwork) => (
            <article
              key={artwork.id}
              className="group cursor-pointer flex flex-col"
              onClick={() => navigate(`/artwork/${artwork.slug}`)}
            >
              <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 mb-3">
                <img
                  src={artwork.mainImage}
                  alt={artwork.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-102"
                />
                {artwork.videoUrl && (
                  <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono tracking-wider">
                    <Video className="w-3 h-3 text-red-400" />
                    <span>Video</span>
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
      )}
    </div>
  );
};

import React, { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Artwork } from '../types';
import { Video, Layers } from 'lucide-react';
import { ArtworkImage } from '../components/common/ArtworkImage';

interface GalleryViewProps {
  categorySlug: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ categorySlug }) => {
  const { data, navigate, formatUrl } = usePortfolio();

  const category = useMemo(() => {
    const target = (categorySlug || '').toLowerCase();
    return data?.categories.find(c => (c.slug || '').toLowerCase() === target || (c.name || '').toLowerCase() === target);
  }, [data?.categories, categorySlug]);

  const artworks = useMemo(() => {
    const target = (categorySlug || '').toLowerCase();
    return (data?.artworks || [])
      .filter(a => {
        const catSlug = (a.categorySlug || '').toLowerCase();
        const catName = (a.categoryName || '').toLowerCase();
        return catSlug === target || catName === target || (target === 'sculpture' && (catSlug.includes('sculpture') || catName.includes('sculpture')));
      })
      .sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999999;
        const orderB = typeof b.order === 'number' ? b.order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [data?.artworks, categorySlug]);

  return (
    <div id="gallery-view" className="w-full">
      {/* Category header */}
      <div className="mb-10 pb-4 border-b border-neutral-100">
        <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 uppercase tracking-wider">
          {category?.name || categorySlug}
        </h1>
        {category?.description && (
          <p className="text-xs text-neutral-500 font-light mt-2 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {artworks.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 font-light text-sm">
          No works currently cataloged in this collection.
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
                <ArtworkImage
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
      )}
    </div>
  );
};

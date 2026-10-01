import React, { useState, useEffect } from 'react';
import { getAppBasePath } from '../../context/PortfolioContext';
import { getFromIndexedDB } from '../../utils/cloudUploader';

interface ArtworkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackText?: string;
}

export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Handle local /uploads/ path with Vite base path (e.g. /portfolio3/uploads/...)
  const basePath = getAppBasePath();
  if (trimmed.startsWith('/uploads/')) {
    return `${basePath}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${basePath}/${trimmed}`;
  }
  return trimmed;
}

export const ArtworkImage: React.FC<ArtworkImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    setHasError(false);
    setIsLoading(true);

    if (!src || src.trim() === '') {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const trimmed = src.trim();

    // Check if stored in IndexedDB (idb://...)
    if (trimmed.startsWith('idb://')) {
      const key = trimmed.replace('idb://', '');
      getFromIndexedDB(key).then(dataUrl => {
        if (!isCancelled) {
          if (dataUrl) {
            setResolvedSrc(dataUrl);
          } else {
            setHasError(true);
          }
          setIsLoading(false);
        }
      });
      return;
    }

    setResolvedSrc(resolveMediaUrl(trimmed));
    setIsLoading(false);

    return () => {
      isCancelled = true;
    };
  }, [src]);

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center select-none shadow-inner ${className}`}
        style={{ minHeight: '260px' }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex flex-col items-center max-w-[90%]">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-amber-300 flex items-center justify-center text-sm font-serif font-bold mb-3 border border-white/20 shadow-sm">
            {alt ? alt.charAt(0).toUpperCase() : 'O'}
          </div>
          <span className="text-xs font-serif tracking-wider text-neutral-200 uppercase font-medium line-clamp-2 max-w-[95%] mb-1">
            {fallbackText || alt || 'Untitled Artwork'}
          </span>
          <span className="text-[10px] tracking-widest text-amber-300/80 uppercase font-mono mt-1">
            OLIVA BISWAS ARCHIVE
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
      onError={() => {
        // If image failed to load, display fallback
        setHasError(true);
      }}
      onLoad={() => {
        setIsLoading(false);
      }}
      {...props}
    />
  );
};

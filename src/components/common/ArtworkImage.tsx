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
        className={`bg-neutral-100 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        style={{ minHeight: '120px' }}
      >
        <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-xs font-serif font-semibold mb-1.5">
          {alt ? alt.charAt(0).toUpperCase() : 'A'}
        </div>
        <span className="text-[11px] text-neutral-600 font-medium line-clamp-1 max-w-[85%]">
          {fallbackText || alt || 'Artwork Image'}
        </span>
        <span className="text-[10px] text-neutral-400 mt-0.5">Contemporary Fine Arts</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
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

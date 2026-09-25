import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Check, X, Crop, Move } from 'lucide-react';

interface CoverCropModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
}

type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '21:9' | 'free';

export const CoverCropModal: React.FC<CoverCropModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
  onApplyCrop,
}) => {
  const [aspect, setAspect] = useState<AspectRatio>('16:9');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      setPanX(0);
      setPanY(0);
      setZoom(1);
      setRotation(0);
    };
    img.onerror = () => {
      // If crossOrigin blocks it, try loading without crossOrigin (for base64/local)
      img.crossOrigin = '';
      img.src = imageUrl;
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile admin
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const getAspectDimensions = () => {
    switch (aspect) {
      case '16:9':
        return { w: 640, h: 360, ratio: 16 / 9 };
      case '4:3':
        return { w: 560, h: 420, ratio: 4 / 3 };
      case '1:1':
        return { w: 420, h: 420, ratio: 1 };
      case '9:16':
        return { w: 270, h: 480, ratio: 9 / 16 };
      case '21:9':
        return { w: 700, h: 300, ratio: 21 / 9 };
      case 'free':
      default:
        return { w: 600, h: 380, ratio: 600 / 380 };
    }
  };

  const { w: frameWidth, h: frameHeight } = getAspectDimensions();

  // Export cropped canvas
  const handleExportCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    // Create high-resolution export canvas matching chosen aspect ratio
    const exportWidth = aspect === '9:16' ? 1080 : aspect === '21:9' ? 2560 : 1920;
    const exportHeight = Math.round(exportWidth / (frameWidth / frameHeight));

    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    // Compute relative scaling between screen frame and export canvas
    const scaleFactor = exportWidth / frameWidth;

    ctx.save();
    // Center point for rotation and pan
    ctx.translate(exportWidth / 2, exportHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(panX * scaleFactor, panY * scaleFactor);

    // Base scale to cover frame
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const frameAspect = frameWidth / frameHeight;

    let baseDrawW = frameWidth * scaleFactor;
    let baseDrawH = frameHeight * scaleFactor;

    if (imgAspect > frameAspect) {
      baseDrawH = frameHeight * scaleFactor;
      baseDrawW = baseDrawH * imgAspect;
    } else {
      baseDrawW = frameWidth * scaleFactor;
      baseDrawH = baseDrawW / imgAspect;
    }

    const drawW = baseDrawW * zoom;
    const drawH = baseDrawH * zoom;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    try {
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);
      onApplyCrop(croppedUrl);
      onClose();
    } catch (e) {
      console.error('Failed to export cropped canvas:', e);
      alert('Could not export cropped image. The original image may have cross-origin restrictions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col overflow-hidden text-xs max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-neutral-800 rounded text-neutral-300">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Cover Photo Crop & Frame Studio</h3>
              <p className="text-[11px] text-neutral-400">
                Crop, pan, scale and rotate your cover photo to frame it perfectly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 bg-black/95 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 select-none min-h-[360px]">
          {/* Framed Crop Area */}
          <div
            ref={containerRef}
            style={{
              width: `${frameWidth}px`,
              height: `${frameHeight}px`,
              maxWidth: '90vw',
              maxHeight: '55vh',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className={`relative overflow-hidden border-2 border-white/80 shadow-2xl rounded-sm ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Rule of thirds grid overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Draggable & Scalable Image */}
            {imageLoaded && imgRef.current && (
              <img
                src={imageUrl}
                alt="Crop subject"
                draggable={false}
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  objectFit: 'cover',
                }}
                className="w-full h-full pointer-events-none transition-transform duration-75 select-none"
              />
            )}

            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-xs">
                Loading photo...
              </div>
            )}

            <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-xs text-[10px] text-white/80 px-2 py-0.5 rounded pointer-events-none flex items-center gap-1">
              <Move className="w-3 h-3" />
              <span>Drag to reposition image</span>
            </div>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-4">
          {/* Aspect Ratio Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-medium text-[11px]">Frame Aspect:</span>
              <div className="flex items-center gap-1 bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60">
                {(['16:9', '4:3', '1:1', '9:16', '21:9', 'free'] as AspectRatio[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setAspect(r);
                      setPanX(0);
                      setPanY(0);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      aspect === r
                        ? 'bg-white text-black shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {r === '16:9'
                      ? '16:9 (Cover)'
                      : r === '21:9'
                      ? '21:9 (Cinema)'
                      : r === '9:16'
                      ? '9:16 (Mobile)'
                      : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Rotate & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation(r => (r - 90) % 360)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
                title="Rotate 90° Right"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanX(0);
                  setPanY(0);
                  setZoom(1);
                  setRotation(0);
                }}
                className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-800 rounded border border-neutral-700"
              >
                Reset Frame
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
            <ZoomOut className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="w-full accent-white h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="text-[11px] text-neutral-300 font-mono w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-neutral-500">
              Original: {naturalDimensions.width} × {naturalDimensions.height} px
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportCrop}
                className="px-5 py-2 bg-white text-black font-semibold rounded text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Cropped Cover</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

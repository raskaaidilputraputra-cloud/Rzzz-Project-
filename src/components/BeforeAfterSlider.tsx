import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns2, SplitSquareVertical, ZoomIn, Maximize2, Minimize2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Sebelum',
  afterLabel = 'Sesudah (HD)',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHoldingBefore, setIsHoldingBefore] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Control bar */}
      <div className="flex items-center justify-between px-1 py-1 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'slider' ? 'side-by-side' : 'slider')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 transition-all font-medium shadow-xs"
          >
            {viewMode === 'slider' ? (
              <>
                <Columns2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Bandingkan Berdampingan</span>
              </>
            ) : (
              <>
                <SplitSquareVertical className="w-3.5 h-3.5 text-sky-500" />
                <span>Penggeser Split Slider</span>
              </>
            )}
          </button>

          <button
            type="button"
            onMouseDown={() => setIsHoldingBefore(true)}
            onMouseUp={() => setIsHoldingBefore(false)}
            onTouchStart={() => setIsHoldingBefore(true)}
            onTouchEnd={() => setIsHoldingBefore(false)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all font-medium border border-sky-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Tahan untuk Lihat Asli</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-sky-600 transition-all shadow-xs"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? 'Kecilkan' : 'Perbesar'}</span>
        </button>
      </div>

      {/* Main Display Container */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-200/80 shadow-inner select-none transition-all duration-200 ${
          isFullscreen
            ? 'fixed inset-4 z-50 rounded-2xl max-h-[calc(100vh-2rem)] flex items-center justify-center bg-black/90 backdrop-blur-md'
            : 'w-full min-h-[320px] max-h-[580px] sm:min-h-[420px]'
        }`}
      >
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-60 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}

        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full min-h-[380px] gap-2 p-2">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="max-h-[500px] w-auto h-auto object-contain"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/10">
                {beforeLabel}
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={afterImage}
                alt={afterLabel}
                className="max-h-[500px] w-auto h-auto object-contain"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-sky-500/90 backdrop-blur-md text-white text-xs font-bold tracking-wide shadow-md">
                {afterLabel}
              </span>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full h-full min-h-[360px] max-h-[560px] flex items-center justify-center cursor-ew-resize overflow-hidden"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleMove(e.touches[0].clientX);
            }}
          >
            {/* If holding before, show original completely */}
            {isHoldingBefore ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={beforeImage}
                  alt={beforeLabel}
                  className="max-h-[540px] max-w-full w-auto h-auto object-contain pointer-events-none"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                  Tampilan Asli (Tahan)
                </span>
              </div>
            ) : (
              <>
                {/* Background Layer: Enhanced Image (After) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={afterImage}
                    alt={afterLabel}
                    className="max-h-[540px] max-w-full w-auto h-auto object-contain pointer-events-none"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold tracking-wide shadow-lg z-10">
                    {afterLabel}
                  </span>
                </div>

                {/* Foreground Layer: Clipped Original Image (Before) */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={beforeImage}
                    alt={beforeLabel}
                    className="max-h-[540px] max-w-full w-auto h-auto object-contain pointer-events-none"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/10 z-10">
                    {beforeLabel}
                  </span>
                </div>

                {/* Divider Line and Handle */}
                <div
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] mx-auto relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-sky-600 shadow-xl flex items-center justify-center border-2 border-sky-400">
                      <div className="flex gap-1 items-center">
                        <span className="w-1 h-3 rounded-full bg-sky-400" />
                        <span className="w-1 h-3 rounded-full bg-sky-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400 sm:hidden">
        Geser garis tengah untuk membandingkan perbedaan ketajaman foto
      </p>
    </div>
  );
};

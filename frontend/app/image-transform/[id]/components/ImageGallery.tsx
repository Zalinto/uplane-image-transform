"use client";

import { useEffect, useState } from "react";
import { getAllImages, ImageItem } from "@/app/lib/api";

const ComparisonSlider = ({ original, processed, alt }: { original: string; processed: string; alt: string }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black/20">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <img
          src={processed}
          alt={alt}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
      
      <div 
        className="absolute inset-0 flex items-center justify-center p-4 bg-black/20"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={original}
          alt={`Original ${alt}`}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      <div 
        className="absolute inset-y-0 w-0.5 bg-white/50 backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-violet-500">
          <div className="flex gap-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        onMouseDown={() => setIsResizing(true)}
        onMouseUp={() => setIsResizing(false)}
        onTouchStart={() => setIsResizing(true)}
        onTouchEnd={() => setIsResizing(false)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0 appearance-none"
      />

      <div className={`absolute top-4 left-4 pointer-events-none transition-opacity duration-300 ${sliderPosition < 15 ? 'opacity-0' : 'opacity-100'} z-10`}>
        <span className="bg-black/60 text-white/90 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded backdrop-blur-md border border-white/10 shadow-sm">
          Before
        </span>
      </div>
      <div className={`absolute top-4 right-4 pointer-events-none transition-opacity duration-300 ${sliderPosition > 85 ? 'opacity-0' : 'opacity-100'} z-10`}>
        <span className="bg-violet-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded backdrop-blur-md shadow-sm">
          After
        </span>
      </div>
    </div>
  );
};

export default function ImageGallery() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await getAllImages();
      const sortedImages = response.images.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setImages(sortedImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-white/50 text-sm">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchImages}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl -mx-6 px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          History
          <span className="text-xs font-normal text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
            {images.length}
          </span>
        </h2>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-3xl">
            🖼️
          </div>
          <h3 className="text-white font-medium mb-1">No images yet</h3>
          <p className="text-white/40 text-sm">Upload an image to see it here</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-violet-500/50 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] bg-black/20 overflow-hidden">
                <ComparisonSlider 
                  original={image.originalUrl || image.url} 
                  processed={image.url} 
                  alt={`Image ${image.id.split('/').pop()}`} 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                  <div className="flex items-center justify-end gap-2 pointer-events-auto">
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm shadow-lg border border-white/10"
                      title="Open full size"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                {new Date().getTime() - new Date(image.createdAt).getTime() < 5 * 60 * 1000 && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg pointer-events-none z-30">
                    New
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/5 border-t border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-white/40 font-mono truncate mb-1" title={image.id}>
                      {image.id.split('/').pop()}
                    </p>
                    <p className="text-xs text-white/60">
                      {formatDate(image.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

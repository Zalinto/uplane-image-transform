"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllImages, deleteImage, ImageItem } from "@/app/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ComparisonSlider = ({
  original,
  processed,
  alt,
}: {
  original: string;
  processed: string;
  alt: string;
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-zinc-950/50 group/slider">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={processed}
          alt={alt}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center bg-zinc-950/50"
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
        className="absolute inset-y-0 w-0.5 bg-white/30 backdrop-blur-sm z-20 pointer-events-none group-hover/slider:bg-violet-400/50 transition-colors duration-300"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`w-8 h-8 rounded-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-center text-violet-600 transition-transform duration-200 ${
              isResizing ? "scale-110" : "scale-100"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
            </svg>
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0 appearance-none outline-none"
      />

      <div
        className={`absolute top-4 left-4 pointer-events-none transition-all duration-500 ${
          sliderPosition < 10 ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
        } z-20`}
      >
        <span className="bg-black/60 text-white/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
          Before
        </span>
      </div>
      <div
        className={`absolute top-4 right-4 pointer-events-none transition-all duration-500 ${
          sliderPosition > 90 ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
        } z-20`}
      >
        <span className="bg-violet-500/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/10 shadow-violet-500/20">
          After
        </span>
      </div>
    </div>
  );
};

export default function ImageGallery() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const response = await getAllImages();
      return response.images.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    refetchInterval: 10000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      setDeletingId(null);
      setImageToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: () => {
      setDeletingId(null);
      setImageToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setImageToDelete(id);
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      setDeletingId(imageToDelete);
      deleteMutation.mutate(imageToDelete);
    }
  };

  const images = data ?? [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium animate-pulse">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-400 mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-400/80 text-sm mb-4">
            {error instanceof Error ? error.message : "Failed to load images"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-24">
        <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 -mx-6 px-6 py-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-xl border border-violet-500/10">
              <svg
                className="w-5 h-5 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Gallery</h2>
              <p className="text-xs text-slate-400 font-medium">
                {images.length} {images.length === 1 ? 'image' : 'images'} processed
              </p>
            </div>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-violet-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <span className="text-4xl relative z-10 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">✨</span>
            </div>
            <h3 className="text-xl text-white font-medium mb-2">Your gallery is empty</h3>
            <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
              Upload your first image to see the magic happen. Transformations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-3xl bg-slate-900/40 border border-white/5 overflow-hidden hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 ease-out hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                  <ComparisonSlider
                    original={image.originalUrl || image.url}
                    processed={image.url}
                    alt={`Image ${image.id.split("/").pop()}`}
                  />

                  <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-end">
                      {new Date().getTime() - new Date(image.createdAt).getTime() <
                        5 * 60 * 1000 && (
                        <div className="px-2.5 py-1 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-violet-500/20 animate-pulse">
                          New
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pointer-events-auto translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 hover:border-white/30 hover:scale-105 active:scale-95 shadow-lg"
                        title="Open full size"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDeleteClick(image.id)}
                        disabled={deletingId === image.id}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all backdrop-blur-md border border-red-500/10 hover:border-red-500/30 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                        title="Delete image"
                      >
                        {deletingId === image.id ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between group-hover:bg-white/[0.04] transition-colors duration-500">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                      {formatDate(image.createdAt)}
                    </span>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
      >
        <AlertDialogContent className="bg-slate-950/90 backdrop-blur-xl border border-white/10 text-white rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-2xl shadow-black/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              Delete Image?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 mt-2 text-sm leading-relaxed">
              This action cannot be undone. This will permanently delete the
              image from your gallery and cloud storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/20 transition-all"
            >
              {deletingId ? "Deleting..." : "Delete Image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

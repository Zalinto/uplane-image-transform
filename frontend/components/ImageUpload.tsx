"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadImageWithProgress,
  deleteImage,
  UploadResponse,
  ProcessingStep,
} from "@/app/lib/api";

interface ImageUploadProps {
  pageId: string;
}

const PROCESSING_STEPS: { key: ProcessingStep; label: string }[] = [
  { key: "removing_background", label: "Removing background" },
  { key: "flipping", label: "Flipping horizontally" },
  { key: "uploading", label: "Uploading to cloud" },
  { key: "complete", label: "Complete" },
];

function getStepIndex(step: ProcessingStep): number {
  return PROCESSING_STEPS.findIndex((s) => s.key === step);
}

export default function ImageUpload({ pageId }: ImageUploadProps) {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadImageWithProgress(file, pageId, (progress) => {
        setCurrentStep(progress.step);
      });
    },
    onSuccess: (result) => {
      setUploadedImage(result);
      setCurrentStep(null);
      // Refetch the images query to update the gallery
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Upload failed");
      setCurrentStep(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      setUploadedImage(null);
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Delete failed");
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setError(null);
      uploadMutation.mutate(file);
    },
    [uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDelete = () => {
    if (!uploadedImage) return;
    deleteMutation.mutate(uploadedImage.id);
  };

  const handleCopyUrl = async () => {
    if (!uploadedImage) return;

    try {
      await navigator.clipboard.writeText(uploadedImage.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy URL");
    }
  };

  const handleUploadAnother = () => {
    setUploadedImage(null);
    setError(null);
  };

  // Render processing progress
  if (uploadMutation.isPending) {
    const currentIndex = getStepIndex(currentStep);

    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md relative">
          {/* Ambient Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-[2rem] blur-2xl opacity-50 animate-pulse" />
          
          <div className="relative p-8 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="relative text-center mb-10">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-spin blur-md opacity-50" />
                <div className="absolute inset-0.5 rounded-full bg-black" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-20 animate-ping" />
                
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <svg
                    className="w-8 h-8 text-white animate-spin"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                Processing Image
              </h2>
              <p className="text-white/50 text-sm font-medium">
                AI is working its magic...
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              {PROCESSING_STEPS.map((step, index) => {
                const isActive = index === currentIndex;
                const isComplete = index < currentIndex;
                const isPending = index > currentIndex;

                return (
                  <div
                    key={step.key}
                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 border ${
                      isActive
                        ? "bg-white/10 border-violet-500/50 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] translate-x-2"
                        : isComplete
                        ? "bg-white/5 border-white/10"
                        : "bg-transparent border-transparent opacity-30"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isComplete
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-100"
                            : isActive
                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30 scale-110"
                            : "bg-white/10 text-white/50 scale-90"
                        }`}
                      >
                        {isComplete ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      
                      {/* Connector Line */}
                      {index < PROCESSING_STEPS.length - 1 && (
                        <div 
                          className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 transition-colors duration-500 ${
                            isComplete ? "bg-emerald-500/50" : "bg-white/10"
                          }`} 
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span
                        className={`block text-sm font-semibold transition-colors duration-300 ${
                          isActive ? "text-white" : isComplete ? "text-white/80" : "text-white/40"
                        }`}
                      >
                        {step.label}
                      </span>
                      {isActive && (
                        <span className="text-xs text-violet-300/70 animate-pulse">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render uploaded image result
  if (uploadedImage) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[500px]">
        <div className="w-full max-w-3xl relative animate-in fade-in zoom-in-95 duration-500">
           {/* Glow Effect */}
           <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2.5rem] blur-2xl opacity-50" />

          <div className="relative p-8 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
             {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 mb-4 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Transformation Complete!
              </h2>
              <p className="text-white/60 mt-2 text-sm font-medium">
                Your image has been processed successfully
              </p>
            </div>

            {/* Image Preview Container */}
            <div className="group relative rounded-2xl overflow-hidden bg-[url('/grid-pattern.svg')] bg-black/20 border border-white/10 mb-8 shadow-inner min-h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-fuchsia-500/5" />
              
              <img
                src={uploadedImage.url}
                alt="Processed image"
                className="relative z-10 w-full h-full max-h-[500px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-20 pointer-events-none" />
              
              <a 
                href={uploadedImage.url} 
                target="_blank"
                rel="noreferrer"
                className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-2.5 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* URL Section */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2 ml-1">
                Public URL
              </label>
              <div className="flex gap-2 group">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={uploadedImage.url}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white text-sm font-mono truncate focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-white/0 group-focus-within:ring-violet-500/50 pointer-events-none transition-all" />
                </div>
                <button
                  onClick={handleCopyUrl}
                  className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg ${
                    copied
                      ? "bg-emerald-500 text-white shadow-emerald-500/20 scale-105"
                      : "bg-white text-black hover:bg-violet-50 hover:text-violet-600 hover:scale-105 active:scale-95"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleUploadAnother}
                className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-white/20"
              >
                Upload Another Image
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]"
              >
                {deleteMutation.isPending ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                <span>Delete</span>
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render upload drop zone
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[500px]">
      <div className="w-full max-w-xl relative">
        
        {/* Decorative Background Elements */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none opacity-50 mix-blend-screen animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] pointer-events-none opacity-50 mix-blend-screen animate-pulse delay-700" />
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-white tracking-tight mb-4 drop-shadow-sm">
            Image Transformer
          </h1>
          <p className="text-lg text-white/60 font-light max-w-sm mx-auto leading-relaxed">
            Remove backgrounds & flip images automatically with <span className="text-violet-400 font-medium">AI precision</span>
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer transition-all duration-500 ease-out transform ${
            isDragging ? "scale-[1.02]" : "hover:scale-[1.01]"
          }`}
        >
          {/* Glowing Border Container */}
          <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 p-[2px] transition-opacity duration-500 ${
            isDragging ? "opacity-100 blur-sm" : "opacity-0 group-hover:opacity-50 blur-[2px]"
          }`} />
          
          <div className={`relative h-full rounded-[2rem] border-2 border-dashed transition-all duration-300 overflow-hidden ${
            isDragging 
              ? "bg-violet-950/30 border-violet-400/50 backdrop-blur-xl" 
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-md"
          }`}>
             
            <div className="relative p-12 sm:p-16 flex flex-col items-center justify-center text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Icon Container */}
              <div
                className={`relative w-24 h-24 mb-8 transition-all duration-500 ${
                  isDragging ? "scale-110" : "group-hover:scale-105 group-hover:-translate-y-2"
                }`}
              >
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-2xl transition-opacity duration-500 ${
                    isDragging ? "opacity-50" : "opacity-0 group-hover:opacity-30"
                }`} />
                
                <div className={`relative w-full h-full rounded-full flex items-center justify-center border border-white/10 transition-all duration-300 ${
                    isDragging 
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl shadow-violet-500/30" 
                        : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <svg
                    className={`w-10 h-10 transition-all duration-300 ${
                      isDragging ? "text-white" : "text-white/70 group-hover:text-white"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  
                  {/* Floating + icon */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-violet-600 shadow-lg transition-all duration-300 ${
                      isDragging ? "scale-100 rotate-90" : "scale-0 group-hover:scale-100"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>

              <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                  isDragging ? "text-white" : "text-white group-hover:text-violet-200"
              }`}>
                {isDragging ? "Drop to Upload" : "Upload Image"}
              </h3>
              
              <p className="text-white/50 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                Drag and drop your image here, or click to browse files
              </p>
              
              {/* File Support Badges */}
              <div className="flex gap-2">
                {['JPG', 'PNG', 'WEBP'].map((ext) => (
                    <span key={ext} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 tracking-wider">
                        {ext}
                    </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-in slide-in-from-top-2 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Features Pipeline Visualization */}
        <div className="mt-12">
          <p className="text-center text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            Processing Pipeline
          </p>
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            {[
              { label: "Upload", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12", color: "from-blue-400 to-indigo-500" },
              { label: "Remove BG", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", color: "from-violet-400 to-fuchsia-500" },
              { label: "Auto Flip", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", color: "from-emerald-400 to-teal-500" },
            ].map((step, i) => (
                <div key={i} className="flex-1 group/step">
                    <div className="relative h-24 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group-hover/step:border-white/20 transition-all duration-300">
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover/step:opacity-10 transition-opacity duration-300`} />
                        <div className="h-full flex flex-col items-center justify-center gap-2">
                             <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transform group-hover/step:scale-110 transition-transform duration-300`}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                                </svg>
                             </div>
                             <span className="text-[10px] font-semibold text-white/60 group-hover/step:text-white transition-colors">{step.label}</span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useRef } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setError(null);
      setIsUploading(true);
      setCurrentStep(null);

      try {
        const result = await uploadImageWithProgress(
          file,
          pageId,
          (progress) => {
            setCurrentStep(progress.step);
          }
        );
        setUploadedImage(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
        setCurrentStep(null);
      }
    },
    [pageId]
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

  const handleDelete = async () => {
    if (!uploadedImage) return;

    setIsDeleting(true);
    try {
      await deleteImage(uploadedImage.id);
      setUploadedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
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
  if (isUploading) {
    const currentIndex = getStepIndex(currentStep);

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-4">
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
            <h2 className="text-xl font-semibold text-white">
              Processing your image
            </h2>
            <p className="text-white/60 mt-1 text-sm">
              This may take a moment...
            </p>
          </div>

          <div className="space-y-3">
            {PROCESSING_STEPS.map((step, index) => {
              const isActive = index === currentIndex;
              const isComplete = index < currentIndex;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-white/15 border border-violet-500/50"
                      : isComplete
                      ? "bg-white/5"
                      : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? "bg-green-500"
                        : isActive
                        ? "bg-violet-500 animate-pulse"
                        : "bg-white/20"
                    }`}
                  >
                    {isComplete ? (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive || isComplete ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

    // Render uploaded image result
  if (uploadedImage) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-2xl p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Image processed successfully!
            </h2>
            <p className="text-white/60 mt-1 text-sm">
              Background removed and flipped horizontally
            </p>
          </div>

          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-6">
            <img
              src={uploadedImage.url}
              alt="Processed image"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          {/* URL Section */}
          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-2">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={uploadedImage.url}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono truncate focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUploadAnother}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Upload Another
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
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
                  Deleting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render upload drop zone
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Image Transformer
          </h1>
          <p className="text-white/60">
            Remove backgrounds & flip images horizontally
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
            isDragging
              ? "border-violet-500 bg-violet-500/20 scale-[1.02]"
              : "border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-white/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 transition-all duration-300 ${
                isDragging
                  ? "bg-violet-500 scale-110"
                  : "bg-white/10 group-hover:bg-violet-500/20 group-hover:scale-105"
              }`}
            >
              <svg
                className={`w-10 h-10 transition-all ${
                  isDragging
                    ? "text-white"
                    : "text-white/60 group-hover:text-violet-400"
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
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragging ? "Drop your image here" : "Upload an image"}
            </h3>
            <p className="text-white/50 text-sm mb-4">
              Drag and drop or click to browse
            </p>
            <p className="text-white/30 text-xs">
              Supports: JPG, PNG, WEBP • Max 10MB
            </p>
          </div>

          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: "✨", label: "Remove BG" },
            { icon: "↔️", label: "Flip Image" },
            { icon: "☁️", label: "Cloud Host" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-white/60 text-sm">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface UploadResponse {
  id: string;
  url: string;
  createdAt: string;
}

export interface ImageItem {
  id: string;
  url: string;
  createdAt: string;
  originalUrl: string;
}

export interface GetAllImagesResponse {
  images: ImageItem[];
}

export async function getAllImages(): Promise<GetAllImagesResponse> {
  const response = await fetch(`${API_BASE_URL}/image/records`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch images");
  }

  const data = await response.json();
  return data;
}

export async function deleteImage(id: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/image/records/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete image");
  }
}

export type ProcessingStep =
  | "removing_background"
  | "flipping"
  | "uploading"
  | "complete"
  | null;

export interface UploadProgress {
  step: ProcessingStep;
  fileName: string;
  fileSize: number;
}

export async function uploadImageWithProgress(
  file: File,
  pageId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pageId", pageId);

  if (onProgress) {
    onProgress({
      step: "removing_background",
      fileName: file.name,
      fileSize: file.size,
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (onProgress) {
    onProgress({
      step: "flipping",
      fileName: file.name,
      fileSize: file.size,
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (onProgress) {
    onProgress({
      step: "uploading",
      fileName: file.name,
      fileSize: file.size,
    });
  }

  const response = await fetch(`${API_BASE_URL}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to upload image");
  }

  if (onProgress) {
    onProgress({
      step: "complete",
      fileName: file.name,
      fileSize: file.size,
    });
  }

  return response.json();
}

# Uplane Image Transform

A full-stack application for processing images with background removal and horizontal flipping.

## Features

- **Image Upload**: Clean, intuitive drag-and-drop interface
- **Background Removal**: Uses BackgroundErase API to remove image backgrounds
- **Image Processing**: Automatically flips processed images horizontally
- **Image Hosting**: Stores processed images on Supabase Storage
- **Image Deletion**: Users can delete their uploaded and processed images

## Tech Stack

### Frontend
- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Bun for package management

### Backend
- NestJS
- TypeScript
- Sharp for image processing
- Supabase for image storage
- BackgroundErase API for background removal

## Prerequisites

- Node.js 18+ or Bun 1+
- Supabase account (free tier)
- BackgroundErase API key (free credits available)

## Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Create environment file
cp .env.example .env

# Edit .env and add your credentials:
# - BACKGROUND_ERASE_API_KEY (get from https://backgrounderase.com)
# - SUPABASE_URL (from Supabase project settings)
# - SUPABASE_ANON_KEY (from Supabase project settings)
# - SUPABASE_BUCKET_NAME (create a bucket named 'images' in Supabase)

# Start development server
bun run dev
```

Backend will run on http://localhost:3000/api/v1

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Create environment file
cp .env.example .env

# Edit .env and set backend URL (if different from localhost:3000):
# - NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Start development server
bun run dev
```

Frontend will run on http://localhost:3001

## API Endpoints

### Upload Image
```
POST /api/v1/image/upload
Content-Type: multipart/form-data

Body:
- file: Image file (PNG, JPG, GIF, max 10MB)

Response:
{
  "id": "processed/uuid.png",
  "url": "https://supabase-url/...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete Image
```
DELETE /api/v1/image/delete
Content-Type: application/json

Body:
{
  "id": "processed/uuid.png"
}
```

## How It Works

1. User uploads an image via the frontend interface
2. Frontend sends image to backend `/api/v1/image/upload`
3. Backend processes the image in three steps:
   - Removes background using BackgroundErase API
   - Flips image horizontally using Sharp
   - Uploads to Supabase Storage
4. Backend returns image ID and public URL
5. Frontend displays processed image with download link
6. User can delete the image using the delete button

## Environment Variables

### Backend (.env)
```
PORT=3000
BACKGROUND_ERASE_API_KEY=your_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_BUCKET_NAME=images
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Development

### Backend
```bash
cd backend
bun run dev          # Start with watch mode
bun run build        # Build for production
bun run start:prod   # Run production build
bun run test         # Run tests
```

### Frontend
```bash
cd frontend
bun run dev          # Start development server
bun run build        # Build for production
bun run start         # Start production server
```

## Supabase Setup

1. Create a free account at https://supabase.com
2. Create a new project
3. Go to Storage → Create a new bucket named `images`
4. Make the bucket public:
   - Click on the bucket
   - Toggle "Public bucket" to ON
5. Get your credentials:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → anon public key

## BackgroundErase API Setup

1. Sign up at https://backgrounderase.com
2. Get your free API credits (they offer free trials)
3. Copy your API key to backend `.env` file

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── image/
│   │   │   ├── services/
│   │   │   │   ├── background-removal.service.ts
│   │   │   │   ├── image-processing.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   ├── image.controller.ts
│   │   │   ├── image.service.ts
│   │   │   └── dto/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── image-transform/[id]/
│   │   │   ├── components/
│   │   │   │   └── ImageUpload.tsx
│   │   │   ├── page.tsx
│   │   │   └── not-found.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── .env.example
└── README.md
```

## License

Private - All rights reserved

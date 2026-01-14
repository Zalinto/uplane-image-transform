# Uplane Image Transform

A production-ready full-stack application for automated image processing with AI-powered background removal and horizontal flipping.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Bun](https://img.shields.io/badge/Bun-1.3-orange?logo=bun)

## ✨ Features

- **Drag & Drop Upload** — Intuitive interface with visual feedback and file validation
- **AI Background Removal** — Powered by Remove.bg API for professional-grade cutouts
- **Auto Horizontal Flip** — Automatically mirrors processed images using Sharp
- **Cloud Storage** — Secure image hosting on Supabase Storage
- **Before/After Comparison** — Interactive slider to compare original and processed images
- **Image Gallery** — View processing history with real-time updates via TanStack Query
- **Delete Functionality** — Remove images from both storage and database with confirmation modal
- **Page-Based Access Control** — Route protection using page ID validation

## 🛠 Tech Stack

### Frontend

| Technology      | Purpose                           |
| --------------- | --------------------------------- |
| Next.js 16      | React framework with App Router   |
| TypeScript      | Type-safe development             |
| TanStack Query  | Server state management & caching |
| Tailwind CSS v4 | Utility-first styling             |
| shadcn/ui       | Radix-based UI components         |
| Bun             | Fast package management & runtime |

### Backend

| Technology       | Purpose                           |
| ---------------- | --------------------------------- |
| NestJS 11        | Node.js framework                 |
| Drizzle ORM      | Type-safe database queries        |
| PostgreSQL       | Database (via Supabase)           |
| Sharp            | High-performance image processing |
| Supabase Storage | Cloud file storage                |
| Remove.bg API    | AI background removal             |

## 📁 Project Structure

```
uplane-image-transform/
├── backend/
│   ├── src/
│   │   ├── common/guards/        # PageIdGuard for route protection
│   │   ├── config/               # Configuration service
│   │   ├── db/                   # Drizzle schema & migrations
│   │   ├── dto/                  # Data transfer objects
│   │   ├── health/               # Health check endpoint
│   │   ├── image/
│   │   │   ├── services/
│   │   │   │   ├── background-removal.service.ts
│   │   │   │   ├── database.service.ts
│   │   │   │   ├── image-processing.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   ├── image.controller.ts
│   │   │   ├── image.module.ts
│   │   │   └── image.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── drizzle/                  # Database migrations
│   ├── vercel.json               # Vercel deployment config
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── image-transform/[id]/ # Protected image transform page
│   │   ├── lib/api.ts            # API client functions
│   │   ├── providers.tsx         # React Query provider
│   │   ├── globals.css           # Global styles + CSS variables
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── ImageGallery.tsx      # Gallery with comparison slider
│   │   └── ImageUpload.tsx       # Upload interface
│   ├── lib/utils.ts              # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.0+ (recommended) or Node.js 18+
- [Supabase](https://supabase.com) account (free tier)
- [Remove.bg](https://www.remove.bg/api) API key

### 1. Clone & Install

```bash
git clone https://github.com/your-username/uplane-image-transform.git
cd uplane-image-transform

# Install backend dependencies
cd backend && bun install

# Install frontend dependencies
cd ../frontend && bun install
```

### 2. Environment Setup

**Backend** (`backend/.env`):

```env
PORT=8080
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET_NAME=images
REMOVE_BG_API_KEY=your_remove_bg_api_key
ALLOWED_PAGE_ID=your-unique-page-id
```

**Frontend** (`frontend/.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
ALLOWED_PAGE_ID=your-unique-page-id
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Create a storage bucket named `images` (make it **public**)
3. Run the database migration:
   ```bash
   cd backend
   bun run db:push
   ```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend (runs on port 8080)
cd backend
bun run dev

# Terminal 2 - Frontend (runs on port 3000)
cd frontend
bun run dev
```

Access the app at: `http://localhost:3000/image-transform/[your-page-id]`

## 📡 API Reference

### Base URL

- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://your-backend.vercel.app/api/v1`

### Endpoints

#### Upload Image

```http
POST /image/upload
Content-Type: multipart/form-data

file: <image file>
pageId: <string>
```

**Response:**

```json
{
  "id": "79900e49-b385-4650-bcb9-f3888fbad5a8",
  "url": "https://[supabase]/storage/v1/object/public/images/processed/...",
  "originalUrl": "https://[supabase]/storage/v1/object/public/images/original/...",
  "createdAt": "2026-01-13T00:00:00.000Z"
}
```

#### Get All Images

```http
GET /image/records
```

#### Get Image by ID

```http
GET /image/records/:id
```

#### Delete Image

```http
DELETE /image/records/:id
```

#### Health Check

```http
GET /health
```

## 🌐 Deployment

### Vercel Deployment

Both frontend and backend are configured for Vercel deployment.

**Backend:**

```bash
cd backend
bun run deploy
```

**Frontend:**

```bash
cd frontend
bun run deploy
```

### Environment Variables on Vercel

Set the same environment variables from your `.env` files in Vercel's project settings.

## 🗄 Database Schema

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_path TEXT NOT NULL,
  processed_path TEXT NOT NULL,
  page_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 🔒 Security Features

- **Page ID Validation** — Routes are protected by page ID matching
- **Service Role Key** — Backend uses Supabase service role for elevated permissions
- **Rate Limiting** — NestJS Throttler guards against abuse
- **CORS Configuration** — Configured for allowed origins
- **Helmet** — Security headers middleware

## 📜 Scripts

### Backend

| Script                | Description              |
| --------------------- | ------------------------ |
| `bun run dev`         | Start with hot reload    |
| `bun run build`       | Build for production     |
| `bun run deploy`      | Build + deploy to Vercel |
| `bun run db:push`     | Push schema to database  |
| `bun run db:generate` | Generate migrations      |

### Frontend

| Script           | Description          |
| ---------------- | -------------------- |
| `bun run dev`    | Start dev server     |
| `bun run build`  | Build for production |
| `bun run deploy` | Deploy to Vercel     |

## 📄 License

Private — All rights reserved.

# Backend API Documentation

## Overview

This NestJS backend provides image processing services including:

- Image upload
- Background removal (using remove.bg API)
- Horizontal image flip
- Cloud storage (Supabase)
- Image deletion
- Rate limiting with throttlers
- Request validation with class-validator

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory based on `.env.example`:

**Required variables** (validated on startup):
- `REMOVE_BG_API_KEY` - Your remove.bg API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional variables**:
- `PORT` - Server port (default: 8080)
- `SUPABASE_BUCKET_NAME` - Supabase bucket name (default: images)
- `FRONTEND_URL` - Frontend URL for CORS (default: allows all origins)

```env
PORT=8080

# Frontend URL for CORS (optional, default: allows all origins)
FRONTEND_URL=http://localhost:5173

# Remove.bg API Key
# Get your free API key at: https://www.remove.bg/api
# Free tier: 50 API calls/month
REMOVE_BG_API_KEY=your_remove_bg_api_key_here

# Supabase Configuration
# Create a project at: https://supabase.com
# Create a storage bucket named 'images' with public access
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_BUCKET_NAME=images
```

### 3. Configure Supabase Storage

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `images`
4. Make the bucket public
5. Add these CORS rules to the bucket:

```json
{
  "rules": [
    {
      "origin": ["*"],
      "methods": ["GET", "POST", "DELETE"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

### 4. Start the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000` (or configured PORT)

## API Endpoints

### GET /api/v1/health

Check server health status.

**Rate Limit:** 5 requests per minute

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T20:30:00.000Z"
}
```

### POST /api/v1/image/upload

Upload and process an image.

**Rate Limit:** 3 requests per 5 minutes

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Image file (required)
  - `pageId`: Optional UUID string for grouping images

**Validation:**
- File must be an image (jpeg, jpg, png, gif, or webp)
- File size: Max 10MB
- pageId (optional): Must be a valid UUID
- pageId cannot be `27b03860-2af2-47f0-a910-f41fab29f37c` (blocked)

**Response:**
```json
{
  "id": "processed/uuid-v4.png",
  "url": "https://xxx.supabase.co/storage/v1/object/public/images/processed/uuid-v4.png",
  "createdAt": "2026-01-12T20:30:00.000Z"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/image/upload \
  -F "file=@/path/to/your/image.jpg" \
  -F 'pageId=550e8400-e29b-41d4-a716-446655440000'
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('pageId', '550e8400-e29b-41d4-a716-446655440000');

const response = await fetch('http://localhost:3000/api/v1/image/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.url);
```

### DELETE /api/v1/image/delete

Delete a processed image.

**Rate Limit:** 3 requests per minute

**Request:**
- Method: `DELETE`
- Content-Type: `application/json`
- Body:
```json
{
  "id": "processed/uuid-v4.png"
}
```

**Validation:**
- `id`: Required string, cannot be empty

**Response:** `204 No Content`

**Example (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/v1/image/delete \
  -H "Content-Type: application/json" \
  -d '{"id": "processed/uuid-v4.png"}'
```

## Image Processing Pipeline

1. **Upload** → User uploads an image (max 10MB)
2. **Validation** → File type, size, and pageId are validated
3. **Background Removal** → remove.bg API removes the background
4. **Horizontal Flip** → Image is flipped horizontally
5. **Storage** → Processed image is uploaded to Supabase storage
6. **Response** → User receives a public URL to access the processed image

## Rate Limiting

The API implements strict rate limiting to prevent abuse:

- **Health endpoint**: 5 requests/minute
- **Upload endpoint**: 3 requests/5 minutes
- **Delete endpoint**: 3 requests/minute

When limits are exceeded, API returns `429 Too Many Requests`.

## Validation

### Environment Variable Validation

Required environment variables are validated on application startup:

**Required variables:**
- `REMOVE_BG_API_KEY` - remove.bg API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

If any required variable is missing, the application will fail to start with an error message.

### Request Validation

All requests are validated using class-validator:

- **Type validation**: Ensures correct data types
- **Format validation**: UUIDs, MIME types, etc.
- **Required fields**: Ensures required data is present
- **Optional fields**: Proper handling of optional parameters

Common validation errors:
- `500 Internal Server Error` - Missing environment variables (on startup)
- `400 Bad Request` - Invalid input data
- `429 Too Many Requests` - Rate limit exceeded

## Security Features

- **Helmet** - Sets various HTTP security headers to protect against well-known web vulnerabilities
- **CORS enabled** - Configurable via `FRONTEND_URL` environment variable (default: allows all origins)
- **Rate limiting** on all endpoints
- **Request validation** with class-validator
- **pageId filtering** - Blocks specific UUID
- **Global validation pipe** with whitelisting
- **Transform enabled** for automatic type conversion

## Dependencies

- `@nestjs/common` - NestJS core framework
- `@nestjs/config` - Configuration management
- `@nestjs/platform-express` - Platform adapter for Express
- `@nestjs/throttler` - Rate limiting
- `@supabase/supabase-js` - Supabase SDK
- `multer` - File upload handling
- `sharp` - Image processing
- `axios` - HTTP client for remove.bg API
- `uuid` - Unique identifier generation
- `class-validator` - Request validation
- `class-transformer` - Data transformation
- `helmet` - Security headers middleware

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad request (invalid input, validation errors)
- `429` - Too many requests (rate limit exceeded)
- `500` - Internal server error (API failures, storage errors)

## Notes

- Maximum file size: 10MB
- Supported formats: JPEG, JPG, PNG, GIF, WebP
- Free tier limits: 50 background removal calls/month (remove.bg)
- Processed images are stored in Supabase with public access
- All endpoints use `/api/v1` prefix
- pageId is optional and used for grouping images

## Testing

You can test the API using the frontend application or with tools like Postman or cURL.

```bash
# Test health
curl http://localhost:3000/api/v1/health

# Test upload
curl -X POST http://localhost:3000/api/v1/image/upload \
  -F "file=@test-image.jpg"

# Test deletion (use the id returned from upload)
curl -X DELETE http://localhost:3000/api/v1/image/delete \
  -H "Content-Type: application/json" \
  -d '{"id": "processed/your-image-id.png"}'
```

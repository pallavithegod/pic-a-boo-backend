# 📸 Pic-a-boo (Backend)

Welcome to the backend of **Pic-a-boo**, the API and infrastructure layer that powers the Pic-a-boo image gallery. 

Built for speed and simplicity, this backend bypasses heavy server-side image processing by orchestrating **Direct-to-S3 Uploads** via Pre-signed URLs, paired with a lightweight JSON data store for immediate metadata retrieval.

## ✨ Features

- **Pre-signed URL Orchestration:** Generates secure, time-limited AWS S3 pre-signed URLs, allowing the frontend to upload large image files directly to the storage bucket. This eliminates server bandwidth bottlenecks.
- **Lightweight Metadata Store:** Uses a blazing-fast, filesystem-based JSON database (`data/images.json`) to store and retrieve image dimensions, blur hashes, and URLs without the overhead of a traditional database.
- **RESTful API:** Clean, well-documented endpoints for fetching the gallery, initializing uploads, confirming metadata, and deleting assets.
- **CORS Configured:** Fully configured to securely accept requests from the Vite frontend.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Cloud Integration:** AWS SDK (v3) for Amazon S3
- **Storage:** Local JSON (Metadata), AWS S3 (Binary Assets)

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the backend directory (use `.env.example` as a template):
   ```env
   PORT=3000
   
   # AWS S3 Configuration
   AWS_REGION=your-region
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET_NAME=your-bucket-name
   ```
   *(Note: The application is currently designed to function with local mock data if AWS is not fully configured, allowing for rapid UI development).*

3. **Start the Server**
   ```bash
   # For development (auto-reloads on changes)
   npm run dev
   
   # For production
   npm start
   ```
   The API will be available at `http://localhost:3000`.

## 📂 API Routes

- `GET /api/images` - Retrieve all image metadata, sorted by date.
- `POST /api/upload/presigned-url` - Request an S3 pre-signed URL for a new upload.
- `POST /api/images` - Save metadata for a successfully uploaded image.
- `DELETE /api/images/:id` - Delete an image's metadata and remove the file from S3.

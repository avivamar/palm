# Cloudflare R2 Image Upload Package Setup Guide

## Overview

The `@rolitt/image-upload` package provides secure image upload functionality using Cloudflare R2 storage. This guide covers the setup and configuration required to use the package.

## Required Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_BUCKET_NAME="your-bucket-name"
CLOUDFLARE_R2_REGION="auto"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

## Cloudflare R2 Setup

1. **Create an R2 Bucket**:
   - Log in to Cloudflare Dashboard
   - Navigate to R2 Object Storage
   - Create a new bucket with your desired name

2. **Generate API Token**:
   - Go to R2 → Manage R2 API tokens
   - Create token with permissions:
     - Object:Read
     - Object:Write
     - Bucket:List

3. **Get Account ID**:
   - Available in the right sidebar of your Cloudflare dashboard
   - Used to construct the endpoint URL

## Database Migration

Run the database migration to create the required table:

```bash
npm run db:migrate
```

This creates the `user_images` table with the following structure:
- `id` - Primary key
- `user_id` - Foreign key to users table
- `file_name` - Original file name
- `file_size` - File size in bytes
- `mime_type` - MIME type (jpeg, png, webp, gif)
- `url` - Public URL to access the image
- `r2_key` - R2 object key for storage reference
- `description` - Optional description
- `tags` - Array of tags
- `ai_analyzed` - Boolean flag for ChatGPT integration
- `ai_description` - AI-generated description
- `created_at` - Upload timestamp
- `updated_at` - Last modification timestamp

## Usage

### 1. Basic Upload (React Hook)

```tsx
import { useImageUpload } from '@rolitt/image-upload/hooks';

export function ImageUploadComponent({ userId }: { userId: string }) {
  const { uploadImage, isUploading, progress, error } = useImageUpload(userId, {
    onSuccess: (result) => {
      console.log('Upload successful:', result);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
    onProgress: (progress) => {
      console.log('Upload progress:', `${progress.percentage}%`);
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {isUploading && (
        <p>
          Uploading...
          {progress?.percentage || 0}
          %
        </p>
      )}
      {error && (
        <p style={{ color: 'red' }}>
          Error:
          {error}
        </p>
      )}
    </div>
  );
}
```

### 2. Manual Upload

```typescript
import { generateUploadUrl, getUserImages, uploadImage } from '@rolitt/image-upload';

// Generate presigned URL for direct upload
const presignedData = await generateUploadUrl('my-image.jpg', 'image/jpeg', 'user-123');

// Complete upload with validation
const result = await uploadImage(file, 'user-123');
if (result.success) {
  console.log('Uploaded image:', result.data);
}

// Get user's images
const userImages = await getUserImages('user-123');
```

### 3. API Endpoints

The package provides these API endpoints:

- `POST /api/user/images/upload-url` - Generate presigned upload URL
- `GET /api/user/images?userId=123` - Get user's images
- `POST /api/user/images` - Save image record after upload
- `DELETE /api/user/images?imageId=123` - Delete image record

## Security Features

### 1. File Validation
- **File Type Whitelist**: Only JPEG, PNG, WebP, and GIF images allowed
- **Size Limit**: 10MB maximum file size
- **Magic Number Verification**: Validates actual file format vs. file extension

### 2. Access Control
- **Authentication Required**: All endpoints require valid Supabase session
- **User Isolation**: Users can only access their own images
- **Secure Key Generation**: UUID + timestamp prevents path traversal

### 3. Error Handling
- **Comprehensive Validation**: Client and server-side validation
- **Graceful Failures**: Detailed error messages for debugging
- **Retry Logic**: Built-in retry for transient failures

## ChatGPT Integration (Future)

The database schema includes fields for AI integration:
- `description` - User-provided image description
- `tags` - Searchable tags
- `ai_analyzed` - Flag indicating AI processing status
- `ai_description` - AI-generated image description

## Troubleshooting

### Common Issues

1. **"Missing required environment variable"**
   - Ensure all R2 environment variables are set
   - Verify environment file is loaded correctly

2. **"Failed to generate presigned URL"**
   - Check R2 credentials and permissions
   - Verify bucket exists and is accessible

3. **"File validation failed"**
   - Ensure file is a supported image format
   - Check file size is under 10MB limit

4. **"User not found"**
   - Verify user is authenticated with Supabase
   - Check user exists in database

### Debug Mode

Enable debug logging:

```bash
DEBUG=@rolitt/image-upload npm run dev
```

## Performance Considerations

- **Direct Upload**: Uses presigned URLs to upload directly to R2, reducing server load
- **Async Processing**: Database operations happen asynchronously via webhooks
- **CDN Caching**: R2 provides global CDN for fast image delivery
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## Monitoring

Monitor upload success rates and errors through:
- Application logs
- Cloudflare R2 analytics
- Database query logs
- User feedback mechanisms

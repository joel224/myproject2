
// src/app/api/upload/image/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { generateId } from '@/lib/mockServerDb'; // Using this for unique filenames

// Initialize GCS Storage client
// It will automatically use credentials from GOOGLE_APPLICATION_CREDENTIALS environment variable
let storage: Storage;
try {
  storage = new Storage();
} catch (error) {
  console.error("Failed to initialize Google Cloud Storage client:", error);
  // If storage client fails to initialize, subsequent calls will fail.
  // Consider how to handle this globally or per request.
}


const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;

export async function POST(request: NextRequest) {
  if (!storage) {
    console.error('GCS Storage client not initialized. Check GOOGLE_APPLICATION_CREDENTIALS.');
    return NextResponse.json({ message: "Server configuration error for file uploads." }, { status: 500 });
  }
  if (!GCS_BUCKET_NAME) {
    console.error('GCS_BUCKET_NAME environment variable is not set.');
    return NextResponse.json({ message: "Server configuration error: Bucket name missing." }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('imageFile') as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Updated file type validation
    const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/webp', 
        'image/gif',
        'application/pdf'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: `Invalid file type: ${file.type}. Allowed types: JPG, PNG, WEBP, GIF, PDF.` }, { status: 400 });
    }
    
    // Basic file size validation (e.g., 5MB limit)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json({ message: `File too large. Maximum size is ${maxSizeInBytes / (1024*1024)}MB.` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename to prevent overwrites
    const uniqueFilename = `${generateId('gcsfile_')}-${file.name.replace(/\s+/g, '_')}`;
    
    const bucket = storage.bucket(GCS_BUCKET_NAME);
    const gcsFile = bucket.file(uniqueFilename);

    await gcsFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      // To make the file publicly readable (if your bucket permissions allow)
      // public: true, // This makes the individual object public upon upload
      // resumable: false, // Optional: set to false for smaller files if preferred
    });
    
    // IMPORTANT: Ensure your bucket or the specific object has public read access
    // if you intend to use this direct URL format.
    // Otherwise, you'd need to generate signed URLs.
    // If you set `public: true` above AND your bucket allows public access, this URL should work.
    const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${uniqueFilename}`;

    console.log(`File ${file.name} uploaded to ${GCS_BUCKET_NAME}/${uniqueFilename}. Public URL: ${publicUrl}`);

    return NextResponse.json({ 
        message: "File uploaded successfully to GCS", 
        imageUrl: publicUrl, // Keep parameter name as imageUrl for client consistency
        fileName: uniqueFilename // Return the GCS filename
    }, { status: 201 });

  } catch (error) {
    console.error('GCS File upload error:', error);
    // Check if error is from GCS and provide more specific feedback if possible
    if (error instanceof Error && 'code' in error && error.code === 403) {
         return NextResponse.json({ message: "Permission denied. Check GCS bucket/service account permissions." }, { status: 403 });
    }
    return NextResponse.json({ message: "An unexpected error occurred during file upload to GCS" }, { status: 500 });
  }
}

    
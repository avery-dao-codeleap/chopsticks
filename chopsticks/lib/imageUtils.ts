import { Platform } from 'react-native';

// Image manipulator - only available in dev client, not Expo Go
let ImageManipulator: any = null;
try {
  ImageManipulator = require('expo-image-manipulator');
} catch {
  console.warn('[ImageUtils] expo-image-manipulator not available (Expo Go mode)');
}

// Face detection requires native module, only available in dev client builds
let FaceDetector: any = null;
try {
  FaceDetector = require('expo-face-detector');
} catch {
  console.warn('[ImageUtils] expo-face-detector not available (Expo Go mode)');
}

export interface ImageCompressionResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface FaceDetectionResult {
  hasFace: boolean;
  faceCount: number;
  error?: string;
}

/**
 * Compress and resize image to meet size requirements
 * Target: 800x800px, <1MB
 */
export async function compressImage(
  uri: string,
  maxSize: number = 800,
  quality: number = 0.8
): Promise<ImageCompressionResult> {
  // Skip compression in Expo Go (module not available)
  if (!ImageManipulator) {
    console.log('[ImageUtils] Skipping compression in Expo Go mode');
    return { uri, width: maxSize, height: maxSize };
  }

  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxSize, height: maxSize } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
    };
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Detect if image contains at least one face
 * Uses expo-face-detector (on-device, no API calls)
 */
export async function detectFace(uri: string): Promise<FaceDetectionResult> {
  // In Expo Go or if module unavailable, skip face detection
  if (!FaceDetector) {
    console.warn('[ImageUtils] Face detection skipped (module unavailable)');
    return { hasFace: true, faceCount: 1 }; // Allow upload in development
  }

  try {
    const result = await FaceDetector.detectFacesAsync(uri, {
      mode: FaceDetector.FaceDetectorMode.fast,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
      runClassifications: FaceDetector.FaceDetectorClassifications.none,
    });

    const faceCount = result.faces?.length || 0;

    return {
      hasFace: faceCount > 0,
      faceCount,
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return {
      hasFace: false,
      faceCount: 0,
      error: (error as Error).message,
    };
  }
}

/**
 * Process profile photo: compress + detect face
 * Returns compressed URI if valid, throws error if no face detected
 */
export async function processProfilePhoto(uri: string): Promise<string> {
  // Step 1: Compress image first (faster to detect on smaller image)
  const compressed = await compressImage(uri, 800, 0.8);

  // Step 2: Detect face
  const faceResult = await detectFace(compressed.uri);

  if (!faceResult.hasFace) {
    throw new Error('No face detected. Please upload a clear photo of your face.');
  }

  if (faceResult.faceCount > 1) {
    throw new Error('Multiple faces detected. Please upload a photo with only your face.');
  }

  return compressed.uri;
}

/**
 * Upload image to Supabase Storage
 * Returns public URL
 */
export async function uploadImageToSupabase(
  uri: string,
  bucket: string,
  path: string,
  supabase: any
): Promise<string> {
  try {
    // Convert URI to blob for upload
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create file extension from mime type
    const ext = blob.type.split('/')[1] || 'jpg';
    const filePath = `${path}.${ext}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Utility functions for handling image URLs with Unicode characters
 */

import { AppConfig } from '@/config/appConfig';

// Types for image quality
export type ImageQuality = 'preview' | 'thumbnail' | 'full';

// Interface for Supabase transformation parameters
interface SupabaseTransformParams {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}

export function getSupabasePhotoUrl(photoName: string, quality: ImageQuality = 'preview'): string {
  try {
    // Remove any path prefix if present (e.g., "/photos/DSCF0930.JPG" -> "DSCF0930.JPG")
    const cleanPhotoName = photoName.split('/').pop() || photoName;
    
    if (!AppConfig.USE_SUPABASE) {
      // Return local path when not using Supabase
      return photoName;
    }

    // Get transformation parameters based on quality
    const transformParams = AppConfig.SUPABASE_TRANSFORMATIONS[quality.toUpperCase() as keyof typeof AppConfig.SUPABASE_TRANSFORMATIONS] as SupabaseTransformParams;
    
    if (!transformParams) {
      return AppConfig.SUPABASE_BASE_URL + encodeURIComponent(cleanPhotoName);
    }

    // Build transformation query string
    const queryParams = new URLSearchParams();
    
    if (transformParams.width) queryParams.append('width', transformParams.width.toString());
    if (transformParams.height) queryParams.append('height', transformParams.height.toString());
    if (transformParams.quality) queryParams.append('quality', transformParams.quality.toString());
    if (transformParams.format) queryParams.append('format', transformParams.format);

    const queryString = queryParams.toString();
    const baseUrl = AppConfig.SUPABASE_BASE_URL + encodeURIComponent(cleanPhotoName);
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  } catch (error) {
    console.error('Error creating Supabase photo URL:', error);
    return photoName;
  }
}

export function encodeImageUrl(url: string, quality: ImageQuality = 'preview'): string {
  try {
    // If it's a photo path (starts with /photos/), handle based on configuration
    if (url.startsWith('/photos/')) {
      if (AppConfig.USE_SUPABASE) {
        // Use Supabase storage with specified quality
        const supabaseUrl = getSupabasePhotoUrl(url, quality);
        if (AppConfig.LOG_LOADING_INFO) {
          console.log('Supabase URL generated:', { original: url, quality, result: supabaseUrl });
        }
        return supabaseUrl;
      } else {
        // Use local photos - return the original path with proper encoding
        const parts = url.split('/');
        const filename = parts.pop();
        
        if (!filename) return url;
        
        // Encode only the filename part for local storage
        const encodedFilename = encodeURIComponent(filename);
        
        // Reconstruct the URL for local storage
        const localUrl = [...parts, encodedFilename].join('/');
        if (AppConfig.LOG_LOADING_INFO) {
          console.log('Local URL generated:', { original: url, result: localUrl });
        }
        return localUrl;
      }
    }
    
    // For other URLs (like avatars), use the original encoding logic
    const parts = url.split('/');
    const filename = parts.pop();
    
    if (!filename) return url;
    
    // Encode only the filename part
    const encodedFilename = encodeURIComponent(filename);
    
    // Reconstruct the URL
    return [...parts, encodedFilename].join('/');
  } catch (error) {
    console.error('Error encoding image URL:', error);
    return url;
  }
}

export function getImageDisplayName(path: string): string {
  try {
    const filename = path.split('/').pop() || '';
    // Decode the filename for display
    return decodeURIComponent(filename).split('.')[0] || 'Unknown';
  } catch (error) {
    console.error('Error getting image display name:', error);
    return 'Unknown';
  }
}

export function isValidImageUrl(url: string): boolean {
  try {
    // Check if the URL is valid
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download image from Supabase URL
 * @param photoPath - The photo path (e.g., "/photos/DSCF0930.JPG")
 * @param filename - Optional custom filename for download
 */
export async function downloadImage(photoPath: string, filename?: string): Promise<void> {
  try {
    if (!AppConfig.USE_SUPABASE) {
      // Local: fallback to <a> download
      const link = document.createElement('a');
      link.href = photoPath;
      link.download = filename || photoPath.split('/').pop() || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    // Supabase: always fetch as blob to force download
    const fullResUrl = getSupabasePhotoUrl(photoPath, 'full');
    const response = await fetch(fullResUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    const downloadFilename = filename || photoPath.split('/').pop() || 'photo.jpg';
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

/**
 * Download multiple images as a zip file
 * @param photoPaths - Array of photo paths to download
 */
export async function downloadMultipleImages(photoPaths: string[]): Promise<void> {
  try {
    if (!AppConfig.USE_SUPABASE) {
      console.warn('Download functionality is only available for Supabase storage');
      return;
    }

    // If only one image, download directly
    if (photoPaths.length === 1) {
      await downloadImage(photoPaths[0]);
      return;
    }

    // For multiple images, create a ZIP file
    try {
      // Dynamic import of JSZip to avoid bundle size issues
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      console.log(`Starting ZIP download of ${photoPaths.length} images...`);
      
      // Add each image to the ZIP
      for (const photoPath of photoPaths) {
        try {
          const fullResUrl = getSupabasePhotoUrl(photoPath, 'full');
          const response = await fetch(fullResUrl);
          if (!response.ok) throw new Error(`Failed to fetch ${photoPath}`);
          
          const blob = await response.blob();
          const filename = photoPath.split('/').pop() || 'photo.jpg';
          zip.file(filename, blob);
          
          console.log(`Added ${filename} to ZIP`);
        } catch (error) {
          console.error(`Failed to add ${photoPath} to ZIP:`, error);
        }
      }
      
      // Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `graduation_photos_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
      
      console.log(`ZIP download completed with ${photoPaths.length} images`);
    } catch (zipError) {
      console.warn('ZIP creation failed, falling back to individual downloads:', zipError);
      
      // Fallback to individual downloads
      for (const photoPath of photoPaths) {
        try {
          await downloadImage(photoPath);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to download ${photoPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error downloading multiple images:', error);
    throw error;
  }
}

// Export configuration for debugging
export const ImageConfig = {
  USE_SUPABASE: AppConfig.USE_SUPABASE,
  SUPABASE_BASE_URL: AppConfig.SUPABASE_BASE_URL,
  SUPABASE_TRANSFORMATIONS: AppConfig.SUPABASE_TRANSFORMATIONS
}; 
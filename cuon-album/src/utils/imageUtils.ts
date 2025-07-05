/**
 * Utility functions for handling image URLs with Unicode characters
 */

import { AppConfig } from '@/config/appConfig';

export function getSupabasePhotoUrl(photoName: string): string {
  try {
    // Remove any path prefix if present (e.g., "/photos/DSCF0930.JPG" -> "DSCF0930.JPG")
    const cleanPhotoName = photoName.split('/').pop() || photoName;
    return AppConfig.SUPABASE_BASE_URL + encodeURIComponent(cleanPhotoName);
  } catch (error) {
    console.error('Error creating Supabase photo URL:', error);
    return photoName;
  }
}

export function encodeImageUrl(url: string): string {
  try {
    // If it's a photo path (starts with /photos/), handle based on configuration
    if (url.startsWith('/photos/')) {
      if (AppConfig.USE_SUPABASE) {
        // Use Supabase storage
        return getSupabasePhotoUrl(url);
      } else {
        // Use local photos (original behavior)
        const parts = url.split('/');
        const filename = parts.pop();
        
        if (!filename) return url;
        
        // Encode only the filename part
        const encodedFilename = encodeURIComponent(filename);
        
        // Reconstruct the URL
        return [...parts, encodedFilename].join('/');
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

// Export configuration for debugging
export const ImageConfig = {
  USE_SUPABASE: AppConfig.USE_SUPABASE,
  SUPABASE_BASE_URL: AppConfig.SUPABASE_BASE_URL
}; 
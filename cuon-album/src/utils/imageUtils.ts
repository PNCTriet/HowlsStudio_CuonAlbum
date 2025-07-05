/**
 * Utility functions for handling image URLs with Unicode characters
 */

export function encodeImageUrl(url: string): string {
  try {
    // Split the URL into parts
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
/**
 * Application Configuration
 * 
 * To switch between modes:
 * - Set USE_SUPABASE = true for Supabase storage (reads from tags.json)
 * - Set USE_SUPABASE = false for local photos (reads from /public/photos directory)
 */

export const AppConfig = {
  // Photo Storage Configuration
  USE_SUPABASE: true,
  
  // Supabase Configuration
  SUPABASE_BASE_URL: "https://cimvwqfnbrikogsyaqic.supabase.co/storage/v1/object/public/test/",
  
  // Supabase Transformations for different image qualities
  SUPABASE_TRANSFORMATIONS: {
    // Preview: very low resolution for fast loading in modals
    PREVIEW: {
      width: 300,
      height: 225,
      quality: 40,
      format: 'webp'
    },
    // Thumbnail: very low resolution for grid
    THUMBNAIL: {
      width: 150,
      height: 112,
      quality: 30,
      format: 'webp'
    },
    // Full: original resolution for download
    FULL: {
      quality: 100
    }
  },
  
  // Local Configuration
  LOCAL_PHOTOS_DIR: "/public/photos",
  LOCAL_AVATARS_DIR: "/public/avatars",
  
  // Tags Configuration
  TAGS_FILE_PATH: "/public/data/tags_local.json",
  
  // Debug Configuration
  SHOW_CONFIG_BADGE: true,
  LOG_LOADING_INFO: true
};

// Helper function to get current mode description
export function getCurrentMode() {
  return AppConfig.USE_SUPABASE ? 'SUPABASE' : 'LOCAL';
}

// Helper function to get mode description
export function getModeDescription() {
  if (AppConfig.USE_SUPABASE) {
    return 'Using Supabase storage - photos loaded from tags.json';
  } else {
    return 'Using local storage - photos loaded from /public/photos directory';
  }
} 
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StorageService, TagData } from '@/services/storageService';
import SaveNotification from '@/components/SaveNotification';
import ClearData from '@/components/ClearData';
import PhotoGridItem from '@/components/PhotoGridItem';
import PhotoDetailModal from '@/components/PhotoDetailModal';
import AvatarList from '@/components/AvatarList';
import QualityInfo from '@/components/QualityInfo';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';
import { AppConfig } from '@/config/appConfig';
import { 
  IconSearch, 
  IconDownload, 
  IconUser,
  IconPhoto,
  IconCheck,
  IconMessage,
  IconHeart,
  IconSchool
} from '@tabler/icons-react';

// Đặt normalizeAvatarPath lên đầu file, trước mọi useMemo
const normalizeAvatarPath = (path: string): string => {
  // Đảm bảo path luôn có prefix đúng (không cần Unicode normalization nữa vì đã chuyển sang không dấu)
  if (!path) return '';
  let norm = path;
  if (!norm.startsWith('/avatars/')) {
    norm = '/avatars/' + norm.replace(/^\/?avatars\//, '');
  }
  return norm;
};

const HomePage: React.FC = () => {
  const [avatarPaths, setAvatarPaths] = useState<string[]>([]);
  const [tags, setTags] = useState<TagData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatars, setSelectedAvatars] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<string[]>([]);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDownloadReminder, setShowDownloadReminder] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [stats, setStats] = useState({ totalPhotos: 0, taggedPhotos: 0, totalTags: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [saveNotification, setSaveNotification] = useState({ message: '', isVisible: false });
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<string>('');
  const [avatarStats, setAvatarStats] = useState<Record<string, number>>({});

  // Load photo and avatar paths
  useEffect(() => {
    const loadPaths = async () => {
      try {
        console.log('=== CONFIG DEBUG ===');
        console.log('USE_SUPABASE:', AppConfig.USE_SUPABASE);
        console.log('Current mode:', AppConfig.USE_SUPABASE ? 'SUPABASE' : 'LOCAL');
        console.log('===================');
        
        // Load avatar paths first
        const avatarResponse = await fetch('/data/avatars.json');
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          // Normalize avatar paths to NFC and add prefix
          const avatarPathsWithPrefix = avatarData.map((avatar: string) => normalizeAvatarPath(avatar));
          console.log('Avatar paths loaded:', {
            original: avatarData.slice(0, 5),
            normalized: avatarPathsWithPrefix.slice(0, 5),
            total: avatarPathsWithPrefix.length
          });
          setAvatarPaths(avatarPathsWithPrefix);
        } else {
          console.error('Failed to load avatars.json');
        }

        // Load photo paths based on config
        if (AppConfig.USE_SUPABASE) {
          console.log('Loading photos in SUPABASE mode');
          // Load photo paths from tags.json (Supabase mode)
          const response = await fetch('/data/tags.json');
          if (response.ok) {
            const tagsData = await response.json();
            // Extract photo names and convert to paths
            const photoPathsFromTags = Object.keys(tagsData).map(photoName => `/photos/${photoName}`);
            
            console.log('Supabase mode: Loaded', photoPathsFromTags.length, 'photos from tags.json');
            setFilteredPhotos(photoPathsFromTags); // Set filteredPhotos for pagination
          } else {
            console.error('Failed to load tags.json');
            setShowBackupModal(true);
          }
        } else {
          console.log('Loading photos in LOCAL mode');
          // Load photo paths from tags_local.json (local mode)
          const response = await fetch('/data/tags_local.json');
          if (response.ok) {
            const tagsData = await response.json();
            // Extract photo paths directly (already in /photos/ format)
            const photoPathsFromTags = Object.keys(tagsData);
            
            console.log('Local mode: Loaded', photoPathsFromTags.length, 'photos from tags_local.json');
            
            // Filter to only include photos that actually exist (local mode only)
            const existingPhotoPaths = await filterExistingPhotos(photoPathsFromTags);
            setFilteredPhotos(existingPhotoPaths); // Set filteredPhotos for pagination
          } else {
            console.error('Failed to load tags_local.json');
          }
        }
      } catch (error) {
        console.error('Failed to load paths:', error);
      }
    };

    // Helper function to filter existing photos
    const filterExistingPhotos = async (photoPaths: string[]): Promise<string[]> => {
      const existingPhotos: string[] = [];
      
      for (const photoPath of photoPaths) {
        try {
          const response = await fetch(photoPath, { method: 'HEAD' });
          if (response.ok) {
            existingPhotos.push(photoPath);
          }
        } catch {
          // Photo doesn't exist, skip it
        }
      }
      
      return existingPhotos;
    };

    loadPaths();
  }, []);

  // Load tags and stats when photoPaths change
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedTags, loadedStats, loadedAvatarStats] = await Promise.all([
          StorageService.loadTags(),
          StorageService.getPhotoStats(),
          StorageService.getAvatarStats()
        ]);
        
        // Normalize avatar paths in loaded tags to match avatarPaths format
        const normalizedTags: TagData = {};
        Object.entries(loadedTags).forEach(([photoPath, avatarPathsInTags]) => {
          normalizedTags[photoPath] = avatarPathsInTags.map(avatarPath => {
            // If avatar path doesn't start with /avatars/, add it
            if (!avatarPath.startsWith('/avatars/')) {
              return `/avatars/${avatarPath}`;
            }
            return avatarPath;
          });
        });
        
        setTags(normalizedTags);
        setStats({ ...loadedStats, totalPhotos: Object.keys(normalizedTags).length });
        setAvatarStats(loadedAvatarStats);
        
        console.log('Data loaded:', {
          tagsCount: Object.keys(normalizedTags).length,
          stats: loadedStats,
          avatarStatsCount: Object.keys(loadedAvatarStats).length,
          sampleTags: Object.entries(normalizedTags).slice(0, 2).map(([photo, avatars]) => ({
            photo,
            avatars: avatars.slice(0, 3)
          }))
        });
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []); // Remove dependency on photoPaths.length

  // Memoize expensive operations
  const memoizedPhotoAvatars = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.keys(tags).forEach(tagsKey => {
      // Convert tagsKey to photoPath format
      const photoPath = AppConfig.USE_SUPABASE ? `/photos/${tagsKey}` : tagsKey;
      result[photoPath] = (tags[tagsKey] || []).map(avatarPath => {
        // Always normalize avatar path to /avatars/xxx.png with Unicode normalization
        return normalizeAvatarPath(avatarPath);
      });
    });
    return result;
  }, [tags]);

  // Create reverse mapping: avatar -> photos for better performance
  const memoizedAvatarToPhotos = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.entries(tags).forEach(([tagsKey, avatarPaths]) => {
      // Convert tagsKey to photoPath format consistently
      const photoPath = AppConfig.USE_SUPABASE ? `/photos/${tagsKey}` : tagsKey;
      
      avatarPaths.forEach(avatarPath => {
        // Always normalize avatar path to /avatars/xxx.png with Unicode normalization
        const normalized = normalizeAvatarPath(avatarPath);
        result[normalized] = result[normalized] || [];
        result[normalized].push(photoPath);
      });
    });
    return result;
  }, [tags]);

  const memoizedPhotoAvatarsForDisplay = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.keys(tags).forEach(tagsKey => {
      // Convert tagsKey to photoPath format
      const photoPath = AppConfig.USE_SUPABASE ? `/photos/${tagsKey}` : tagsKey;
      result[photoPath] = (tags[tagsKey] || []).map(avatar => encodeImageUrl(avatar));
    });
    return result;
  }, [tags]);

  // Filter photos based on search and selected avatars
  const filteredPhotosMemo = useMemo(() => {
    // Get photo paths from tags, ensuring they all have /photos/ prefix
    let photoPaths = Object.keys(tags);
    
    // In Supabase mode, keys are just filenames, need to add /photos/ prefix
    // In local mode, keys already have /photos/ prefix
    if (AppConfig.USE_SUPABASE) {
      photoPaths = photoPaths.map(filename => `/photos/${filename}`);
    }
    
    let filtered = photoPaths;
    
    console.log('Filter debug:', {
      totalPhotos: filtered.length,
      searchTerm,
      selectedAvatars: selectedAvatars.length,
      tagsKeys: Object.keys(tags).slice(0, 5), // First 5 for debug
      mode: AppConfig.USE_SUPABASE ? 'SUPABASE' : 'LOCAL'
    });

    // Filter by search term (avatar name or photo name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // First try to find avatars that match the search term
      const matchingAvatars = avatarPaths.filter(avatar => 
        getImageDisplayName(avatar).toLowerCase().includes(searchLower)
      );
      console.log('Search debug:', { searchTerm, matchingAvatars: matchingAvatars.length });
      
      if (matchingAvatars.length > 0) {
        // If avatars found, filter photos by those avatars using memoizedAvatarToPhotos
        const matchingPhotoSets = matchingAvatars.map(avatar => {
          const normAvatar = normalizeAvatarPath(avatar);
          return memoizedAvatarToPhotos[normAvatar] || [];
        });
        
        // Get intersection of all matching photo sets
        if (matchingPhotoSets.length > 0) {
          const firstSet = new Set(matchingPhotoSets[0]);
          const intersection = matchingPhotoSets.slice(1).reduce((acc, photoSet) => {
            return new Set([...acc].filter(photo => photoSet.includes(photo)));
          }, firstSet);
          filtered = filtered.filter(photo => intersection.has(photo));
        }
      } else {
        // If no avatars found, search in photo names
        filtered = filtered.filter(photoPath => 
          photoPath.toLowerCase().includes(searchLower)
        );
      }
    }
    
    // Filter by selected avatars using memoizedAvatarToPhotos
    if (selectedAvatars.length > 0) {
      console.log('Avatar filter debug:', { selectedAvatars });
      
      const selectedPhotoSets = selectedAvatars.map(avatar => {
        const normAvatar = normalizeAvatarPath(avatar);
        return memoizedAvatarToPhotos[normAvatar] || [];
      });
      
      // Get intersection of all selected avatar photo sets
      if (selectedPhotoSets.length > 0) {
        const firstSet = new Set(selectedPhotoSets[0]);
        const intersection = selectedPhotoSets.slice(1).reduce((acc, photoSet) => {
          return new Set([...acc].filter(photo => photoSet.includes(photo)));
        }, firstSet);
        filtered = filtered.filter(photo => intersection.has(photo));
      }
    }
    
    console.log('Filter result:', { filteredCount: filtered.length });
    return filtered;
  }, [searchTerm, selectedAvatars, tags, avatarPaths, memoizedAvatarToPhotos]);

  // Update filtered photos when memoized result changes
  useEffect(() => {
    setFilteredPhotos(filteredPhotosMemo);
  }, [filteredPhotosMemo]);

  const handlePhotoClick = useCallback((photoPath: string) => {
    setSelectedPhotoForDetail(photoPath);
    setShowPhotoDetail(true);
  }, []);

  const handlePhotoChange = useCallback((photoPath: string) => {
    setSelectedPhotoForDetail(photoPath);
  }, []);

  const handleAvatarClick = useCallback((avatarPath: string) => {
    setSelectedAvatars(prev => 
      prev.includes(avatarPath) 
        ? prev.filter(avatar => avatar !== avatarPath)
        : [...prev, avatarPath]
    );
    setSearchTerm('');
  }, []);

  const handleClearAvatarFilter = useCallback(() => {
    setSelectedAvatars([]);
    setSearchTerm('');
  }, []);

  const handlePhotoSelect = useCallback((photoPath: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoPath) 
        ? prev.filter(p => p !== photoPath)
        : [...prev, photoPath]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPhotos(filteredPhotos);
  }, [filteredPhotos]);

  const handleClearSelection = useCallback(() => {
    setSelectedPhotos([]);
  }, []);

  const handleDownload = useCallback(async () => {
    if (selectedPhotos.length === 0) return;
    setShowDownloadReminder(true);
  }, [selectedPhotos.length]);

  const confirmDownload = useCallback(async () => {
    try {
      // Create feedback data
      const feedback = {
        timestamp: new Date().toISOString(),
        message: feedbackMessage,
        photoCount: selectedPhotos.length,
        totalSize: selectedPhotos.length * 12 * 1024 * 1024
      };

      // Save feedback
      await StorageService.saveFeedback(feedback);
      setSaveNotification({ message: 'Feedback saved to file successfully!', isVisible: true });

      // Use the new download functionality
      if (AppConfig.USE_SUPABASE) {
        // For Supabase, use the new downloadMultipleImages function
        const { downloadMultipleImages } = await import('@/utils/imageUtils');
        await downloadMultipleImages(selectedPhotos);
      } else {
        // For local photos, use the old method
        for (const photoPath of selectedPhotos) {
          const link = document.createElement('a');
          link.href = photoPath;
          link.download = photoPath.split('/').pop() || 'photo.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Add delay to prevent browser blocking
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setShowDownloadModal(false);
      setSelectedPhotos([]);
      setFeedbackMessage('');
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedPhotos, feedbackMessage]);

  const getPhotoAvatars = useCallback((photoPath: string) => {
    return memoizedPhotoAvatars[photoPath] || [];
  }, [memoizedPhotoAvatars]);

  const getPhotoAvatarsForDisplay = useCallback((photoPath: string) => {
    return memoizedPhotoAvatarsForDisplay[photoPath] || [];
  }, [memoizedPhotoAvatarsForDisplay]);

  // Pagination logic with lazy loading - APPEND instead of replace
  const PHOTOS_PER_PAGE = 24; // Reduced for better performance
  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE);
  
  // Show ALL photos up to current page (append mode)
  const allPhotosToShow = filteredPhotos.slice(0, currentPage * PHOTOS_PER_PAGE);

  // Lazy loading state
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Lazy loading with Intersection Observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && currentPage < totalPages && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate loading delay for better UX
          setTimeout(() => {
            setCurrentPage(prev => prev + 1);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [currentPage, totalPages, isLoadingMore]);

  // Track loaded photos
  const handleImageLoad = useCallback((photoPath: string, encodedPath: string) => {
    // setLoadedPhotos(prev => new Set(prev).add(photoPath)); // This line is removed as per the new_code
    console.log('Image loaded successfully:', {
      original: photoPath,
      encoded: encodedPath,
      filename: photoPath.split('/').pop()
    });
  }, []);

  const handleImageError = useCallback((photoPath: string, encodedPath: string) => {
    console.error('Image failed to load:', {
      original: photoPath,
      encoded: encodedPath,
      filename: photoPath.split('/').pop(),
      isAvatar: photoPath.includes('/avatars/'),
      avatarPath: photoPath.includes('/avatars/') ? photoPath : null
    });
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPhotos]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 
            className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => setShowGraduationModal(true)}
          >
            <IconSchool size={24} className="text-blue-400" />
            Cuốn Album
            <IconHeart size={16} className="text-red-400 animate-pulse" />
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Hidden Tag Page Button - Commented out as requested
            <a
              href="/tag"
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm w-full sm:w-auto text-center"
            >
              Go to Tag Page
            </a>
            */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-1 sm:gap-2">
                <IconPhoto size={14} className="sm:w-4 sm:h-4" />
                <span>{stats.totalPhotos} photos</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <IconUser size={14} className="sm:w-4 sm:h-4" />
                <span>{stats.taggedPhotos} tagged</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <IconCheck size={14} className="sm:w-4 sm:h-4" />
                <span>{stats.totalTags} tags</span>
              </div>
              {AppConfig && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${AppConfig.USE_SUPABASE ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {AppConfig.USE_SUPABASE ? 'SUPABASE' : 'LOCAL'}
                  </span>
                </div>
              )}
            </div>
            <ClearData />
          </div>
        </div>
        {/* Quality Info */}
        <div className="mt-2">
          <QualityInfo />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by avatar name or photo name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={selectedPhotos.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          >
            <IconDownload size={16} />
            <span className="hidden sm:inline">Download</span>
            <span>({selectedPhotos.length})</span>
          </button>
        </div>

        {/* Selection Controls */}
        {filteredPhotos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Select All ({filteredPhotos.length})
            </button>
            <button
              onClick={handleClearSelection}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Avatar List */}
        <AvatarList
          avatars={avatarPaths}
          selectedAvatars={selectedAvatars}
          onAvatarClick={handleAvatarClick}
          onClearFilter={handleClearAvatarFilter}
          avatarToPhotos={memoizedAvatarToPhotos}
          avatarStats={avatarStats}
        />
      </div>

      {/* Photo Grid */}
      <div className="px-4 sm:px-6 pb-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading photos...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchTerm 
                ? `No photos found for &quot;${searchTerm}&quot;`
                : "No photos found matching your criteria."
              }
            </p>
            {searchTerm && (
              <p className="text-gray-500 text-sm mt-2">
                Try searching for a different avatar name or photo name
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {allPhotosToShow.map((photoPath) => {
                const photoAvatars = getPhotoAvatars(photoPath);
                const photoAvatarsForDisplay = getPhotoAvatarsForDisplay(photoPath);
                const isSelected = selectedPhotos.includes(photoPath);
                
                return (
                  <PhotoGridItem
                    key={photoPath}
                    photoPath={photoPath}
                    photoAvatars={photoAvatars}
                    photoAvatarsForDisplay={photoAvatarsForDisplay}
                    isSelected={isSelected}
                    onPhotoClick={handlePhotoClick}
                    onPhotoSelect={handlePhotoSelect}
                    onImageLoad={handleImageLoad}
                    onImageError={handleImageError}
                  />
                );
              })}
            </div>

            {/* Loading indicator for lazy loading */}
            {isLoadingMore && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Loading more photos...</span>
                </div>
              </div>
            )}

            {/* Load more trigger */}
            {currentPage < totalPages && !isLoadingMore && (
              <div className="flex justify-center mt-8">
                <div 
                  ref={loadMoreRef}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <span>Scroll to load more</span>
                </div>
              </div>
            )}

            {/* Page Info */}
            {filteredPhotos.length > 0 && (
              <div className="text-center mt-4 text-gray-400 text-xs sm:text-sm">
                {searchTerm && (
                  <div className="mb-2">
                    <span className="text-blue-400">Search results for &quot;{searchTerm}&quot;:</span>
                  </div>
                )}
                Showing {allPhotosToShow.length} of {filteredPhotos.length} photos
                {currentPage < totalPages && (
                  <div className="mt-1">
                    <span className="text-gray-500">(Scroll to load more)</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Download Reminder Modal */}
      {showDownloadReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">🎓 Chúc mừng tốt nghiệp!</h3>
            
            <div className="space-y-4">
              <div className="text-gray-300">
                <p className="mb-3">Chúc mừng bạn đã hoàn thành chặng đường học tập! 🎉</p>
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm">
                    <strong>💡 Lưu ý:</strong> Hệ thống download được tối ưu tốt nhất trên laptop/desktop. 
                    Trên điện thoại có thể chậm hơn do giới hạn của trình duyệt.
                  </p>
                </div>
                <p className="mt-3 text-sm">
                  Bạn có muốn tiếp tục download {selectedPhotos.length} ảnh không?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDownloadReminder(false);
                    setShowDownloadModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Tiếp tục Download
                </button>
                <button
                  onClick={() => setShowDownloadReminder(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Download</h3>
            
            <div className="space-y-4">
              <div className="text-gray-300">
                <p>You&apos;re about to download {selectedPhotos.length} photos</p>
                <p>Estimated size: ~{Math.round(selectedPhotos.length * 12)} MB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <IconMessage size={16} className="inline mr-1" />
                  Message for Developer Bánh Cuốn (optional)
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Any suggestions or feedback..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmDownload}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Save Notification */}
      <SaveNotification
        message={saveNotification.message}
        isVisible={saveNotification.isVisible}
        onClose={() => setSaveNotification({ message: '', isVisible: false })}
      />
      
      {/* Photo Detail Modal */}
      {(() => {
        const photoAvatars = getPhotoAvatars(selectedPhotoForDetail);
        const photoAvatarsForDisplay = getPhotoAvatarsForDisplay(selectedPhotoForDetail);
        
        console.log('PhotoDetailModal debug:', {
          selectedPhotoForDetail,
          photoAvatars,
          photoAvatarsForDisplay,
          photoAvatarsLength: photoAvatars.length,
          photoAvatarsForDisplayLength: photoAvatarsForDisplay.length
        });
        
        return (
          <PhotoDetailModal
            isOpen={showPhotoDetail}
            onClose={() => setShowPhotoDetail(false)}
            photoPath={selectedPhotoForDetail}
            photoAvatars={photoAvatars}
            photoAvatarsForDisplay={photoAvatarsForDisplay}
            allPhotos={filteredPhotos}
            onPhotoChange={handlePhotoChange}
            avatarToPhotosMap={memoizedAvatarToPhotos}
          />
        );
      })()}

      {/* Graduation Modal */}
      {showGraduationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-blue-500/30">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <IconSchool size={48} className="text-yellow-400" />
                <IconHeart size={32} className="text-red-400 animate-pulse ml-2" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                🎓 Mừng các em tốt nghiệp! 🎉
              </h3>
              
              <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm font-medium">
                  ✨ Chúc các em luôn mạnh mẽ, kiên cường và thành công trên mọi chặng đường phía trước! ✨
                </p>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Cuốn rất vui vì đã có cơ hội lưu lại cột mốc tươi đẹp này của em.{' '} đừng quên tag{' '}
                  <a 
                    href="https://www.instagram.com/banhcuonniengrang/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 font-semibold hover:text-blue-200 underline"
                  >
                    @banhcuonniengrang
                  </a>{' '}
                  trên story để cùng chia sẻ niềm vui này nhé xốp ~ 💕
                </p>
              </div>
              <button
                onClick={() => setShowGraduationModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                💖💖💖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">⚠️ Không thể tải dữ liệu</h3>
            
            <div className="space-y-4">
              <div className="text-gray-300">
                <p className="mb-3">Xin lỗi, hệ thống không thể tải được dữ liệu ảnh. Có thể do:</p>
                <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                  <li>Kết nối mạng không ổn định</li>
                  <li>Hệ thống đang bảo trì</li>
                  <li>Dữ liệu tạm thời không khả dụng</li>
                </ul>
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    <strong>💾 Backup:</strong> Bạn có thể truy cập ảnh qua Google Drive backup:
                  </p>
                  <a 
                    href="#" 
                    className="text-blue-400 hover:text-blue-300 underline text-sm block mt-2"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Link Google Drive sẽ được cập nhật sau!');
                    }}
                  >
                    🔗 Link Google Drive Backup (Sẽ cập nhật)
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 
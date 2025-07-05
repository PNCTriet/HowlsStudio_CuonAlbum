'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StorageService, TagData } from '@/services/storageService';
import SaveNotification from '@/components/SaveNotification';
import ClearData from '@/components/ClearData';
import PhotoGridItem from '@/components/PhotoGridItem';
import PhotoDetailModal from '@/components/PhotoDetailModal';
import AvatarList from '@/components/AvatarList';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';
import { 
  IconSearch, 
  IconDownload, 
  IconFilter, 
  IconX, 
  IconUser,
  IconPhoto,
  IconCheck,
  IconMessage
} from '@tabler/icons-react';

interface HomePageProps {
  photoPaths: string[];
  avatarPaths: string[];
}

const HomePage: React.FC<HomePageProps> = ({ photoPaths, avatarPaths }) => {
  const [tags, setTags] = useState<TagData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatars, setSelectedAvatars] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<string[]>(photoPaths);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [stats, setStats] = useState({ totalPhotos: 0, taggedPhotos: 0, totalTags: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [saveNotification, setSaveNotification] = useState({ message: '', isVisible: false });

  const [currentPage, setCurrentPage] = useState(1);
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<string>('');

  // Memoize expensive operations
  const memoizedPhotoAvatars = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.keys(tags).forEach(photoPath => {
      result[photoPath] = tags[photoPath] || [];
    });
    return result;
  }, [tags]);

  const memoizedPhotoAvatarsForDisplay = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.keys(tags).forEach(photoPath => {
      result[photoPath] = (tags[photoPath] || []).map(avatar => encodeImageUrl(avatar));
    });
    return result;
  }, [tags]);

  // Load tags and stats on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedTags, loadedStats] = await Promise.all([
          StorageService.loadTags(),
          StorageService.getPhotoStats()
        ]);
        setTags(loadedTags);
        setStats({ ...loadedStats, totalPhotos: photoPaths.length });
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [photoPaths.length]);

  // Optimized filter photos based on search
  const filteredPhotosMemo = useMemo(() => {
    let filtered = photoPaths;

    // Filter by search term (avatar name or photo name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // First try to find avatars that match the search term
      const matchingAvatars = avatarPaths.filter(avatar => 
        getImageDisplayName(avatar).toLowerCase().includes(searchLower)
      );
      if (matchingAvatars.length > 0) {
        // If avatars found, filter photos by those avatars
        filtered = filtered.filter(photo => {
          const photoTags = memoizedPhotoAvatars[photo] || [];
          return matchingAvatars.some(avatar => photoTags.includes(avatar));
        });
      } else {
        // If no avatars found, search in photo names
        filtered = filtered.filter(photo => 
          photo.toLowerCase().includes(searchLower)
        );
      }
    }
    // Filter by selected avatars
    if (selectedAvatars.length > 0) {
      filtered = filtered.filter(photo => {
        const photoTags = memoizedPhotoAvatars[photo] || [];
        return selectedAvatars.some(avatar => photoTags.includes(avatar));
      });
    }
    return filtered;
  }, [searchTerm, selectedAvatars, memoizedPhotoAvatars, photoPaths, avatarPaths]);

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
    setShowDownloadModal(true);
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

      // Download photos (simulate - in real app you'd need server-side download)
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

      setShowDownloadModal(false);
      setSelectedPhotos([]);
      setFeedbackMessage('');
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [selectedPhotos, feedbackMessage]);

  const getPhotoAvatars = useCallback((photoPath: string) => {
    return memoizedPhotoAvatars[photoPath] || [];
  }, [memoizedPhotoAvatars]);

  const getPhotoAvatarsForDisplay = useCallback((photoPath: string) => {
    return memoizedPhotoAvatarsForDisplay[photoPath] || [];
  }, [memoizedPhotoAvatarsForDisplay]);

  const getAvatarName = useCallback((avatarPath: string) => {
    return getImageDisplayName(avatarPath);
  }, []);

  // Pagination logic
  const PHOTOS_PER_PAGE = 60;
  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE);
  const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE;
  const endIndex = startIndex + PHOTOS_PER_PAGE;
  const currentPhotos = filteredPhotos.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPhotos]);

  // Debug function to check image loading
  const handleImageError = useCallback((photoPath: string, encodedPath: string) => {
    console.error('Image failed to load:', {
      original: photoPath,
      encoded: encodedPath,
      filename: photoPath.split('/').pop()
    });
  }, []);

  const handleImageLoad = useCallback((photoPath: string, encodedPath: string) => {
    console.log('Image loaded successfully:', {
      original: photoPath,
      encoded: encodedPath,
      filename: photoPath.split('/').pop()
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Bánh Cuốn Gallery</h1>
          <div className="flex items-center gap-4">
            <a
              href="/tag"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              Go to Tag Page
            </a>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <IconPhoto size={16} />
                <span>{stats.totalPhotos} photos</span>
              </div>
              <div className="flex items-center gap-2">
                <IconUser size={16} />
                <span>{stats.taggedPhotos} tagged</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck size={16} />
                <span>{stats.totalTags} tags</span>
              </div>
            </div>
            <ClearData />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6">
        <div className="flex gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by avatar name or photo name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>



          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={selectedPhotos.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <IconDownload size={16} />
            Download ({selectedPhotos.length})
          </button>


        </div>

        {/* Selection Controls */}
        {filteredPhotos.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
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
          photoAvatars={memoizedPhotoAvatars}
        />
      </div>

      {/* Photo Grid */}
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading photos...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchTerm 
                ? `No photos found for "${searchTerm}"`
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentPhotos.map((photoPath) => {
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Page Info */}
            {filteredPhotos.length > 0 && (
              <div className="text-center mt-4 text-gray-400 text-sm">
                {searchTerm && (
                  <div className="mb-2">
                    <span className="text-blue-400">Search results for "{searchTerm}":</span>
                  </div>
                )}
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPhotos.length)} of {filteredPhotos.length} photos
              </div>
            )}
          </>
        )}
      </div>



      {/* Download Confirmation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Download</h3>
            
            <div className="space-y-4">
              <div className="text-gray-300">
                <p>You're about to download {selectedPhotos.length} photos</p>
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
      <PhotoDetailModal
        isOpen={showPhotoDetail}
        onClose={() => setShowPhotoDetail(false)}
        photoPath={selectedPhotoForDetail}
        photoAvatars={getPhotoAvatars(selectedPhotoForDetail)}
        photoAvatarsForDisplay={getPhotoAvatarsForDisplay(selectedPhotoForDetail)}
        allPhotos={filteredPhotos}
        onPhotoChange={handlePhotoChange}
        avatarToPhotosMap={memoizedPhotoAvatars}
      />
    </div>
  );
};

export default HomePage; 
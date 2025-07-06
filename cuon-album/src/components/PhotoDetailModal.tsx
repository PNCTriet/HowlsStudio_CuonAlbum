'use client';

import React, { useState, useEffect } from 'react';
import { encodeImageUrl, getImageDisplayName, downloadImage } from '@/utils/imageUtils';
import { IconX, IconDownload, IconUser, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PhotoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoPath: string;
  photoAvatars: string[];
  photoAvatarsForDisplay: string[];
  avatarToPhotosMap?: Record<string, string[]>; // avatarPath -> photoPaths
  allPhotos?: string[]; // All photos for navigation
  onPhotoChange?: (photoPath: string) => void; // Callback when photo changes
}

const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  isOpen,
  onClose,
  photoPath,
  photoAvatars,
  photoAvatarsForDisplay,
  avatarToPhotosMap = {},
  allPhotos = [],
  onPhotoChange,
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState<null | {avatar: string, photos: string[]}>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Lock scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Use thumbnail quality for display (faster loading)
  const encodedPhotoPath = encodeImageUrl(photoPath, 'thumbnail');
  const fileName = photoPath.split('/').pop() || 'Unknown';

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const confirmDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Download the photo using full resolution
      await downloadImage(photoPath, fileName);

      setShowDownloadModal(false);
      
      // Show success message
      alert('Download completed successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Download failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const currentIndex = allPhotos.indexOf(photoPath);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allPhotos.length - 1;

  const handlePrevious = () => {
    if (hasPrevious && onPhotoChange) {
      onPhotoChange(allPhotos[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onPhotoChange) {
      onPhotoChange(allPhotos[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && hasPrevious) {
      handlePrevious();
    } else if (e.key === 'ArrowRight' && hasNext) {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={{
          position: 'relative',
          width: '90vw',
          height: '90vh',
          minWidth: 320,
          maxWidth: '98vw',
          maxHeight: '98vh',
          padding: '0',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{padding: '5%'}} className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-xs sm:text-sm font-semibold text-white truncate flex-1">
              {fileName} ({currentIndex + 1} of {allPhotos.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                <IconDownload size={16} />
                <span className="hidden sm:inline">Download Full Res</span>
                <span className="sm:hidden">Download</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 sm:p-1"
                style={{ minWidth: 36, minHeight: 36 }}
              >
                <IconX size={24} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Photo */}
            <div className="flex items-center justify-center relative min-h-0 px-16 mb-6">
              <img
                src={encodedPhotoPath}
                alt={fileName}
                className="max-w-[125%] max-h-[80vh] sm:max-w-[45%] sm:max-h-[45vh] object-scale-down rounded"
                onError={(e) => {
                  console.error('Failed to load photo in modal:', photoPath);
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Navigation Buttons - Absolute positioned, no layout impact */}
              {allPhotos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white p-1 sm:p-2 rounded-full transition-colors"
                  >
                    <IconChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white p-1 sm:p-2 rounded-full transition-colors"
                  >
                    <IconChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Info Section */}
            <div className="border-t border-gray-700 pt-4 flex-shrink-0">
              {/* File Info */}
              <div className="mb-3 sm:mb-4">
                <h4 className="text-white font-semibold mb-2 text-xs sm:text-sm">File Information</h4>
                <div className="text-gray-300 text-xs sm:text-sm space-y-1">
                  <div><strong>Name:</strong> {fileName}</div>
                  <div><strong>Avatar Tags:</strong> {photoAvatars.length}</div>
                  <div><strong>Display:</strong> Thumbnail Quality (Fast Loading)</div>
                  <div><strong>Download:</strong> Full Resolution</div>
                </div>
              </div>

              {/* Avatar Tags */}
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-1 text-xs sm:text-sm">
                  <IconUser size={12} className="sm:w-3.5 sm:h-3.5" />
                  Avatar Tags ({photoAvatars.length})
                </h4>
                {photoAvatars.length > 0 ? (
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {photoAvatars.map((avatarPath, index) => {
                      const encodedAvatarPath = photoAvatarsForDisplay[index];
                      return (
                        <button
                          key={avatarPath}
                          className="flex flex-col items-center justify-center focus:outline-none w-12 h-12 sm:w-16 sm:h-16"
                          title={getImageDisplayName(avatarPath)}
                          onClick={() => {
                            if (avatarToPhotosMap[avatarPath]) {
                              setShowAvatarModal({avatar: avatarPath, photos: avatarToPhotosMap[avatarPath]});
                            }
                          }}
                        >
                          <img
                            src={encodedAvatarPath}
                            alt={getImageDisplayName(avatarPath)}
                            className="w-full h-full rounded-full object-cover border-2 sm:border-4 border-blue-500"
                            onError={(e) => {
                              console.error('Failed to load avatar in modal:', avatarPath);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs sm:text-sm italic">
                    No avatar tags for this photo
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Confirmation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2" onClick={() => setShowDownloadModal(false)}>
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Download</h3>
            
            <div className="space-y-4">
              <div className="text-gray-300 text-sm">
                <p><strong>File:</strong> {fileName}</p>
                <p><strong>Quality:</strong> Full Resolution</p>
                <p><strong>Size:</strong> ~12 MB</p>
                <p><strong>Avatar Tags:</strong> {photoAvatars.length}</p>
              </div>



              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={confirmDownload}
                  disabled={isDownloading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <IconDownload size={16} />
                      <span className="hidden sm:inline">Download Full Res</span>
                      <span className="sm:hidden">Download</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  disabled={isDownloading}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Photo List Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2" onClick={() => setShowAvatarModal(null)}>
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-4 sm:p-6 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={showAvatarModal.avatar}
                  alt={getImageDisplayName(showAvatarModal.avatar)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-500"
                />
              </div>
              <button onClick={() => setShowAvatarModal(null)} className="text-gray-400 hover:text-white p-1">
                <IconX size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="max-h-[400px] sm:max-h-[480px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {showAvatarModal.photos.map(photo => (
                <div key={photo} className="flex flex-col items-center">
                  <img
                    src={encodeImageUrl(photo, 'thumbnail')}
                    alt={photo.split('/').pop()}
                    className="w-24 h-16 sm:w-36 sm:h-24 object-cover rounded border border-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoDetailModal; 
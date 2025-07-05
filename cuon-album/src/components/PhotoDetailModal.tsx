'use client';

import React, { useState } from 'react';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';
import { IconX, IconDownload, IconUser, IconChevronLeft, IconChevronRight, IconMessage } from '@tabler/icons-react';

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
  const [feedbackMessage, setFeedbackMessage] = useState('');
  if (!isOpen) return null;

  const encodedPhotoPath = encodeImageUrl(photoPath);
  const fileName = photoPath.split('/').pop() || 'Unknown';

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const confirmDownload = async () => {
    try {
      // Create feedback data
      const feedback = {
        timestamp: new Date().toISOString(),
        message: feedbackMessage,
        photoCount: 1,
        totalSize: 12 * 1024 * 1024, // 12MB per photo
        fileName: fileName,
        photoPath: photoPath
      };

      // Save feedback to API
      const response = await fetch('/api/save-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save feedback');
      }

      // Download the photo
      const link = document.createElement('a');
      link.href = encodedPhotoPath;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowDownloadModal(false);
      setFeedbackMessage('');
      
      // Show success message
      alert('Download completed and feedback saved successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Download failed: ${errorMessage}. Please try again.`);
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
      className="fixed inset-0 flex items-center justify-center z-50 p-2" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-white truncate">
            {fileName} ({currentIndex + 1} of {allPhotos.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
            >
              <IconDownload size={12} />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(70vh-40px)]">
          {/* Photo */}
          <div className="flex-1 p-4 relative">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={encodedPhotoPath}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded"
                style={{ maxHeight: '420px' }}
                onError={(e) => {
                  console.error('Failed to load photo in modal:', photoPath);
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              {/* Navigation Buttons */}
              {allPhotos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
                  >
                    <IconChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
                  >
                    <IconChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-4 border-t border-gray-700">
            {/* File Info */}
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2 text-sm">File Information</h4>
              <div className="text-gray-300 text-sm space-y-1">
                <div><strong>Name:</strong> {fileName}</div>
                <div><strong>Avatar Tags:</strong> {photoAvatars.length}</div>
              </div>
            </div>

            {/* Avatar Tags */}
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center gap-1 text-sm">
                <IconUser size={14} />
                Avatar Tags ({photoAvatars.length})
              </h4>
              {photoAvatars.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {photoAvatars.map((avatarPath, index) => {
                    const encodedAvatarPath = photoAvatarsForDisplay[index];
                    return (
                      <button
                        key={avatarPath}
                        className="flex flex-col items-center justify-center focus:outline-none w-16 h-16"
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
                          className="w-full h-full rounded-full object-cover border-4 border-blue-500"
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
                <div className="text-gray-400 text-sm italic">
                  No avatar tags for this photo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download Confirmation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setShowDownloadModal(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Download</h3>
            
            <div className="space-y-4">
              <div className="text-gray-300">
                <p><strong>File:</strong> {fileName}</p>
                <p><strong>Size:</strong> ~12 MB</p>
                <p><strong>Avatar Tags:</strong> {photoAvatars.length}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <IconMessage size={16} className="inline mr-1" />
                  Message for Developer (optional)
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

      {/* Avatar Photo List Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setShowAvatarModal(null)}>
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={showAvatarModal.avatar}
                  alt={getImageDisplayName(showAvatarModal.avatar)}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                />
              </div>
              <button onClick={() => setShowAvatarModal(null)} className="text-gray-400 hover:text-white"><IconX size={24} /></button>
            </div>
            <div className="max-h-[480px] overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4">
              {showAvatarModal.photos.map(photo => (
                <div key={photo} className="flex flex-col items-center">
                  <img
                    src={encodeImageUrl(photo)}
                    alt={photo.split('/').pop()}
                    className="w-36 h-24 object-cover rounded border border-gray-700"
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
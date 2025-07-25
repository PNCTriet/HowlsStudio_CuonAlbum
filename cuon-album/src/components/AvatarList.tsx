'use client';

import React from 'react';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';

interface AvatarListProps {
  avatars: string[];
  selectedAvatars: string[];
  onAvatarClick: (avatarPath: string) => void;
  onClearFilter: () => void;
  avatarToPhotos?: Record<string, string[]>; // Direct mapping for better performance
  avatarStats?: Record<string, number>; // Pre-calculated avatar statistics
}

const AvatarList: React.FC<AvatarListProps> = ({
  avatars,
  selectedAvatars,
  onAvatarClick,
  onClearFilter,
  avatarToPhotos = {},
  avatarStats = {}
}) => {
  // Helper function to normalize avatar path (handle Unicode encoding differences)
  const normalizeAvatarPath = (path: string): string => {
    let normalized = path;
    if (!normalized.startsWith('/avatars/')) {
      normalized = `/avatars/${normalized.replace(/^\/+/, '')}`;
    }
    // Normalize Unicode characters to handle different encodings
    return normalized.normalize('NFC');
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-300">Filter by Avatar:</span>
        {selectedAvatars.length > 0 && (
          <button
            onClick={onClearFilter}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Clear Filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {avatars.map((avatarPath) => {
          const isSelected = selectedAvatars.includes(avatarPath);
          const encodedAvatarPath = encodeImageUrl(avatarPath);
          
          // Count photos tagged with this avatar using the optimized mapping
          const normalizedAvatarPath = normalizeAvatarPath(avatarPath);
          const taggedPhotoCount = avatarStats[normalizedAvatarPath] || avatarToPhotos[normalizedAvatarPath]?.length || 0;
          
          return (
            <button
              key={avatarPath}
              onClick={() => onAvatarClick(avatarPath)}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
              }`}
            >
              <img
                src={encodedAvatarPath}
                alt={getImageDisplayName(avatarPath)}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  console.error('Failed to load avatar in list:', avatarPath);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium">
                  {getImageDisplayName(avatarPath)}
                </span>
                {taggedPhotoCount > 0 && (
                  <span className="text-xs text-gray-400">
                    {taggedPhotoCount} photo{taggedPhotoCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarList; 
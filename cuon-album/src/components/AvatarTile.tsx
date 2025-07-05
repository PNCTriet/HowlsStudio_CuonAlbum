'use client';

import React from 'react';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';

interface AvatarTileProps {
  avatarPath: string;
  isSelected: boolean;
  isSuggested?: boolean;
  onToggle: () => void;
}

const AvatarTile: React.FC<AvatarTileProps> = ({ avatarPath, isSelected, isSuggested = false, onToggle }) => {
  const fileName = getImageDisplayName(avatarPath);
  
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-12 rounded-full ring-2 transition-all duration-200 hover:scale-105 relative group ${
        isSelected 
          ? 'ring-red-500 ring-3 shadow-lg shadow-red-500/30' 
          : isSuggested
          ? 'ring-blue-400 ring-2 shadow-lg shadow-blue-400/30'
          : 'ring-gray-600 hover:ring-red-400'
      }`}
      title={fileName}
    >
      <img
        src={encodeImageUrl(avatarPath)}
        alt={`Avatar ${fileName}`}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          console.error('Failed to load avatar in AvatarTile:', avatarPath);
          e.currentTarget.style.display = 'none';
        }}
      />
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}
      {isSuggested && !isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">?</span>
        </div>
      )}
    </button>
  );
};

export default AvatarTile; 
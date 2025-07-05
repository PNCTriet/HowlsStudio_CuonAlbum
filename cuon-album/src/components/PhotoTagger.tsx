'use client';

import React from 'react';
import AvatarTile from './AvatarTile';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';
import { IconChevronLeft, IconChevronRight, IconCheck } from '@tabler/icons-react';

interface PhotoTaggerProps {
  photoPath: string;
  avatarPaths: string[];
  selectedAvatars: string[];
  suggestedAvatars: string[];
  onAvatarToggle: (avatarPath: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onApplySuggestions: () => void;
  onClearSuggestions: () => void;
  currentIndex: number;
  totalPhotos: number;
  hasChanges: boolean;
}

const PhotoTagger: React.FC<PhotoTaggerProps> = ({
  photoPath,
  avatarPaths,
  selectedAvatars,
  suggestedAvatars,
  onAvatarToggle,
  onPrevious,
  onNext,
  onSave,
  onApplySuggestions,
  onClearSuggestions,
  currentIndex,
  totalPhotos,
  hasChanges,
}) => {
  const fileName = getImageDisplayName(photoPath);
  const progress = ((currentIndex + 1) / totalPhotos) * 100;
  
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            Progress: {currentIndex + 1} / {totalPhotos}
          </span>
          <span className="text-sm font-medium text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Photo with Navigation */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="relative group">
          <img
            src={encodeImageUrl(photoPath)}
            alt={`Photo ${fileName}`}
            className="max-h-[60vh] w-full object-contain rounded-lg shadow-lg"
            onError={(e) => {
              console.error('Failed to load photo in PhotoTagger:', photoPath);
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* Navigation Overlay */}
          <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full ml-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === totalPhotos - 1}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full mr-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <IconChevronRight size={20} />
            </button>
          </div>
          
          {/* Photo Info */}
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {fileName}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <IconChevronLeft size={14} />
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === totalPhotos - 1}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              Next
              <IconChevronRight size={14} />
            </button>
          </div>
          
          <button
            onClick={onSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            <IconCheck size={14} />
            Save Progress
          </button>
        </div>
      </div>
      
      {/* Suggested Avatars */}
      {suggestedAvatars.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">
              Suggested Tags ({suggestedAvatars.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onApplySuggestions}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                Apply All
              </button>
              <button
                onClick={onClearSuggestions}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedAvatars.map((avatarPath) => (
              <AvatarTile
                key={avatarPath}
                avatarPath={avatarPath}
                isSelected={false}
                isSuggested={true}
                onToggle={() => onAvatarToggle(avatarPath)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Avatar checklist */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-200">
          Tagged Avatars ({selectedAvatars.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {avatarPaths.map((avatarPath) => (
            <AvatarTile
              key={avatarPath}
              avatarPath={avatarPath}
              isSelected={selectedAvatars.includes(avatarPath)}
              onToggle={() => onAvatarToggle(avatarPath)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoTagger; 
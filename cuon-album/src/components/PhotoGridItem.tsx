"use client";

import React, { memo } from "react";
import { encodeImageUrl, getImageDisplayName } from "@/utils/imageUtils";

const getAvatarName = (avatarPath: string) => {
  return getImageDisplayName(avatarPath);
};

interface PhotoGridItemProps {
  photoPath: string;
  photoAvatars: string[];
  photoAvatarsForDisplay: string[];
  isSelected: boolean;
  onPhotoClick: (photoPath: string) => void;
  onPhotoSelect: (photoPath: string) => void;
  onImageLoad?: (photoPath: string, encodedPath: string) => void;
  onImageError?: (photoPath: string, encodedPath: string) => void;
}

const PhotoGridItem = memo<PhotoGridItemProps>(
  ({
    photoPath,
    photoAvatars,
    photoAvatarsForDisplay,
    isSelected,
    onPhotoClick,
    onPhotoSelect,
    onImageLoad,
    onImageError,
  }) => {
    // Use thumbnail quality for faster loading in grid
    const encodedPhotoPath = encodeImageUrl(photoPath, 'thumbnail');

    return (
      <div
        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
          isSelected
            ? "border-blue-500"
            : "border-gray-700 hover:border-gray-600"
        }`}
        onClick={() => onPhotoClick(photoPath)}
      >
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2 z-30">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onPhotoSelect(photoPath);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Photo */}
        <img
          src={encodedPhotoPath}
          alt={photoPath.split("/").pop()}
          className="w-full h-48 object-cover group-hover:blur-sm group-hover:brightness-50 transition-all duration-200"
          onLoad={() => onImageLoad?.(photoPath, encodedPhotoPath)}
          onError={() => {
            onImageError?.(photoPath, encodedPhotoPath);
          }}
        />

        <div
          className="
    pointer-events-none absolute inset-0 z-10
    flex items-center justify-center
    bg-black/0 group-hover:bg-black/30 transition-colors
  "
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="text-white text-sm font-semibold drop-shadow-lg
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {photoAvatars.length} avatars
          </div>
        </div>

        {/* Avatar preview */}
        {photoAvatars.length > 0 && (
          <div className="absolute bottom-2 right-2 flex -space-x-1">
            {photoAvatarsForDisplay.slice(0, 3).map((avatar, index) => (
              <img
                key={photoAvatars[index]}
                src={avatar}
                alt={getAvatarName(photoAvatars[index])}
                className="w-6 h-6 rounded-full border border-white object-cover"
                onLoad={() => onImageLoad?.(photoAvatars[index], avatar)}
                onError={(e) => {
                  onImageError?.(photoAvatars[index], avatar);
                  e.currentTarget.style.display = "none";
                }}
              />
            ))}
            {photoAvatars.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-800 border border-white flex items-center justify-center">
                <span className="text-xs text-white">
                  +{photoAvatars.length - 3}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PhotoGridItem.displayName = "PhotoGridItem";

export default PhotoGridItem;

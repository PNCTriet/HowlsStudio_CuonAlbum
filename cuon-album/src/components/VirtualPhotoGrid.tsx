'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import PhotoGridItem from './PhotoGridItem';

interface VirtualPhotoGridProps {
  photos: string[];
  photoAvatars: Record<string, string[]>;
  photoAvatarsForDisplay: Record<string, string[]>;
  selectedPhotos: string[];
  onPhotoClick: (photoPath: string) => void;
  onPhotoSelect: (photoPath: string) => void;
  onImageLoad?: (photoPath: string, encodedPath: string) => void;
  onImageError?: (photoPath: string, encodedPath: string) => void;
}

const ITEM_HEIGHT = 200; // Height of each photo item
const ITEMS_PER_ROW = 6; // Number of items per row
const ROW_HEIGHT = ITEM_HEIGHT + 16; // Height of each row including gap

const VirtualPhotoGrid: React.FC<VirtualPhotoGridProps> = ({
  photos,
  photoAvatars,
  photoAvatarsForDisplay,
  selectedPhotos,
  onPhotoClick,
  onPhotoSelect,
  onImageLoad,
  onImageError
}) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate total height
  const totalHeight = useMemo(() => {
    const totalRows = Math.ceil(photos.length / ITEMS_PER_ROW);
    return totalRows * ROW_HEIGHT;
  }, [photos.length]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / ROW_HEIGHT);
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / ROW_HEIGHT) + 2, // Add buffer
      Math.ceil(photos.length / ITEMS_PER_ROW)
    );

    const startIndex = startRow * ITEMS_PER_ROW;
    const endIndex = Math.min(endRow * ITEMS_PER_ROW, photos.length);

    return { startIndex, endIndex, startRow, endRow };
  }, [scrollTop, containerHeight, photos.length]);

  // Get visible photos
  const visiblePhotos = useMemo(() => {
    return photos.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [photos, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Set container height on mount
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-300px)] overflow-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: visibleRange.startRow * ROW_HEIGHT,
            left: 0,
            right: 0
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {visiblePhotos.map((photoPath) => {
              const photoAvatarsList = photoAvatars[photoPath] || [];
              const photoAvatarsForDisplayList = photoAvatarsForDisplay[photoPath] || [];
              const isSelected = selectedPhotos.includes(photoPath);
              
              return (
                <PhotoGridItem
                  key={photoPath}
                  photoPath={photoPath}
                  photoAvatars={photoAvatarsList}
                  photoAvatarsForDisplay={photoAvatarsForDisplayList}
                  isSelected={isSelected}
                  onPhotoClick={onPhotoClick}
                  onPhotoSelect={onPhotoSelect}
                  onImageLoad={onImageLoad}
                  onImageError={onImageError}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualPhotoGrid; 
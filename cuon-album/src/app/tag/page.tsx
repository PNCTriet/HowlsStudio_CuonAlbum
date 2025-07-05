'use client';

import React, { useState, useEffect } from 'react';
import PhotoTagger from '@/components/PhotoTagger';
import BottomBar from '@/components/BottomBar';
import Sidebar from '@/components/Sidebar';
import SaveNotification from '@/components/SaveNotification';
import { StorageService, TagData } from '@/services/storageService';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';
import { IconMoon, IconSun, IconSettings } from '@tabler/icons-react';

interface TagPageProps {
  photoPaths: string[];
  avatarPaths: string[];
}

const TagPage: React.FC<TagPageProps> = ({ photoPaths, avatarPaths }) => {
  const [tagMap, setTagMap] = useState<TagData>({});
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedTagMap, setSavedTagMap] = useState<TagData>({});
  const [suggestedAvatars, setSuggestedAvatars] = useState<string[]>([]);
  const [saveNotification, setSaveNotification] = useState({ message: '', isVisible: false });

  // Load tags from localStorage on mount
  useEffect(() => {
    const loadTags = async () => {
      const loadedTags = await StorageService.loadTags();
      setTagMap(loadedTags);
      setSavedTagMap(loadedTags);
    };
    loadTags();
  }, []);

  // Update tagMap when savedTagMap changes to ensure consistency
  useEffect(() => {
    setTagMap(prev => {
      const updated = { ...prev };
      // Ensure all photos in savedTagMap are also in tagMap
      Object.entries(savedTagMap).forEach(([photoPath, tags]) => {
        if (!updated[photoPath] || JSON.stringify(updated[photoPath]) !== JSON.stringify(tags)) {
          updated[photoPath] = tags;
        }
      });
      return updated;
    });
  }, [savedTagMap]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check for unsaved changes
  useEffect(() => {
    const currentPhotoPath = photoPaths[currentPhotoIndex];
    const currentTags = tagMap[currentPhotoPath] || [];
    const savedTags = savedTagMap[currentPhotoPath] || [];
    const hasChanges = JSON.stringify(currentTags) !== JSON.stringify(savedTags);
    setHasUnsavedChanges(hasChanges);
  }, [tagMap, savedTagMap, currentPhotoIndex, photoPaths]);

  // Generate suggested avatars based on the previous photo from tags.json
  useEffect(() => {
    if (photoPaths.length === 0 || currentPhotoIndex === 0) {
      setSuggestedAvatars([]);
      return;
    }
    
    // Get tags from the previous photo only
    const previousPhotoPath = photoPaths[currentPhotoIndex - 1];
    const previousPhotoTags = savedTagMap[previousPhotoPath] || tagMap[previousPhotoPath] || [];
    
    setSuggestedAvatars(previousPhotoTags);
  }, [savedTagMap, tagMap, currentPhotoIndex, photoPaths]);

  const handleAvatarToggle = (avatarPath: string) => {
    const currentPhotoPath = photoPaths[currentPhotoIndex];
    setTagMap(prev => {
      const currentTags = prev[currentPhotoPath] || [];
      const newTags = currentTags.includes(avatarPath)
        ? currentTags.filter(tag => tag !== avatarPath)
        : [...currentTags, avatarPath];
      
      return {
        ...prev,
        [currentPhotoPath]: newTags
      };
    });
  };

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      // Save current photo's tags before moving
      const currentPhotoPath = photoPaths[currentPhotoIndex];
      setSavedTagMap(prev => ({
        ...prev,
        [currentPhotoPath]: tagMap[currentPhotoPath] || []
      }));
      
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPhotoIndex < photoPaths.length - 1) {
      // Save current photo's tags before moving
      const currentPhotoPath = photoPaths[currentPhotoIndex];
      setSavedTagMap(prev => ({
        ...prev,
        [currentPhotoPath]: tagMap[currentPhotoPath] || []
      }));
      
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handleSave = async () => {
    const currentPhotoPath = photoPaths[currentPhotoIndex];
    const updatedTags = {
      ...savedTagMap,
      [currentPhotoPath]: tagMap[currentPhotoPath] || []
    };
    setSavedTagMap(updatedTags);
    await StorageService.saveTags(updatedTags);
    setHasUnsavedChanges(false);
    setSaveNotification({ message: 'Tags saved to file successfully!', isVisible: true });
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Save current photo's tags before export
      const currentPhotoPath = photoPaths[currentPhotoIndex];
      const finalTagMap = {
        ...savedTagMap,
        [currentPhotoPath]: tagMap[currentPhotoPath] || []
      };
      
      // Save to localStorage and export
      await StorageService.saveTags(finalTagMap);
      StorageService.exportTags();
      setSaveNotification({ message: 'Data exported and saved to file!', isVisible: true });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRemoveAvatar = (avatarPath: string) => {
    const currentPhotoPath = photoPaths[currentPhotoIndex];
    setTagMap(prev => ({
      ...prev,
      [currentPhotoPath]: (prev[currentPhotoPath] || []).filter(path => path !== avatarPath)
    }));
  };

  const handleClearAll = () => {
    const currentPhotoPath = photoPaths[currentPhotoIndex];
    setTagMap(prev => ({
      ...prev,
      [currentPhotoPath]: []
    }));
  };

  const handleApplySuggestions = () => {
    const currentPhotoPath = photoPaths[currentPhotoIndex];
    setTagMap(prev => {
      const currentTags = prev[currentPhotoPath] || [];
      // Only add avatars that are not already selected
      const newAvatars = suggestedAvatars.filter(avatar => !currentTags.includes(avatar));
      return {
        ...prev,
        [currentPhotoPath]: [...currentTags, ...newAvatars]
      };
    });
  };

  const handleClearSuggestions = () => {
    setSuggestedAvatars([]);
  };

  const currentPhotoPath = photoPaths[currentPhotoIndex];
  const currentSelectedAvatars = tagMap[currentPhotoPath] || [];
  
  // Calculate processed photos correctly by checking both saved and current tags
  const processedPhotos = photoPaths.filter(photoPath => {
    const savedTags = savedTagMap[photoPath] || [];
    const currentTags = tagMap[photoPath] || [];
    // Consider a photo processed if it has tags in either saved or current state
    return savedTags.length > 0 || currentTags.length > 0;
  }).length;

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            Cuốn Album – Tag Page
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/home"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              Go to Gallery
            </a>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <IconSettings size={16} />
              <span>{photoPaths.length} photos, {avatarPaths.length} avatars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {photoPaths.length > 0 ? (
              <>
                {/* Smart Tagging Notification */}
                {suggestedAvatars.length > 0 && (
                  <div className="mb-4 bg-blue-900/50 border border-blue-500/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-300 text-sm">
                      <span className="font-semibold">💡 Smart Suggestion:</span>
                      <span>
                        {suggestedAvatars.length} avatars frequently tagged in previous photos. 
                        Use "Apply All" to quickly tag them all, or click individual avatars.
                      </span>
                    </div>
                  </div>
                )}

                {/* Unsaved Changes Notification */}
                {hasUnsavedChanges && (
                  <div className="mb-4 bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm">
                      <span className="font-semibold">⚠️ Unsaved Changes:</span>
                      <span>
                        You have unsaved changes. Click "Save Progress" to save your tags before moving to another photo.
                      </span>
                    </div>
                  </div>
                )}
                
                <PhotoTagger
                  photoPath={currentPhotoPath}
                  avatarPaths={avatarPaths}
                  selectedAvatars={currentSelectedAvatars}
                  suggestedAvatars={suggestedAvatars}
                  onAvatarToggle={handleAvatarToggle}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSave={handleSave}
                  onApplySuggestions={handleApplySuggestions}
                  onClearSuggestions={handleClearSuggestions}
                  currentIndex={currentPhotoIndex}
                  totalPhotos={photoPaths.length}
                  hasChanges={hasUnsavedChanges}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No photos found. Please add photos to the /public/photos/ directory.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          selectedAvatars={currentSelectedAvatars}
          onRemoveAvatar={handleRemoveAvatar}
          onClearAll={handleClearAll}
        />
      </div>
      
      <BottomBar 
        onExport={handleExport} 
        isExporting={isExporting}
        totalPhotos={photoPaths.length}
        processedPhotos={processedPhotos}
      />
      
      {/* Save Notification */}
      <SaveNotification
        message={saveNotification.message}
        isVisible={saveNotification.isVisible}
        onClose={() => setSaveNotification({ message: '', isVisible: false })}
      />
    </div>
  );
};

export default TagPage; 
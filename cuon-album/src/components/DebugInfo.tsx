'use client';

import React from 'react';
import { StorageService } from '../services/storageService';

interface DebugInfoProps {
  tags: Record<string, string[]>;
  photoPaths: string[];
  avatarPaths: string[];
}

interface DebugData {
  localStorageTags: Record<string, string[]>;
  stats: { totalPhotos: number; taggedPhotos: number; totalTags: number };
  photoCount: number;
  avatarCount: number;
  tagsFromProps: Record<string, string[]>;
  samplePhoto: string;
  sampleAvatar: string;
  sampleEncodedAvatar: string;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ tags, photoPaths, avatarPaths }) => {
  const [debugData, setDebugData] = React.useState<DebugData | null>(null);

  React.useEffect(() => {
    const loadDebugData = async () => {
      try {
        const loadedTags = await StorageService.loadTags();
        const stats = await StorageService.getPhotoStats();
        
        setDebugData({
          localStorageTags: loadedTags,
          stats,
          photoCount: photoPaths.length,
          avatarCount: avatarPaths.length,
          tagsFromProps: tags,
          samplePhoto: photoPaths[0] || '',
          sampleAvatar: avatarPaths[0] || '',
          sampleEncodedAvatar: encodeURIComponent(avatarPaths[0] || ''),
        });
      } catch (error) {
        console.error('Debug data load error:', error);
      }
    };
    
    loadDebugData();
  }, [tags, photoPaths, avatarPaths]);

  if (!debugData?.stats) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Photos: {debugData.photoCount}</div>
        <div>Avatars: {debugData.avatarCount}</div>
        <div>Tagged Photos: {debugData.stats.taggedPhotos}</div>
        <div>Total Tags: {debugData.stats.totalTags}</div>
        <div>Sample Photo: {debugData.samplePhoto}</div>
        <div>Sample Avatar: {debugData.sampleAvatar}</div>
        <div>Encoded: {debugData.sampleEncodedAvatar}</div>
        <div className="mt-2">
          <strong>Tags from localStorage:</strong>
          <pre className="text-xs mt-1 overflow-auto max-h-20">
            {JSON.stringify(debugData.localStorageTags, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo; 
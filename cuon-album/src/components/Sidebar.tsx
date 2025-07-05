'use client';

import React from 'react';
import { IconX, IconUser } from '@tabler/icons-react';
import { encodeImageUrl, getImageDisplayName } from '@/utils/imageUtils';

interface SidebarProps {
  selectedAvatars: string[];
  onRemoveAvatar: (avatarPath: string) => void;
  onClearAll: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedAvatars, onRemoveAvatar, onClearAll }) => {
  const getAvatarName = (path: string) => {
    return getImageDisplayName(path);
  };

  return (
    <div className="w-72 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            Selected Avatars
          </h2>
          {selectedAvatars.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          )}
        </div>

        {selectedAvatars.length === 0 ? (
          <div className="text-center py-6">
            <IconUser size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400 text-sm">
              No avatars selected yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedAvatars.map((avatarPath) => (
              <div
                key={avatarPath}
                className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <img
                  src={encodeImageUrl(avatarPath)}
                  alt={getAvatarName(avatarPath)}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-red-500"
                  onError={(e) => {
                    console.error('Failed to load avatar in Sidebar:', avatarPath);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {getAvatarName(avatarPath)}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveAvatar(avatarPath)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <IconX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <p>Total selected: <span className="font-semibold text-white">{selectedAvatars.length}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 
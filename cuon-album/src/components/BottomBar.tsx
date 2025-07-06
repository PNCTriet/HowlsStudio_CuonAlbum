'use client';

import React from 'react';
import { IconDownload, IconDeviceTablet } from '@tabler/icons-react';
import { AppConfig } from "@/config/appConfig";

interface BottomBarProps {
  onExport: () => void;
  isExporting?: boolean;
  totalPhotos: number;
  processedPhotos: number;
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onDownloadSelected?: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ onExport, isExporting = false, totalPhotos, processedPhotos, selectedCount, totalCount, onClearSelection, onDownloadSelected }) => {
  const progress = totalPhotos > 0 ? (processedPhotos / totalPhotos) * 100 : 0;
  
  const getCurrentMode = () => {
    return AppConfig.USE_SUPABASE ? 'SUPABASE' : 'LOCAL';
  };

  const getQualityInfo = () => {
    if (!AppConfig.USE_SUPABASE) return null;
    
    return (
      <div className="text-xs text-gray-400">
        <span className="font-semibold">Quality:</span>
        <span className="ml-1">Grid: Thumbnail | Preview: Medium | Download: Full</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 shadow-lg">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Progress Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <IconDeviceTablet className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                {processedPhotos} / {totalPhotos} photos processed
              </span>
            </div>
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* Export Button */}
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm"
          >
            <IconDownload className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export JSON'}
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-3 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Selection Info */}
            <div className="text-white">
              <span className="font-semibold">{selectedCount}</span>
              <span className="text-gray-400"> of {totalCount} selected</span>
            </div>

            {/* Mode Badge */}
            {AppConfig.SHOW_CONFIG_BADGE && (
              <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold">
                {getCurrentMode()}
              </div>
            )}

            {/* Quality Info */}
            {getQualityInfo()}
          </div>

          <div className="flex items-center gap-2">
            {/* Download Selected Button */}
            {selectedCount > 0 && onDownloadSelected && (
              <button
                onClick={onDownloadSelected}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Download {selectedCount} Full Res
              </button>
            )}

            {/* Clear Selection Button */}
            {selectedCount > 0 && (
              <button
                onClick={onClearSelection}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomBar; 
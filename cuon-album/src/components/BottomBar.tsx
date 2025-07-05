'use client';

import React from 'react';
import { IconDownload, IconDeviceTablet } from '@tabler/icons-react';

interface BottomBarProps {
  onExport: () => void;
  isExporting?: boolean;
  totalPhotos: number;
  processedPhotos: number;
}

const BottomBar: React.FC<BottomBarProps> = ({ onExport, isExporting = false, totalPhotos, processedPhotos }) => {
  const progress = totalPhotos > 0 ? (processedPhotos / totalPhotos) * 100 : 0;
  
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
    </div>
  );
};

export default BottomBar; 
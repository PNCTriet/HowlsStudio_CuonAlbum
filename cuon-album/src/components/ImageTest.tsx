'use client';

import React, { useState } from 'react';
import { encodeImageUrl } from '@/utils/imageUtils';

interface ImageTestProps {
  photoPaths: string[];
}

const ImageTest: React.FC<ImageTestProps> = ({ photoPaths }) => {
  const [testResults, setTestResults] = useState<Array<{
    original: string;
    encoded: string;
    loaded: boolean;
    error?: string;
  }>>([]);

  const testImage = (photoPath: string) => {
    const encodedPath = encodeImageUrl(photoPath);
    const img = new Image();
    
    img.onload = () => {
      setTestResults(prev => [...prev, {
        original: photoPath,
        encoded: encodedPath,
        loaded: true
      }]);
    };
    
    img.onerror = () => {
      setTestResults(prev => [...prev, {
        original: photoPath,
        encoded: encodedPath,
        loaded: false,
        error: 'Failed to load image'
      }]);
    };
    
    img.src = encodedPath;
  };

  const runAllTests = () => {
    setTestResults([]);
    photoPaths.slice(0, 10).forEach(testImage); // Test first 10 images
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-700 max-w-md z-50">
      <h3 className="text-white font-semibold mb-2">Image Test Debug</h3>
      <button
        onClick={runAllTests}
        className="mb-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        Test Images
      </button>
      <div className="max-h-64 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className="text-xs mb-1">
            <div className={`${result.loaded ? 'text-green-400' : 'text-red-400'}`}>
              {result.loaded ? '✓' : '✗'} {result.original.split('/').pop()}
            </div>
            {!result.loaded && (
              <div className="text-gray-400 ml-2">
                Encoded: {result.encoded}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest; 
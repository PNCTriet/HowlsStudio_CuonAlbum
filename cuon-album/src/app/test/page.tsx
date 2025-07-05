'use client';

import React, { useState, useEffect } from 'react';
import { encodeImageUrl } from '@/utils/imageUtils';

const TestPage = () => {
  const [testResults, setTestResults] = useState<Array<{
    original: string;
    encoded: string;
    loaded: boolean;
    error?: string;
  }>>([]);

  const testImages = [
    '/photos/DSCF0930.JPG',
    '/photos/DSCF0931.JPG',
    '/photos/DSCF0933.JPG'
  ];

  const testImage = (photoPath: string) => {
    const encodedPath = encodeImageUrl(photoPath);
    const img = new Image();
    
    img.onload = () => {
      console.log('✅ Image loaded successfully:', {
        original: photoPath,
        encoded: encodedPath,
        filename: photoPath.split('/').pop()
      });
      setTestResults(prev => [...prev, {
        original: photoPath,
        encoded: encodedPath,
        loaded: true
      }]);
    };
    
    img.onerror = () => {
      console.error('❌ Image failed to load:', {
        original: photoPath,
        encoded: encodedPath,
        filename: photoPath.split('/').pop()
      });
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
    testImages.forEach(testImage);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Image Loading Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testImages.map((photoPath, index) => {
            const encodedPath = encodeImageUrl(photoPath);
            const result = testResults.find(r => r.original === photoPath);
            
            return (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">
                  Test {index + 1}: {photoPath.split('/').pop()}
                </h3>
                
                <div className="mb-4">
                  <img
                    src={encodedPath}
                    alt={photoPath.split('/').pop()}
                    className="w-full h-48 object-cover rounded"
                    onLoad={() => console.log('✅ Direct img load success:', photoPath)}
                    onError={() => console.error('❌ Direct img load failed:', photoPath)}
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    <strong>Original:</strong> {photoPath}
                  </div>
                  <div className="text-gray-300">
                    <strong>Encoded:</strong> {encodedPath}
                  </div>
                  <div className={`font-semibold ${result?.loaded ? 'text-green-400' : result ? 'text-red-400' : 'text-yellow-400'}`}>
                    Status: {result?.loaded ? '✅ Loaded' : result ? '❌ Failed' : '⏳ Testing...'}
                  </div>
                  {result?.error && (
                    <div className="text-red-400">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8">
          <button
            onClick={runAllTests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Run Tests Again
          </button>
        </div>
        
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">Console Logs</h3>
          <p className="text-gray-300 text-sm">
            Check the browser console (F12) for detailed loading logs. Look for:
          </p>
          <ul className="text-gray-300 text-sm mt-2 space-y-1">
            <li>• ✅ Success messages with original and encoded paths</li>
            <li>• ❌ Error messages with details about failed loads</li>
            <li>• Network tab to see actual HTTP requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 
import React, { useState } from 'react';
import { IconTrash, IconDatabase, IconX } from '@tabler/icons-react';

interface ClearDataProps {
  className?: string;
}

const ClearData: React.FC<ClearDataProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cuon_album_tags');
      localStorage.removeItem('cuon_album_feedback');
      alert('Đã xóa dữ liệu localStorage! Vui lòng refresh trang.');
      setIsOpen(false);
    }
  };

  const showLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      const tags = localStorage.getItem('cuon_album_tags');
      const feedback = localStorage.getItem('cuon_album_feedback');
      
      console.log('localStorage tags:', tags);
      console.log('localStorage feedback:', feedback);
      
      alert(`Tags: ${tags || 'empty'}\nFeedback: ${feedback || 'empty'}`);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Prevent horizontal scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflowX = '';
    }

    return () => {
      document.body.style.overflowX = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm ${className}`}
        title="Clear Data Tools"
      >
        <IconTrash size={16} />
        <span className="hidden sm:inline">Data</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-2" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 w-full max-w-md mx-4" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white text-lg">Data Management</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="text-gray-300 text-sm">
                <p>Manage your local storage data for the application.</p>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={clearLocalStorage}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <IconTrash size={16} />
                  Clear localStorage
                </button>
                <button
                  onClick={showLocalStorageData}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <IconDatabase size={16} />
                  Show localStorage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClearData; 
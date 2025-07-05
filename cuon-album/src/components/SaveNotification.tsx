import React, { useState, useEffect } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

interface SaveNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <IconCheck size={20} />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <IconX size={16} />
        </button>
      </div>
    </div>
  );
};

export default SaveNotification; 
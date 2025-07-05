'use client';

import React from 'react';
import { IconX } from '@tabler/icons-react';

interface SaveNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <IconX size={16} />
      </button>
    </div>
  );
};

export default SaveNotification; 
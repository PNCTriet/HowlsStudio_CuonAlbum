'use client';

import React from 'react';
import { AppConfig } from '@/config/appConfig';

interface QualityInfoProps {
  className?: string;
}

const QualityInfo: React.FC<QualityInfoProps> = ({ className = '' }) => {
  if (!AppConfig.USE_SUPABASE) {
    return null;
  }

  return (
    <div className={`text-xs text-gray-400 ${className}`}>
      <span className="font-semibold">Image Quality:</span>
      <span className="ml-1">Grid & Preview: Thumbnail | Download: Full Resolution</span>
    </div>
  );
};

export default QualityInfo; 
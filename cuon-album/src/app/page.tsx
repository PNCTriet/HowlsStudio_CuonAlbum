'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSchool, IconHeart } from '@tabler/icons-react';

export default function Home() {
  const router = useRouter();
  const [showGraduationModal, setShowGraduationModal] = useState(true);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  const handleContinue = () => {
    setShowGraduationModal(false);
    setShowNoticeModal(true);
  };

  const handleNoticeContinue = () => {
    setShowNoticeModal(false);
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      {/* Graduation Modal */}
      {showGraduationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-blue-500/30">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <IconSchool size={48} className="text-yellow-400" />
                <IconHeart size={32} className="text-red-400 animate-pulse ml-2" />
              </div>
              
              <h3
                className="text-base sm:text-2xl font-bold text-white mb-4 whitespace-nowrap max-w-full overflow-x-auto"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                🎓 Mừng các em tốt nghiệp! 🎉
              </h3>
              
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 text-sm font-medium">
                  ✨ Chúc các em luôn mạnh mẽ, kiên cường và thành công trên mọi chặng đường phía trước! ✨
                </p>
                <p className="text-gray-200 text-sm leading-relaxed mt-3">
                  Anh rất vui vì đã có cơ hội góp mặt và lưu lại cột mốc tươi đẹp này của các em. 💕
                </p>
              </div>
              
              <button
                onClick={handleContinue}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                💖 Xác nhận tốt nghiệp 💖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-blue-500/30">
            <div className="text-center">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 whitespace-nowrap">
                ⚡ Lưu ý sử dụng nền tảng
              </h3>
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-xs mt-2 italic">
                  Thông cảm nếu platform phản hồi chậm và lag nha, xu quá thì có link drive dính kèm backup cho xốp
                </p>
                <p className="text-blue-200 text-xs mt-2 italic">
                  ⚡ Chrome/Edge đi chứ Safari khó chịu vô cùng.
                </p>
                <p className="text-blue-200 text-xs mt-1 italic">
                  💡 Nên download hình trên máy tính tại file hình nó nặng á.
                </p>
              </div>
              <button
                onClick={handleNoticeContinue}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Xác nhận đã đọc lưu ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
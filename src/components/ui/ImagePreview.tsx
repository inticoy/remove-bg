/**
 * Image preview component with background options
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BackgroundColor } from '@/types';

interface ImagePreviewProps {
  originalSrc: string;
  processedSrc: string;
  width: number;
  height: number;
}

export const ImagePreview = ({
  originalSrc,
  processedSrc,
  width,
  height,
}: ImagePreviewProps) => {
  const [activeTab, setActiveTab] = useState<'original' | 'processed'>('processed');
  const [background, setBackground] = useState<BackgroundColor>('checkerboard');

  const backgrounds = [
    { id: 'checkerboard' as const, label: 'Transparent', icon: '▦' },
    { id: 'white' as const, label: 'White', icon: '○' },
    { id: 'black' as const, label: 'Black', icon: '●' },
  ];

  const getBackgroundClass = (bg: BackgroundColor) => {
    switch (bg) {
      case 'checkerboard':
        return 'checkerboard';
      case 'white':
        return 'bg-white';
      case 'black':
        return 'bg-black';
      default:
        return 'checkerboard';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-card-strong p-6 space-y-4"
    >
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('original')}
          className={`
            flex-1 py-3 rounded-xl font-semibold transition-all duration-300
            ${
              activeTab === 'original'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
          `}
        >
          Original
        </button>
        <button
          onClick={() => setActiveTab('processed')}
          className={`
            flex-1 py-3 rounded-xl font-semibold transition-all duration-300
            ${
              activeTab === 'processed'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
          `}
        >
          Processed
        </button>
      </div>

      {/* Background selector - only show for processed image */}
      {activeTab === 'processed' && (
        <div className="flex gap-2 justify-center">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setBackground(bg.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${
                  background === bg.id
                    ? 'bg-white/30 text-white shadow-lg scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <span className="mr-2">{bg.icon}</span>
              {bg.label}
            </button>
          ))}
        </div>
      )}

      {/* Image display */}
      <div className="relative rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              flex items-center justify-center min-h-[400px] p-4
              ${activeTab === 'processed' ? getBackgroundClass(background) : 'bg-gray-100'}
            `}
          >
            <img
              src={activeTab === 'original' ? originalSrc : processedSrc}
              alt={activeTab === 'original' ? 'Original' : 'Processed'}
              className="max-w-full max-h-[600px] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Image info */}
      <div className="flex items-center justify-between text-white/70 text-sm">
        <span>
          Dimensions: {width} × {height}
        </span>
        <span>
          {activeTab === 'original' ? 'Original Image' : 'Background Removed'}
        </span>
      </div>
    </motion.div>
  );
};

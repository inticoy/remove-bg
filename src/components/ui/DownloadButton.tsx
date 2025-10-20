/**
 * Download button with format options
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { downloadImage, getFileExtension } from '@/utils/imageUtils';
import type { ImageFormat } from '@/types';

interface DownloadButtonProps {
  dataURL: string;
  filename?: string;
}

export const DownloadButton = ({
  dataURL,
  filename = 'removed-background',
}: DownloadButtonProps) => {
  const [format, setFormat] = useState<ImageFormat>('png');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Add a small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 300));

      const extension = getFileExtension(format);
      downloadImage(dataURL, `${filename}${extension}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-card-strong p-6 space-y-4"
    >
      <h3 className="text-xl font-bold text-white text-shadow">
        Download Options
      </h3>

      {/* Format selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setFormat('png')}
          className={`
            flex-1 py-3 rounded-xl font-semibold transition-all duration-300
            ${
              format === 'png'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
          `}
        >
          PNG
        </button>
        <button
          onClick={() => setFormat('webp')}
          className={`
            flex-1 py-3 rounded-xl font-semibold transition-all duration-300
            ${
              format === 'webp'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
          `}
        >
          WebP
        </button>
      </div>

      {/* Download button */}
      <motion.button
        onClick={handleDownload}
        disabled={isDownloading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full btn-primary flex items-center justify-center gap-3
          ${isDownloading ? 'opacity-75 cursor-not-allowed' : ''}
        `}
      >
        {isDownloading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Image
          </>
        )}
      </motion.button>

      <p className="text-center text-white/60 text-xs">
        Format: {format.toUpperCase()} • Transparency preserved
      </p>
    </motion.div>
  );
};

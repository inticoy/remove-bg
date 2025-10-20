/**
 * Drag-and-drop file uploader component
 */

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { isValidImageFile } from '@/utils/imageUtils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUploader = ({ onFileSelect, disabled = false }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find(isValidImageFile);

      if (imageFile) {
        onFileSelect(imageFile);
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (isValidImageFile(file)) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          glass-card-strong p-12 text-center cursor-pointer
          transition-all duration-300 border-2 border-dashed
          ${
            isDragging
              ? 'border-white bg-white/30 scale-105'
              : 'border-white/30 hover:border-white/50 hover:bg-white/20'
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-input"
          disabled={disabled}
        />

        <label htmlFor="file-input" className="cursor-pointer">
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl flex items-center justify-center animate-float">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white text-shadow-lg">
                {isDragging ? 'Drop your image here' : 'Upload an image'}
              </h3>
              <p className="text-white/70">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-white/50">
                Supports JPG, PNG, WebP
              </p>
            </div>

            <div className="btn-primary mt-4">
              Choose File
            </div>
          </motion.div>
        </label>
      </div>
    </motion.div>
  );
};

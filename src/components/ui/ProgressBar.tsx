/**
 * Animated progress bar component
 */

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
}

export const ProgressBar = ({ progress, label }: ProgressBarProps) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between text-white text-sm">
          <span>{label}</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
      )}

      <div className="glass-card h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full"
        />
      </div>
    </div>
  );
};

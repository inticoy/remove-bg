/**
 * Model selection component
 */

import { motion } from 'framer-motion';
import type { ModelType } from '@/types';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
}

interface ModelInfo {
  id: ModelType;
  name: string;
  description: string;
  icon: string;
  features: string[];
  recommended?: boolean;
}

const models: ModelInfo[] = [
  {
    id: 'mediapipe',
    name: 'MediaPipe',
    description: 'Fast & Lightweight',
    icon: '⚡',
    features: ['Best for portraits', 'Lightning fast', 'Mobile friendly'],
  },
  {
    id: 'u2net',
    name: 'U2-Net',
    description: 'General Purpose',
    icon: '🎯',
    features: ['People & objects', 'High accuracy', 'Balanced speed'],
    recommended: true,
  },
];

export const ModelSelector = ({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass-card-strong p-6 space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white text-shadow">
          Select AI Model
        </h3>
        <div className="text-xs text-white/60">
          Choose based on your image type
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {models.map((model) => (
          <motion.button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-2xl border-2 text-left transition-all duration-300
              ${
                selectedModel === model.id
                  ? 'bg-white/20 border-white shadow-lg'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
              }
            `}
          >
            {model.recommended && (
              <div className="absolute top-2 right-2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Recommended
                </span>
              </div>
            )}

            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{model.icon}</div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-lg">{model.name}</h4>
                <p className="text-white/70 text-sm">{model.description}</p>
              </div>
            </div>

            <ul className="space-y-1">
              {model.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-white/80 text-xs">
                  <svg
                    className="w-3 h-3 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {selectedModel === model.id && (
              <motion.div
                layoutId="selectedIndicator"
                className="absolute inset-0 border-2 border-white rounded-2xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-white/60 text-xs">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          MediaPipe: Best for selfies and portraits • U2-Net: Best for products and general objects
        </span>
      </div>
    </motion.div>
  );
};

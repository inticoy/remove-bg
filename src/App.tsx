/**
 * Main App component
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ImagePreview } from '@/components/ui/ImagePreview';
import { DownloadButton } from '@/components/ui/DownloadButton';
import { ModelSelector } from '@/components/features/ModelSelector';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import type { ModelType } from '@/types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('u2net');
  const { status, progress, error, result, processImage, reset } = useBackgroundRemoval(selectedModel);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    await processImage(file, {
      format: 'png',
      softenEdges: false,
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
  };

  const isProcessing = status === 'loading' || status === 'processing';
  const isCompleted = status === 'completed' && result;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {!selectedFile && !isCompleted && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl font-bold text-white text-shadow-lg mb-4"
                >
                  Remove Image Background
                </motion.h2>
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-white/80"
                >
                  AI-powered, 100% private, instant results
                </motion.p>
              </div>

              <div className="mb-6">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  disabled={isProcessing}
                />
              </div>

              <FileUploader onFileSelect={handleFileSelect} disabled={isProcessing} />

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
              >
                {[
                  {
                    icon: '🚀',
                    title: 'Lightning Fast',
                    description: 'Instant processing with AI',
                  },
                  {
                    icon: '🔒',
                    title: '100% Private',
                    description: 'All processing in your browser',
                  },
                  {
                    icon: '✨',
                    title: 'High Quality',
                    description: 'Professional results every time',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-white/70 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card-strong p-12 text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse">
                  <svg
                    className="w-12 h-12 text-white animate-spin"
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
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white text-shadow mb-2">
                    {status === 'loading' ? 'Initializing AI...' : 'Processing Image...'}
                  </h3>
                  <p className="text-white/70">Please wait while we work our magic</p>
                </div>

                <ProgressBar progress={progress} label="Progress" />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card-strong p-12 text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-3xl flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white text-shadow mb-2">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-white/70">{error}</p>
                </div>

                <button onClick={handleReset} className="btn-primary">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {isCompleted && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white text-shadow">
                  Your Result
                </h2>
                <button
                  onClick={handleReset}
                  className="glass-card px-6 py-3 text-white font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Upload New Image
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ImagePreview
                    originalSrc={result.original}
                    processedSrc={result.processed}
                    width={result.width}
                    height={result.height}
                  />
                </div>

                <div>
                  <DownloadButton
                    dataURL={result.processed}
                    filename="removed-background"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;

/**
 * Custom hook for background removal operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ProcessingStatus, ProcessedImage, BackgroundRemovalOptions, ModelType, BackgroundRemovalService } from '@/types';
import { getMediaPipeService } from '@/services/MediaPipeBackgroundRemoval';
import { getU2NetService } from '@/services/U2NetBackgroundRemoval';
import {
  loadImageFromFile,
  imageToImageData,
  imageDataToDataURL,
  softenEdges,
} from '@/utils/imageUtils';

export const useBackgroundRemoval = (modelType: ModelType = 'u2net') => {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImage | null>(null);

  const serviceRef = useRef<BackgroundRemovalService>(
    modelType === 'mediapipe' ? getMediaPipeService() : getU2NetService()
  );

  // Update service when model type changes
  useEffect(() => {
    const newService = modelType === 'mediapipe' ? getMediaPipeService() : getU2NetService();
    serviceRef.current = newService;
  }, [modelType]);

  const processImage = useCallback(
    async (file: File, options: BackgroundRemovalOptions = {}) => {
      try {
        setStatus('loading');
        setProgress(0);
        setError(null);

        // Yield to the browser so the loading UI can render before heavy work
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        setProgress((prev) => (prev < 5 ? 5 : prev));

        // Initialize service with progress tracking for model download
        if (!serviceRef.current.isInitialized()) {
          const onDownloadProgress = (loaded: number, total: number) => {
            if (total > 0) {
              // Map download progress to 0-30% range
              const downloadProgress = (loaded / total) * 30;
              setProgress(downloadProgress);
            } else {
              // Unknown total size (e.g., some local files) – nudge progress gradually
              setProgress((prev) => Math.min(prev + 5, 25));
            }
          };

          await serviceRef.current.initialize(onDownloadProgress);
          setProgress(35);
        }

        setStatus('processing');
        setProgress(40);

        // Load image
        const image = await loadImageFromFile(file);
        setProgress(60);

        // Convert to ImageData
        const imageData = imageToImageData(image);

        // Remove background
        let processedData = await serviceRef.current.removeBackground(imageData);
        setProgress(80);

        // Apply edge softening if requested
        if (options.softenEdges && options.softenRadius) {
          processedData = softenEdges(processedData, options.softenRadius);
        }

        setProgress(90);

        // Convert to data URLs
        const originalDataURL = imageDataToDataURL(imageData, 'png');
        const processedDataURL = imageDataToDataURL(
          processedData,
          options.format || 'png',
          options.quality || 1
        );

        setProgress(100);

        const processedImage: ProcessedImage = {
          original: originalDataURL,
          processed: processedDataURL,
          width: image.width,
          height: image.height,
        };

        setResult(processedImage);
        setStatus('completed');
      } catch (err) {
        console.error('Background removal error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setStatus('error');
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  const cleanup = useCallback(() => {
    serviceRef.current.cleanup();
  }, []);

  return {
    status,
    progress,
    error,
    result,
    processImage,
    reset,
    cleanup,
  };
};

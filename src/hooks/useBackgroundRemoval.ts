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

        // Initialize service with progress tracking for model download
        if (!serviceRef.current.isInitialized()) {
          const onDownloadProgress = (loaded: number, total: number) => {
            // Map download progress to 0-30% range
            const downloadProgress = (loaded / total) * 30;
            setProgress(downloadProgress);
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

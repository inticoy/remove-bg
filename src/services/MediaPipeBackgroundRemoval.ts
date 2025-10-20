/**
 * MediaPipe Selfie Segmentation service for background removal
 * Optimized for portrait/selfie images with fast performance
 */

import type { BackgroundRemovalService } from '@/types';

// MediaPipe types
interface SelfieSegmentationConfig {
  locateFile: (file: string) => string;
}

interface SelfieSegmentationOptions {
  modelSelection: number;
  selfieMode: boolean;
}

interface SelfieSegmentationResults {
  image: HTMLCanvasElement | HTMLImageElement;
  segmentationMask: HTMLCanvasElement | HTMLImageElement;
}

interface SelfieSegmentationAPI {
  setOptions(options: SelfieSegmentationOptions): void;
  onResults(callback: (results: SelfieSegmentationResults) => void): void;
  send(inputs: { image: HTMLCanvasElement | HTMLImageElement }): Promise<void>;
  close(): void;
}

declare global {
  interface Window {
    SelfieSegmentation?: new (config: SelfieSegmentationConfig) => SelfieSegmentationAPI;
  }
}

export class MediaPipeBackgroundRemoval implements BackgroundRemovalService {
  private selfieSegmentation: SelfieSegmentationAPI | null = null;
  private initialized = false;
  private scriptLoaded = false;

  private async loadScript(): Promise<void> {
    if (this.scriptLoaded) return;

    return new Promise((resolve, reject) => {
      // Load camera utils
      const cameraUtilsScript = document.createElement('script');
      cameraUtilsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
      cameraUtilsScript.crossOrigin = 'anonymous';

      cameraUtilsScript.onload = () => {
        // Load selfie segmentation
        const selfieScript = document.createElement('script');
        selfieScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
        selfieScript.crossOrigin = 'anonymous';

        selfieScript.onload = () => {
          this.scriptLoaded = true;
          resolve();
        };

        selfieScript.onerror = () => reject(new Error('Failed to load MediaPipe script'));
        document.head.appendChild(selfieScript);
      };

      cameraUtilsScript.onerror = () => reject(new Error('Failed to load camera utils script'));
      document.head.appendChild(cameraUtilsScript);
    });
  }

  async initialize(_onProgress?: (loaded: number, total: number) => void): Promise<void> {
    if (this.initialized) return;

    try {
      // Load MediaPipe scripts
      await this.loadScript();

      // Wait for SelfieSegmentation to be available
      if (!window.SelfieSegmentation) {
        throw new Error('SelfieSegmentation not available');
      }

      this.selfieSegmentation = new window.SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        },
      });

      this.selfieSegmentation.setOptions({
        modelSelection: 1, // 0: General, 1: Landscape (better quality)
        selfieMode: false,
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      throw new Error('Failed to initialize background removal service');
    }
  }

  async removeBackground(imageData: ImageData): Promise<ImageData> {
    if (!this.selfieSegmentation || !this.initialized) {
      throw new Error('Service not initialized');
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.putImageData(imageData, 0, 0);

      this.selfieSegmentation!.onResults((results) => {
        try {
          const outputCanvas = document.createElement('canvas');
          outputCanvas.width = imageData.width;
          outputCanvas.height = imageData.height;

          const outputCtx = outputCanvas.getContext('2d');
          if (!outputCtx) {
            reject(new Error('Failed to get output canvas context'));
            return;
          }

          // Draw the original image
          outputCtx.drawImage(results.image, 0, 0);

          // Get image data to manipulate alpha channel
          const outputImageData = outputCtx.getImageData(
            0,
            0,
            outputCanvas.width,
            outputCanvas.height
          );

          // Get segmentation mask
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = imageData.width;
          maskCanvas.height = imageData.height;
          const maskCtx = maskCanvas.getContext('2d');
          if (!maskCtx) {
            reject(new Error('Failed to get mask canvas context'));
            return;
          }

          maskCtx.drawImage(results.segmentationMask, 0, 0);
          const maskData = maskCtx.getImageData(
            0,
            0,
            maskCanvas.width,
            maskCanvas.height
          );

          // Apply mask to alpha channel
          for (let i = 0; i < outputImageData.data.length; i += 4) {
            const maskValue = maskData.data[i]; // R channel of grayscale mask
            outputImageData.data[i + 3] = maskValue; // Set alpha
          }

          resolve(outputImageData);
        } catch (error) {
          reject(error);
        }
      });

      this.selfieSegmentation!.send({ image: canvas });
    });
  }

  cleanup(): void {
    if (this.selfieSegmentation) {
      this.selfieSegmentation.close();
      this.selfieSegmentation = null;
      this.initialized = false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
let instance: MediaPipeBackgroundRemoval | null = null;

export const getMediaPipeService = (): MediaPipeBackgroundRemoval => {
  if (!instance) {
    instance = new MediaPipeBackgroundRemoval();
  }
  return instance;
};

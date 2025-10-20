/**
 * Core types for the background removal application
 */

export type ImageFormat = 'png' | 'webp';

export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'completed' | 'error';

export type ModelType = 'mediapipe' | 'u2net';

export interface ProcessedImage {
  original: string; // Base64 data URL
  processed: string; // Base64 data URL with transparent background
  width: number;
  height: number;
}

export interface BackgroundRemovalOptions {
  format?: ImageFormat;
  quality?: number; // 0-1 for WebP
  softenEdges?: boolean;
  softenRadius?: number;
}

export interface BackgroundRemovalService {
  initialize(): Promise<void>;
  removeBackground(imageData: ImageData): Promise<ImageData>;
  cleanup(): void;
  isInitialized(): boolean;
}

export type BackgroundColor = 'transparent' | 'white' | 'black' | 'checkerboard';

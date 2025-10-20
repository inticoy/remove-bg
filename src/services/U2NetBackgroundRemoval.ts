/**
 * U2-Net ONNX service for background removal
 * General purpose model for people, objects, and products
 */

import * as ort from 'onnxruntime-web';
import type { BackgroundRemovalService } from '@/types';
import { downloadModel } from '@/utils/modelCache';

// U2-Net configuration
const MODEL_INPUT_SIZE = 320; // U2-Net uses 320x320 input
const MIN_VALID_MODEL_SIZE_BYTES = 1 * 1024 * 1024; // Guard against Git LFS pointers

// Local model configuration
const MODEL_FILE_NAME = import.meta.env.VITE_U2NET_LOCAL_MODEL ?? 'silueta.onnx';
const LOCAL_MODEL_PATH = `${import.meta.env.BASE_URL}models/${MODEL_FILE_NAME}`;

// Optional remote fallback (e.g. custom CDN)
const CDN_MODEL_URL = import.meta.env.VITE_U2NET_MODEL_URL;

const GIT_LFS_SIGNATURE = 'https://git-lfs.github.com/spec/v1';

const isGitLfsPointer = (buffer: ArrayBuffer): boolean => {
  const slice = buffer.slice(0, Math.min(buffer.byteLength, 256));
  const text = new TextDecoder('utf-8', { fatal: false }).decode(slice).toLowerCase();
  return text.includes('version') && text.includes(GIT_LFS_SIGNATURE);
};

const validateModelBuffer = (buffer: ArrayBuffer): void => {
  if (buffer.byteLength < MIN_VALID_MODEL_SIZE_BYTES) {
    throw new Error(`Model buffer too small (${buffer.byteLength} bytes)`);
  }

  if (isGitLfsPointer(buffer)) {
    throw new Error('Model buffer appears to be a Git LFS pointer');
  }
};

export class U2NetBackgroundRemoval implements BackgroundRemovalService {
  private session: ort.InferenceSession | null = null;
  private initialized = false;

  async initialize(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    if (this.initialized) return;

    try {
      // Configure ONNX Runtime to use CDN for WASM files
      // Use unpkg as it's more reliable than jsdelivr
      ort.env.wasm.wasmPaths = 'https://unpkg.com/onnxruntime-web@1.23.0/dist/';

      // Enable SIMD and threading for better performance
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;

      // Prefer the locally hosted model (works for dev + GitHub Pages)
      let modelBuffer: ArrayBuffer | null = null;

      try {
        console.log('Loading local model from:', LOCAL_MODEL_PATH);
        modelBuffer = await downloadModel(LOCAL_MODEL_PATH, onProgress, validateModelBuffer);
        console.log('Local model loaded successfully');
      } catch (localError) {
        console.warn('Local model unavailable or invalid:', localError);
      }

      if (!modelBuffer) {
        if (!CDN_MODEL_URL) {
          throw new Error('Local model not found and no CDN fallback configured');
        }
        console.log('Downloading model from CDN:', CDN_MODEL_URL);
        modelBuffer = await downloadModel(CDN_MODEL_URL, onProgress, validateModelBuffer);
      }

      console.log('Model loaded, initializing session...');

      // Load the model from ArrayBuffer
      this.session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });

      this.initialized = true;
      console.log('U2-Net initialized successfully');
      console.log('Input names:', this.session.inputNames);
      console.log('Output names:', this.session.outputNames);
    } catch (error) {
      console.error('Failed to initialize U2-Net:', error);
      throw new Error('Failed to initialize U2-Net model. Download failed or model is corrupted.');
    }
  }

  async removeBackground(imageData: ImageData): Promise<ImageData> {
    if (!this.session || !this.initialized) {
      throw new Error('Service not initialized');
    }

    try {
      // Preprocess image
      const input = this.preprocessImage(imageData);

      // Run inference
      const feeds: Record<string, ort.Tensor> = {};
      feeds[this.session.inputNames[0]] = input;

      const results = await this.session.run(feeds);
      const output = results[this.session.outputNames[0]];

      // Postprocess result
      return this.postprocessMask(output, imageData);
    } catch (error) {
      console.error('U2-Net inference error:', error);
      throw new Error('Failed to process image with U2-Net');
    }
  }

  private preprocessImage(imageData: ImageData): ort.Tensor {
    const { width, height } = imageData;

    // Create canvas for resizing
    const canvas = document.createElement('canvas');
    canvas.width = MODEL_INPUT_SIZE;
    canvas.height = MODEL_INPUT_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Draw and resize image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.drawImage(tempCanvas, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
    const resizedData = ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

    // Convert to tensor format: [1, 3, 320, 320]
    // Normalize to [0, 1] and convert RGB to planar format
    const tensorData = new Float32Array(1 * 3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);

    for (let i = 0; i < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; i++) {
      const pixelIndex = i * 4;
      const tensorIndex = i;

      // Normalize and arrange in CHW format (Channel, Height, Width)
      tensorData[tensorIndex] = resizedData.data[pixelIndex] / 255.0; // R
      tensorData[MODEL_INPUT_SIZE * MODEL_INPUT_SIZE + tensorIndex] =
        resizedData.data[pixelIndex + 1] / 255.0; // G
      tensorData[2 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE + tensorIndex] =
        resizedData.data[pixelIndex + 2] / 255.0; // B
    }

    return new ort.Tensor('float32', tensorData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
  }

  private postprocessMask(mask: ort.Tensor, originalImageData: ImageData): ImageData {
    const { width, height } = originalImageData;

    // Mask is in shape [1, 1, 320, 320]
    const maskData = mask.data as Float32Array;

    // Create canvas for mask resizing
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = MODEL_INPUT_SIZE;
    maskCanvas.height = MODEL_INPUT_SIZE;
    const maskCtx = maskCanvas.getContext('2d')!;
    const maskImageData = maskCtx.createImageData(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

    // Convert mask to grayscale image
    for (let i = 0; i < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; i++) {
      const value = Math.max(0, Math.min(255, maskData[i] * 255));
      const pixelIndex = i * 4;
      maskImageData.data[pixelIndex] = value;     // R
      maskImageData.data[pixelIndex + 1] = value; // G
      maskImageData.data[pixelIndex + 2] = value; // B
      maskImageData.data[pixelIndex + 3] = 255;   // A
    }

    maskCtx.putImageData(maskImageData, 0, 0);

    // Resize mask to original image size
    const resizedMaskCanvas = document.createElement('canvas');
    resizedMaskCanvas.width = width;
    resizedMaskCanvas.height = height;
    const resizedMaskCtx = resizedMaskCanvas.getContext('2d')!;
    resizedMaskCtx.drawImage(maskCanvas, 0, 0, width, height);

    const resizedMask = resizedMaskCtx.getImageData(0, 0, width, height);

    // Apply mask to original image
    const resultData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      width,
      height
    );

    for (let i = 0; i < width * height; i++) {
      const pixelIndex = i * 4;
      const maskValue = resizedMask.data[pixelIndex]; // Use R channel as mask
      resultData.data[pixelIndex + 3] = maskValue; // Set alpha channel
    }

    return resultData;
  }

  cleanup(): void {
    if (this.session) {
      // ONNX Runtime Web sessions are automatically cleaned up
      this.session = null;
      this.initialized = false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
let instance: U2NetBackgroundRemoval | null = null;

export const getU2NetService = (): U2NetBackgroundRemoval => {
  if (!instance) {
    instance = new U2NetBackgroundRemoval();
  }
  return instance;
};

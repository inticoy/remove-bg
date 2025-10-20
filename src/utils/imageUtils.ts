/**
 * Reusable image processing utilities
 */

import type { ImageFormat } from '@/types';

/**
 * Load an image from a File object
 */
export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert HTMLImageElement to ImageData
 */
export const imageToImageData = (image: HTMLImageElement): ImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Convert ImageData to base64 data URL
 */
export const imageDataToDataURL = (
  imageData: ImageData,
  format: ImageFormat = 'png',
  quality: number = 1
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.putImageData(imageData, 0, 0);

  const mimeType = format === 'png' ? 'image/png' : 'image/webp';
  return canvas.toDataURL(mimeType, quality);
};

/**
 * Apply Gaussian blur to soften edges
 */
export const softenEdges = (
  imageData: ImageData,
  radius: number = 2
): ImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.putImageData(imageData, 0, 0);
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(canvas, 0, 0);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Download image data as a file
 */
export const downloadImage = (
  dataURL: string,
  filename: string = 'removed-background'
): void => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate if file is an image
 */
export const isValidImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Get file extension from format
 */
export const getFileExtension = (format: ImageFormat): string => {
  return format === 'png' ? '.png' : '.webp';
};

/**
 * Apply background color to transparent image
 */
export const applyBackgroundColor = (
  imageData: ImageData,
  color: string
): ImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw image on top
  ctx.putImageData(imageData, 0, 0);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

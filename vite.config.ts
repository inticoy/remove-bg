import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-wasm-files',
      closeBundle() {
        const wasmFiles = [
          'ort-wasm-simd-threaded.wasm',
          'ort-wasm-simd.wasm',
          'ort-wasm-threaded.wasm',
          'ort-wasm.wasm',
        ];

        const sourceDir = 'node_modules/onnxruntime-web/dist';
        const targetDir = 'dist/assets';

        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }

        wasmFiles.forEach(file => {
          const sourcePath = path.join(sourceDir, file);
          const targetPath = path.join(targetDir, file);

          if (existsSync(sourcePath)) {
            try {
              copyFileSync(sourcePath, targetPath);
              console.log(`Copied ${file} to dist/assets`);
            } catch (err) {
              console.warn(`Failed to copy ${file}:`, err);
            }
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})

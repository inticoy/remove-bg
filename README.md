# Remove.bg - AI Background Remover

A professional, privacy-focused web application that removes backgrounds from images using AI - 100% client-side processing with no uploads required.

## Features

- **Dual AI Models**: Choose between MediaPipe (portraits) and U2-Net (general purpose)
- **100% Private**: All processing happens in your browser - no server uploads
- **High Quality**: Professional results for people, objects, and products
- **Modern UI**: Beautiful glassmorphism design with smooth animations
- **Multiple Formats**: Download as PNG or WebP
- **Background Options**: Preview with transparent, white, or black backgrounds
- **WebGPU Acceleration**: Automatic GPU acceleration with WASM fallback

## AI Models

### MediaPipe Selfie Segmentation
- **Best for**: Portraits, selfies, profile pictures
- **Speed**: Lightning fast (< 100ms)
- **Size**: Lightweight (~5MB loaded from CDN)
- **Accuracy**: Excellent for people

### U2-Net (Recommended)
- **Best for**: General purpose - people, objects, products
- **Speed**: Fast (~300-500ms)
- **Size**: ~176MB (or 44MB quantized version)
- **Accuracy**: High accuracy for all subjects

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom glassmorphism
- **Animations**: Framer Motion
- **AI Runtime**: ONNX Runtime Web (WebGPU/WASM)
- **Models**: MediaPipe (CDN), U2-Net (ONNX)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Download U2-Net model (required for U2-Net model option)
# Option 1: Full model (~176MB)
wget https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx -P public/models/

# Option 2: Quantized model (~44MB, faster)
wget https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_quant.onnx -O public/models/u2net.onnx

# Start development server
pnpm dev
# → http://localhost:5173/

# Build for production
pnpm build

# Preview production build
pnpm preview
```

> **Note**: MediaPipe works out of the box (loaded from CDN). U2-Net requires downloading the model file first.

## Deployment

GitHub Actions automatically deploys to GitHub Pages when you push to the main branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The site will be available at `https://[username].github.io/remove-bg/`

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, Footer)
│   ├── ui/              # Reusable UI components
│   └── features/        # Feature-specific components
├── services/            # Business logic and AI services
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── styles/              # Global styles and CSS
└── assets/              # Static assets
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Services Layer**: Handles AI model initialization and background removal
- **Hooks Layer**: Manages state and side effects
- **Utils Layer**: Reusable utility functions for image processing
- **Components Layer**: Presentational components with props-based interface

## Key Components

- **[MediaPipeBackgroundRemoval](src/services/MediaPipeBackgroundRemoval.ts)**: MediaPipe service for portrait segmentation
- **[U2NetBackgroundRemoval](src/services/U2NetBackgroundRemoval.ts)**: U2-Net ONNX service for general purpose
- **[ModelSelector](src/components/features/ModelSelector.tsx)**: AI model selection component
- **[useBackgroundRemoval](src/hooks/useBackgroundRemoval.ts)**: Custom hook managing the background removal workflow
- **[FileUploader](src/components/ui/FileUploader.tsx)**: Drag-and-drop file upload component
- **[ImagePreview](src/components/ui/ImagePreview.tsx)**: Interactive preview with background options
- **[DownloadButton](src/components/ui/DownloadButton.tsx)**: Export processed images in multiple formats

## Documentation

- **[USAGE.md](USAGE.md)**: Detailed usage guide and how to extend features
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture and design patterns
- **[spec.md](spec.md)**: Original project specifications

## Privacy & Security

- All image processing happens locally in your browser
- No images are uploaded to any server
- No tracking or analytics
- Open source and transparent

## Performance

- Lazy loading of AI models
- Optimized bundle size with code splitting
- WebGPU acceleration (with WASM fallback)
- Responsive design for all devices

## Future Enhancements

- [x] U²-Net / ISNet model support (general purpose) ✅ **COMPLETED**
- [ ] BRIA RMBG-1.4 model (high quality)
- [ ] Edge softening options UI
- [ ] Batch processing
- [ ] Image size optimization slider
- [ ] Custom background replacement
- [ ] Model performance comparison
- [ ] Export history

## License

This project uses:
- **MediaPipe**: Apache-2.0 License
- **U2-Net**: Apache-2.0 License
- **ONNX Runtime**: MIT License
- **Application Code**: MIT License

## Credits

- **AI Models**:
  - [Google MediaPipe](https://github.com/google/mediapipe)
  - [U2-Net](https://github.com/xuebinqin/U-2-Net)
  - [rembg](https://github.com/danielgatis/rembg) (model conversion reference)
- **Runtime**: [ONNX Runtime Web](https://github.com/microsoft/onnxruntime)
- **Design Inspiration**: Modern glassmorphism UI trends
- Built with React, TypeScript, and Vite

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for privacy-conscious users

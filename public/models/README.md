# Model Files

This directory contains ONNX model files for background removal.

## U2-Net Model

### Quick Setup (Recommended)

Download the lightweight pruned model (default in the app):

```bash
# u2netp.onnx (~45MB)
wget https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx -P public/models/
```

Or use the quantized variant (slightly lower quality, similar size):

```bash
# u2net_quant.onnx (~44MB)
wget https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_quant.onnx -O public/models/u2netp.onnx
```

### Alternative Sources

**From Hugging Face:**
```bash
# Download from Hugging Face hub
wget https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model.onnx -O public/models/u2netp.onnx
```

**From ONNX Model Zoo:**
- Visit: https://github.com/onnx/models
- Search for U2-Net salient object detection

## Model Information

### u2netp.onnx
- **Size**: ~45 MB
- **Input**: RGB image (3 channels)
- **Input Shape**: [1, 3, 320, 320]
- **Output**: Segmentation mask
- **Use Case**: General purpose (people, objects, products)
- **Quality**: High (slightly lighter backbone)
- **Speed**: Medium

### u2net_quant.onnx
- **Size**: ~44 MB (quantized)
- **Input**: RGB image (3 channels)
- **Input Shape**: [1, 3, 320, 320]
- **Output**: Segmentation mask
- **Use Case**: General purpose, optimized for web
- **Quality**: Good
- **Speed**: Fast

## Git LFS (Optional)

If you want to commit models to git:

```bash
# Install git-lfs
brew install git-lfs
git lfs install

# Track ONNX files
git lfs track "*.onnx"
git add .gitattributes

# Add and commit model
git add public/models/*.onnx
git commit -m "Add U2-Net ONNX model"
```

## CDN Hosting (Production)

For production, host models on a CDN:

- **GitHub Releases**: Upload to releases and reference by URL
- **Hugging Face**: Use Hugging Face model hub
- **Custom CDN**: AWS S3, Cloudflare R2, etc.

Example in code:
```typescript
const MODEL_URL = 'https://your-cdn.example.com/models/u2netp.onnx';
```

## License

U2-Net model is released under Apache-2.0 License.

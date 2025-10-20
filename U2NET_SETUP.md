# U2-Net Setup Guide

## Quick Start

U2-Net은 일반 목적의 배경 제거 모델로, 사람뿐만 아니라 물체, 제품 등 다양한 대상에 사용할 수 있습니다.

### Step 1: 모델 다운로드

프로젝트 루트에서 다음 명령어 중 하나를 실행하세요:

#### 옵션 A: Full Model (권장 - 최고 품질)
```bash
wget https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx -P public/models/
```

**파일 크기**: ~176 MB
**품질**: 최고
**속도**: 중간 (~300-500ms)

#### 옵션 B: Quantized Model (빠른 속도)
```bash
wget https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_quant.onnx -O public/models/u2net.onnx
```

**파일 크기**: ~44 MB
**품질**: 우수
**속도**: 빠름 (~200-300ms)

### Step 2: 프로젝트 실행

```bash
# 개발 서버 시작
pnpm dev

# 브라우저에서 접속
open http://localhost:5176/remove-bg/
```

### Step 3: 모델 선택

1. 웹 앱에서 **"Select AI Model"** 섹션을 확인
2. **U2-Net** 모델 선택
3. 이미지 업로드

## 수동 다운로드

wget이 없는 경우 브라우저에서 직접 다운로드:

1. 이 링크를 브라우저에서 열기:
   - Full: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
   - Quantized: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_quant.onnx

2. 다운로드한 파일을 `public/models/u2net.onnx`로 저장

## 대체 소스

### Hugging Face
```bash
# 다른 U2-Net 변형들
wget https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model.onnx -O public/models/u2net.onnx
```

### 직접 변환
PyTorch 모델을 ONNX로 변환하려면:

```python
# requirements: torch, onnx, u2net_model

import torch
from u2net import U2NET

# Load model
model = U2NET(3, 1)
model.load_state_dict(torch.load('u2net.pth'))
model.eval()

# Export to ONNX
dummy_input = torch.randn(1, 3, 320, 320)
torch.onnx.export(
    model,
    dummy_input,
    "u2net.onnx",
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch'}, 'output': {0: 'batch'}}
)
```

## 모델 정보

### 입력
- **형식**: RGB 이미지
- **형태**: [1, 3, 320, 320]
- **타입**: float32
- **범위**: [0, 1] (정규화됨)

### 출력
- **형식**: Segmentation mask
- **형태**: [1, 1, 320, 320]
- **타입**: float32
- **범위**: [0, 1] (확률)

## WebGPU vs WASM

U2-Net은 자동으로 최적의 실행 환경을 선택합니다:

### WebGPU (GPU 가속)
- **지원**: Chrome 113+, Edge 113+
- **속도**: 매우 빠름
- **메모리**: GPU 메모리 사용

### WASM (CPU Fallback)
- **지원**: 모든 모던 브라우저
- **속도**: 중간
- **메모리**: CPU 메모리 사용

## 문제 해결

### 모델 파일을 찾을 수 없음
```
Error: Failed to initialize U2-Net model. Please ensure the model file is available.
```

**해결 방법**:
1. `public/models/u2net.onnx` 파일이 존재하는지 확인
2. 파일 크기가 0보다 큰지 확인 (최소 40MB)
3. 파일 권한 확인

### 메모리 부족
```
Error: Out of memory
```

**해결 방법**:
1. Quantized 모델 사용 (44MB)
2. 이미지 크기 줄이기
3. 다른 탭 닫기

### 느린 처리 속도
**최적화 팁**:
1. WebGPU 지원 브라우저 사용 (Chrome/Edge 최신 버전)
2. Quantized 모델 사용
3. 이미지 크기 줄이기 (1920px 이하)

## 성능 비교

| 모델 | 파일 크기 | 처리 시간 | 품질 | 용도 |
|------|----------|----------|------|------|
| MediaPipe | ~5MB | 50-100ms | ⭐⭐⭐⭐ | 인물 전용 |
| U2-Net Full | 176MB | 300-500ms | ⭐⭐⭐⭐⭐ | 범용 (권장) |
| U2-Net Quant | 44MB | 200-300ms | ⭐⭐⭐⭐ | 범용 (빠름) |

## 프로덕션 배포

GitHub Pages나 다른 정적 호스팅에 배포 시:

### 방법 1: Git LFS 사용
```bash
git lfs track "*.onnx"
git add .gitattributes public/models/*.onnx
git commit -m "Add U2-Net model"
```

### 방법 2: CDN 호스팅
모델을 별도의 CDN에 업로드하고 코드 수정:

```typescript
// src/services/U2NetBackgroundRemoval.ts
const MODEL_PATH = 'https://your-cdn.com/models/u2net.onnx';
```

### 방법 3: 지연 로딩
사용자가 처음 U2-Net을 선택할 때 다운로드:

```typescript
// 이미 구현되어 있음 - initialize() 메서드가 지연 로딩 처리
```

## 라이선스

U2-Net 모델은 Apache-2.0 License 하에 배포됩니다.

- Original paper: https://arxiv.org/abs/2005.09007
- GitHub: https://github.com/xuebinqin/U-2-Net
- Citation:
  ```
  @InProceedings{Qin_2020_PR,
    title = {U2-Net: Going Deeper with Nested U-Structure for Salient Object Detection},
    author = {Qin, Xuebin and Zhang, Zichen and Huang, Chenyang and Dehghan, Masood and Zaiane, Osmar and Jagersand, Martin},
    journal = {Pattern Recognition},
    volume = {106},
    pages = {107404},
    year = {2020}
  }
  ```

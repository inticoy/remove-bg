# 아키텍처 문서

## 프로젝트 구조

```
remove-bg/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 배포 설정
├── dist/                        # 빌드 결과물 (생성됨)
├── node_modules/               # 의존성 (생성됨)
├── public/                     # 정적 파일 (필요시 추가)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # 헤더 컴포넌트
│   │   │   └── Footer.tsx      # 푸터 컴포넌트
│   │   ├── ui/
│   │   │   ├── FileUploader.tsx      # 파일 업로드 컴포넌트
│   │   │   ├── ProgressBar.tsx       # 진행률 표시
│   │   │   ├── ImagePreview.tsx      # 이미지 미리보기
│   │   │   └── DownloadButton.tsx    # 다운로드 버튼
│   │   └── features/           # 기능별 컴포넌트 (확장 가능)
│   ├── services/
│   │   └── MediaPipeBackgroundRemoval.ts  # MediaPipe 서비스
│   ├── hooks/
│   │   └── useBackgroundRemoval.ts   # 배경 제거 훅
│   ├── utils/
│   │   └── imageUtils.ts       # 이미지 처리 유틸리티
│   ├── types/
│   │   └── index.ts           # TypeScript 타입 정의
│   ├── styles/
│   │   └── index.css          # 글로벌 스타일
│   ├── assets/                # 이미지, 아이콘 등
│   ├── App.tsx                # 메인 앱 컴포넌트
│   ├── main.tsx               # 앱 진입점
│   └── vite-env.d.ts          # Vite 타입 정의
├── .eslintrc.cjs              # ESLint 설정
├── .gitignore
├── index.html                 # HTML 템플릿
├── package.json               # 의존성 및 스크립트
├── tsconfig.json              # TypeScript 설정
├── tsconfig.node.json         # Node용 TypeScript 설정
├── vite.config.ts             # Vite 설정
├── tailwind.config.js         # Tailwind CSS 설정
├── postcss.config.js          # PostCSS 설정
├── LICENSE                    # 라이선스
├── README.md                  # 프로젝트 문서
├── USAGE.md                   # 사용 가이드
├── ARCHITECTURE.md            # 아키텍처 문서 (이 파일)
└── spec.md                    # 프로젝트 스펙
```

## 레이어 아키텍처

### 1. Presentation Layer (컴포넌트)

**책임**: UI 렌더링, 사용자 인터랙션 처리

```
App.tsx (최상위)
  ├── Header.tsx
  ├── FileUploader.tsx
  ├── ProgressBar.tsx
  ├── ImagePreview.tsx
  ├── DownloadButton.tsx
  └── Footer.tsx
```

**특징**:
- Pure 컴포넌트 우선
- Props를 통한 데이터 전달
- Framer Motion을 통한 애니메이션
- Glassmorphism 디자인 시스템

### 2. Business Logic Layer (훅 & 서비스)

**Hook Layer** ([src/hooks](src/hooks)):
```typescript
useBackgroundRemoval
  ├── 상태 관리 (status, progress, error, result)
  ├── 이미지 처리 플로우 제어
  └── 서비스 레이어 호출
```

**Service Layer** ([src/services](src/services)):
```typescript
MediaPipeBackgroundRemoval
  ├── AI 모델 초기화
  ├── 스크립트 동적 로딩
  ├── 배경 제거 알고리즘
  └── 리소스 정리
```

**특징**:
- Singleton 패턴 (서비스)
- Interface 기반 설계 (확장성)
- 에러 핸들링 통합

### 3. Utility Layer (유틸리티)

**Image Utils** ([src/utils/imageUtils.ts](src/utils/imageUtils.ts)):
```typescript
- loadImageFromFile()        // File → HTMLImageElement
- imageToImageData()          // HTMLImageElement → ImageData
- imageDataToDataURL()        // ImageData → DataURL
- softenEdges()              // 경계 부드럽게
- downloadImage()            // 이미지 다운로드
- isValidImageFile()         // 파일 검증
```

**특징**:
- 순수 함수
- 재사용 가능
- 테스트 가능

### 4. Type Layer (타입 정의)

**Core Types** ([src/types/index.ts](src/types/index.ts)):
```typescript
- ImageFormat              // 'png' | 'webp'
- ProcessingStatus         // 처리 상태
- ProcessedImage          // 처리된 이미지 데이터
- BackgroundRemovalOptions // 옵션
- BackgroundRemovalService // 서비스 인터페이스
- BackgroundColor         // 배경 색상
```

**특징**:
- 타입 안전성
- 자동완성 지원
- 문서화 역할

## 데이터 플로우

### 1. 이미지 업로드 플로우

```
User Action (drag/click)
    ↓
FileUploader.onFileSelect(file)
    ↓
App.handleFileSelect(file)
    ↓
useBackgroundRemoval.processImage(file, options)
    ↓
    ├─→ setStatus('loading')
    ├─→ serviceRef.initialize()
    ├─→ setStatus('processing')
    ├─→ loadImageFromFile(file)
    ├─→ imageToImageData(image)
    ├─→ service.removeBackground(imageData)
    ├─→ [Optional] softenEdges(processedData)
    ├─→ imageDataToDataURL(processedData)
    ├─→ setResult(processedImage)
    └─→ setStatus('completed')
```

### 2. 상태 관리 플로우

```typescript
// Hook 내부 상태
{
  status: ProcessingStatus,     // 'idle' | 'loading' | 'processing' | 'completed' | 'error'
  progress: number,             // 0-100
  error: string | null,         // 에러 메시지
  result: ProcessedImage | null // 처리 결과
}

// 상태 전환
idle → loading → processing → completed
  ↓                             ↓
  └──────────→ error ←──────────┘
```

### 3. MediaPipe 초기화 플로우

```
initialize()
    ↓
loadScript()
    ├─→ camera_utils.js 로드
    └─→ selfie_segmentation.js 로드
    ↓
window.SelfieSegmentation 사용 가능
    ↓
new SelfieSegmentation({ locateFile })
    ↓
setOptions({ modelSelection, selfieMode })
    ↓
initialized = true
```

## 디자인 패턴

### 1. Singleton Pattern (서비스)

```typescript
// 싱글톤 인스턴스
let instance: MediaPipeBackgroundRemoval | null = null;

export const getMediaPipeService = () => {
  if (!instance) {
    instance = new MediaPipeBackgroundRemoval();
  }
  return instance;
};
```

**이유**:
- AI 모델은 한 번만 초기화
- 메모리 효율성
- 상태 공유

### 2. Interface Segregation (서비스 인터페이스)

```typescript
export interface BackgroundRemovalService {
  initialize(): Promise<void>;
  removeBackground(imageData: ImageData): Promise<ImageData>;
  cleanup(): void;
  isInitialized(): boolean;
}
```

**이유**:
- 다른 모델 추가 시 동일한 인터페이스 사용
- 교체 가능성 (U2-Net, BRIA 등)
- 테스트 용이성

### 3. Custom Hook Pattern (상태 관리)

```typescript
export const useBackgroundRemoval = () => {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  // ... 로직
  return { status, processImage, reset, cleanup };
};
```

**이유**:
- 비즈니스 로직 재사용
- 컴포넌트 단순화
- 테스트 가능한 로직

### 4. Composition Pattern (컴포넌트)

```typescript
<App>
  <Header />
  <FileUploader onFileSelect={...} />
  <ImagePreview originalSrc={...} processedSrc={...} />
  <DownloadButton dataURL={...} />
  <Footer />
</App>
```

**이유**:
- 재사용 가능한 작은 컴포넌트
- 관심사 분리
- 유지보수 용이

## 확장 포인트

### 1. 새로운 AI 모델 추가

```typescript
// src/services/U2NetService.ts
export class U2NetService implements BackgroundRemovalService {
  // BackgroundRemovalService 인터페이스 구현
}

// Hook에서 사용
const [selectedModel, setSelectedModel] = useState<'mediapipe' | 'u2net'>('mediapipe');
const serviceRef = useRef(
  selectedModel === 'mediapipe'
    ? getMediaPipeService()
    : getU2NetService()
);
```

### 2. 후처리 옵션 추가

```typescript
// src/utils/imageUtils.ts
export const applyColorCorrection = (imageData: ImageData): ImageData => {
  // 색상 보정 로직
};

// Hook에서 적용
if (options.colorCorrection) {
  processedData = applyColorCorrection(processedData);
}
```

### 3. 배치 처리 기능

```typescript
// src/hooks/useBatchProcessing.ts
export const useBatchProcessing = () => {
  const processMultiple = async (files: File[]) => {
    // 여러 파일 처리 로직
  };
  return { processMultiple };
};
```

### 4. 모델 선택 UI

```typescript
// src/components/features/ModelSelector.tsx
export const ModelSelector = ({ onSelect }) => {
  const models = ['MediaPipe', 'U2-Net', 'BRIA'];
  // 모델 선택 UI
};
```

## 성능 최적화

### 1. 코드 스플리팅
- Vite의 자동 청크 분할
- Dynamic import 사용 가능

### 2. 메모리 관리
```typescript
cleanup(): void {
  if (this.selfieSegmentation) {
    this.selfieSegmentation.close();
    this.selfieSegmentation = null;
  }
}
```

### 3. CDN 로딩
- MediaPipe 스크립트 CDN에서 로드
- 번들 크기 최소화 (276KB → 89KB gzipped)

### 4. 이미지 최적화
- Canvas API 사용
- 필요시 자동 리사이징

## 보안 고려사항

### 1. 클라이언트 사이드 처리
- 서버 업로드 없음
- 완전한 프라이버시

### 2. 파일 검증
```typescript
export const isValidImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};
```

### 3. CORS 정책
- CDN 리소스 crossOrigin 속성 설정

## 빌드 & 배포

### Development
```bash
pnpm dev
# http://localhost:5176/remove-bg/
```

### Production Build
```bash
pnpm build
# 결과물: dist/
```

### GitHub Pages 배포
- `.github/workflows/deploy.yml` 자동 실행
- main 브랜치 푸시 시 배포
- `base: '/remove-bg/'` 설정

## 의존성 관리

### Runtime Dependencies
```json
{
  "framer-motion": "애니메이션",
  "react": "UI 프레임워크",
  "react-dom": "React DOM 렌더링"
}
```

### Dev Dependencies
```json
{
  "vite": "빌드 도구",
  "typescript": "타입 체킹",
  "tailwindcss": "스타일링",
  "eslint": "린팅"
}
```

### External (CDN)
- `@mediapipe/selfie_segmentation`
- `@mediapipe/camera_utils`

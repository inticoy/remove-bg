# 사용 가이드

## 기본 사용법

1. **이미지 업로드**
   - 메인 화면의 업로드 영역을 클릭하거나
   - 이미지 파일을 드래그 앤 드롭

2. **자동 처리**
   - 이미지가 자동으로 처리됩니다
   - AI가 배경을 제거합니다
   - 진행률이 표시됩니다

3. **결과 확인**
   - Original/Processed 탭으로 전환 가능
   - 배경 색상 선택 (투명/흰색/검은색)

4. **다운로드**
   - PNG 또는 WebP 포맷 선택
   - Download 버튼 클릭

## 기능 추가 가이드

### 새로운 AI 모델 추가하기

1. **서비스 클래스 생성**
```typescript
// src/services/NewModelService.ts
import type { BackgroundRemovalService } from '@/types';

export class NewModelService implements BackgroundRemovalService {
  async initialize(): Promise<void> {
    // 모델 초기화 로직
  }

  async removeBackground(imageData: ImageData): Promise<ImageData> {
    // 배경 제거 로직
  }

  cleanup(): void {
    // 정리 로직
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
```

2. **Hook에서 사용**
```typescript
// src/hooks/useBackgroundRemoval.ts에서
import { getNewModelService } from '@/services/NewModelService';

const serviceRef = useRef(getNewModelService());
```

### 새로운 후처리 옵션 추가

1. **타입 정의 업데이트**
```typescript
// src/types/index.ts
export interface BackgroundRemovalOptions {
  // 기존 옵션...
  newOption?: boolean;
}
```

2. **유틸리티 함수 추가**
```typescript
// src/utils/imageUtils.ts
export const applyNewEffect = (imageData: ImageData): ImageData => {
  // 효과 적용 로직
};
```

3. **Hook에서 적용**
```typescript
// src/hooks/useBackgroundRemoval.ts
if (options.newOption) {
  processedData = applyNewEffect(processedData);
}
```

### 새로운 UI 컴포넌트 추가

1. **컴포넌트 생성**
```typescript
// src/components/ui/NewComponent.tsx
export const NewComponent = () => {
  return (
    <motion.div className="glass-card p-6">
      {/* 컴포넌트 내용 */}
    </motion.div>
  );
};
```

2. **App.tsx에서 사용**
```typescript
import { NewComponent } from '@/components/ui/NewComponent';
```

## 코드 구조 이해하기

### 데이터 플로우

```
User Upload File
    ↓
FileUploader Component
    ↓
App Component (handleFileSelect)
    ↓
useBackgroundRemoval Hook
    ↓
MediaPipeBackgroundRemoval Service
    ↓
ImageUtils (processing)
    ↓
Result State Update
    ↓
ImagePreview Component
```

### 주요 디렉토리

- **components/**: React 컴포넌트
  - `layout/`: 레이아웃 컴포넌트 (Header, Footer)
  - `ui/`: 재사용 가능한 UI 컴포넌트
  - `features/`: 기능별 컴포넌트 (향후 확장)

- **services/**: 비즈니스 로직
  - AI 모델 서비스
  - Singleton 패턴 사용

- **hooks/**: React 커스텀 훅
  - 상태 관리
  - 사이드 이펙트 처리

- **utils/**: 유틸리티 함수
  - 이미지 처리
  - 파일 다운로드
  - 검증 로직

- **types/**: TypeScript 타입 정의
  - 전역 타입
  - 인터페이스

## 성능 최적화 팁

1. **이미지 크기 제한**
```typescript
// 큰 이미지 자동 리사이징
if (image.width > 2048) {
  // 리사이징 로직
}
```

2. **메모리 정리**
```typescript
// 컴포넌트 언마운트 시
useEffect(() => {
  return () => {
    cleanup();
  };
}, []);
```

3. **Lazy Loading**
```typescript
// 필요할 때만 모델 로드
const service = lazy(() => import('@/services/ModelService'));
```

## 디자인 커스터마이징

### Glassmorphism 색상 변경

```css
/* src/styles/index.css */
.glass-card {
  @apply backdrop-blur-xl bg-white/10 border border-white/20;
}
```

### 그라데이션 배경 변경

```css
body {
  @apply bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500;
}
```

### 애니메이션 조정

```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }} // 여기서 조정
>
```

## 트러블슈팅

### MediaPipe 로딩 실패
- CDN 연결 확인
- 브라우저 콘솔에서 에러 확인
- CORS 정책 확인

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
rm -rf node_modules dist
pnpm install
pnpm build
```

### 타입 에러
```bash
# TypeScript 재검사
pnpm tsc --noEmit
```

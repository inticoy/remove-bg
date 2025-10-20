배경제거 웹앱 계획서 (pnpm + React, GitHub Pages)
1) 프로젝트 개요

목표: 브라우저 온디바이스 추론으로 이미지 배경 제거 제공. 서버/클라우드 API 없이 동작.

핵심 특징: 3가지 모델 중 선택 → 실행 → 결과 미리보기/다운로드.

호스팅: GitHub Pages(정적).

2) 기술 스택

Frontend: Vite + React, TypeScript 선택사항

Package: pnpm

Runtime: onnxruntime-web(WebGPU/WASM), MediaPipe Selfie Segmentation

빌드/배포: GitHub Actions → GH Pages

3) 모델 구성(3가지)

MediaPipe(Selfie Segmentation)

용도: 사람(프로필컷) 전용, 최고 속도

장점: 100% JS, 모바일 포함 반응 빠름

U²-Net / ISNet (ONNX)

용도: 사람+사물 전반, 균형 모드

장점: 가볍고 안정적, rembg-equivalent

BRIA RMBG-1.4 (ONNX)

용도: 고화질 모드(경계/머리카락 우수)

비고: 라이선스 고지/가중치 취급 주의(옵트인·지연 로딩)

4) 사용자 사용 루트(UX Flow)

Landing

드래그&드롭/클릭 업로드(단일 이미지)

업로드 즉시 사람/사물 감지 힌트로 기본 모델 추천 표시

모델 선택

셀렉트: 빠름(MediaPipe) / 균형(U²-Net) / 고화질(BRIA)

선택 시 해당 모델 지연 로딩(첫 실행 전까지 파일 미다운로드)

실행(“Remove Background”)

진행 상태 표시(로더/퍼센트)

완료 후 미리보기(체커보드 배경/배경색 선택)

다운로드

PNG/WebP 저장(투명 알파 유지)

옵션: 경계 소프트닝 토글(가우시안 약하게), 사이즈 리스케일

신뢰 안내

“이미지는 로컬에서만 처리됩니다(온디바이스)” 메시지

5) 화면/컴포넌트 구조(요약)

Header: 로고/타이틀, GitHub 링크

Uploader: 파일 드롭존 + 썸네일

ModelSelector: 3-옵션 라디오/셀렉트 + WebGPU 지원 뱃지

RunPanel: 실행 버튼 + 로딩/오류 메시지

Preview: 입력/결과 탭, 배경색 선택, 소프트닝 토글

DownloadBar: PNG/WebP 저장 버튼

Footer: 라이선스/크레딧(모델별 고지)

6) 데이터/프라이버시

모든 처리는 브라우저 메모리/Canvas 상에서 수행

네트워크 전송 없음(외부 모델 파일 fetch 제외)

업로드 이미지 저장/서버 전송하지 않음

7) 성능/호환 전략

WebGPU 감지 → 있으면 GPU 가속, 없으면 WASM 폴백

입력 해상도 슬라이더(예: Auto / 1024 / 768 / 512)로 속도-품질 제어

모델 파일은 public/models/...에 두고 chunk split + lazy load

대형 가중치(BRIA)는 외부 CDN/HF 동적 로딩 또는 Git LFS

8) 라이선스/크레딧(운영 가이드)

MediaPipe, U²-Net/ISNet: Apache-2.0 고지(About/Credits에 프로젝트명·저자·링크)

BRIA RMBG-1.4: 모델 카드 라이선스 확인 → 옵트인 사용 + 고지

리포지토리에 LICENSE/NOTICE 포함

9) 작업 단계(마일스톤)

M1: 프로젝트 셋업(pnpm, Vite, React), 기본 UI 골조, 업로더/프리뷰

M2: MediaPipe 통합(사람 전용) + 다운로드

M3: U²-Net/ISNet(ONNX) 통합(onnxruntime-web, lazy load)

M4: BRIA RMBG-1.4 통합(WebGPU 폴백, 라이선스 고지)

M5: 후처리 옵션(소프트닝, 배경색), WebGPU 배지, 에러 핸들링

M6: GH Pages 배포 + README/크레딧 정리

10) 완료 기준(Acceptance)

세 모델 모두 브라우저 온디바이스에서 실행

업로드→모델 선택→실행→결과 미리보기→PNG/WebP 다운로드가 원클릭 플로우로 동작

WebGPU 미지원 환경에서도 WASM 폴백으로 동작

페이지 내 라이선스/크레딧 명시 및 프라이버시 안내 표시
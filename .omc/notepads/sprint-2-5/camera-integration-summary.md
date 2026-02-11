# 카메라 연동 구현 완료 (태스크 2.5.12)

## 구현 날짜
2026-02-08

## 구현 내용

### 1. 패키지 설치
- `expo-camera@17.0.10`: 카메라 촬영 기능
- `expo-image-picker@17.0.10`: 갤러리/카메라 이미지 선택
- `@tamagui/lucide-icons@2.0.0-rc.6`: 아이콘 라이브러리

### 2. 권한 설정 (app.config.ts)

#### iOS
- `NSCameraUsageDescription`: 카메라 권한 설명
- `NSPhotoLibraryUsageDescription`: 사진 라이브러리 권한 설명
- `expo-camera` 플러그인 설정
- `expo-image-picker` 플러그인 설정

#### Android
- `CAMERA`: 카메라 권한
- `READ_EXTERNAL_STORAGE`: 외부 저장소 읽기
- `WRITE_EXTERNAL_STORAGE`: 외부 저장소 쓰기
- `READ_MEDIA_IMAGES`: 미디어 이미지 읽기 (Android 13+)

### 3. 타입 정의
**파일**: `src/features/work/types/image.types.ts`

```typescript
interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

interface ImageUploadState {
  uri: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}
```

### 4. useImagePicker 훅
**파일**: `src/features/work/hooks/useImagePicker.ts`

**기능**:
- 카메라로 사진 촬영
- 갤러리에서 사진 선택 (다중 선택 지원)
- 이미지 삭제
- 최대 5장 제한
- 권한 요청 처리

**반환값**:
```typescript
{
  images: ImageInfo[];
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  removeImage: (uri: string) => void;
  clearImages: () => void;
  canAddMore: boolean;
  remainingSlots: number;
  maxImages: number;
}
```

### 5. ImagePickerButton 컴포넌트
**파일**: `src/features/work/components/ImagePickerButton.tsx`

**기능**:
- iOS: ActionSheet로 옵션 선택
- Android: Alert 다이얼로그로 옵션 선택
- 카메라/갤러리 선택 UI 제공
- 최대 개수 도달 시 비활성화

**Props**:
```typescript
{
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
  disabled?: boolean;
  canAddMore?: boolean;
}
```

### 6. ImagePreviewList 컴포넌트
**파일**: `src/features/work/components/ImagePreviewList.tsx`

**기능**:
- 선택된 이미지 미리보기 (100x100px)
- 삭제 버튼 (우측 상단)
- 순서 표시 (좌측 하단)
- 가로 스크롤 지원
- 이미지 개수 표시

**Props**:
```typescript
{
  images: ImageInfo[];
  onRemove: (uri: string) => void;
  maxImages?: number;
}
```

### 7. 작업 결과 화면 통합
**파일**: `app/(main)/work/[id]/result.tsx`

**변경사항**:
- `useImagePicker` 훅 통합
- `ImagePickerButton` 추가
- `ImagePreviewList` 추가
- 이미지 업로드 로직 연결
- 제출 시 이미지 URI 배열 전달

## 기술적 결정

### 1. 이미지 품질
- 품질: 0.8 (80%)
- 이유: 파일 크기와 품질의 균형

### 2. 최대 이미지 개수
- 최대: 5장
- 이유: 서버 부하 및 UX 고려

### 3. 편집 기능
- iOS: 촬영 후 크롭/회전 가능 (`allowsEditing: true`)
- 비율: 4:3
- 이유: 현장 사진의 일반적인 비율

### 4. UI 패턴
- iOS: ActionSheet (네이티브 경험)
- Android: Alert 다이얼로그
- 이유: 각 플랫폼의 UX 가이드라인 준수

## 테스트 체크리스트

### 권한 테스트
- [ ] iOS 카메라 권한 요청
- [ ] iOS 사진 라이브러리 권한 요청
- [ ] Android 카메라 권한 요청
- [ ] Android 갤러리 권한 요청
- [ ] 권한 거부 시 적절한 안내

### 기능 테스트
- [ ] 카메라로 사진 촬영
- [ ] 갤러리에서 단일 사진 선택
- [ ] 갤러리에서 다중 사진 선택 (최대 5장)
- [ ] 이미지 미리보기 표시
- [ ] 이미지 삭제
- [ ] 최대 개수 도달 시 버튼 비활성화
- [ ] 작업 결과 제출 시 이미지 업로드

### 플랫폼별 테스트
- [ ] iOS 실제 기기 테스트
- [ ] Android 실제 기기 테스트
- [ ] ActionSheet 동작 확인 (iOS)
- [ ] Alert 다이얼로그 동작 확인 (Android)

## 다음 단계

### 1. 이미지 업로드 API 구현
- 파일 업로드 엔드포인트 호출
- 진행률 표시
- 에러 처리

### 2. 이미지 압축 (선택사항)
- 큰 이미지 자동 리사이징
- 메모리 최적화

### 3. 오프라인 지원 (선택사항)
- 로컬 캐싱
- 네트워크 복구 시 자동 업로드

## 참고사항

- 모든 코드는 TypeScript strict mode 준수
- any 타입 사용 없음
- Tamagui 스타일 시스템 사용 (네이티브 UI 제외)
- 한국어 주석 및 메시지

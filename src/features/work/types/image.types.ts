/**
 * 이미지 정보 타입
 */
export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * 이미지 업로드 상태
 */
export interface ImageUploadState {
  uri: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

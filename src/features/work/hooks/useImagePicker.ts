/**
 * 이미지 선택 훅
 *
 * expo-image-picker를 사용하여 카메라/갤러리에서 이미지 선택
 * Expo Go에서는 네이티브 모듈이 없으므로 graceful fallback 처리
 */
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import type { ImageInfo } from '../types/image.types';

/**
 * 이미지 선택 최대 개수
 */
const MAX_IMAGES = 5;

/**
 * ImagePicker 타입 (동적 로드용)
 */
type ImagePickerModule = typeof import('expo-image-picker');

/**
 * 이미지 선택 및 관리 훅
 */
export function useImagePicker() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [imagePicker, setImagePicker] = useState<ImagePickerModule | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // expo-image-picker 동적 로드
  useEffect(() => {
    const loadImagePicker = async () => {
      try {
        const module = await import('expo-image-picker');
        setImagePicker(module);
        setIsAvailable(true);
      } catch (error) {
        console.warn('expo-image-picker를 로드할 수 없습니다. Development Build가 필요합니다.');
        setIsAvailable(false);
      }
    };
    loadImagePicker();
  }, []);

  /**
   * 네이티브 모듈 사용 불가 알림
   */
  const showUnavailableAlert = useCallback(() => {
    Alert.alert(
      'Development Build 필요',
      '카메라/갤러리 기능을 사용하려면 Development Build가 필요합니다.\n\nExpo Go에서는 이 기능을 사용할 수 없습니다.',
      [{ text: '확인' }]
    );
  }, []);

  /**
   * 카메라로 사진 촬영
   */
  const pickFromCamera = useCallback(async () => {
    if (!imagePicker || !isAvailable) {
      showUnavailableAlert();
      return;
    }

    try {
      // 카메라 권한 요청
      const { status } = await imagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return;
      }

      // 이미지 개수 체크
      if (images.length >= MAX_IMAGES) {
        Alert.alert('최대 개수 초과', `최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
        return;
      }

      // 카메라 실행
      const result = await imagePicker.launchCameraAsync({
        mediaTypes: imagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newImage: ImageInfo = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type ?? undefined,
          fileName: asset.fileName ?? undefined,
          fileSize: asset.fileSize,
        };
        setImages((prev) => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('오류', '카메라 실행 중 오류가 발생했습니다.');
    }
  }, [images.length, imagePicker, isAvailable, showUnavailableAlert]);

  /**
   * 갤러리에서 사진 선택
   */
  const pickFromGallery = useCallback(async () => {
    if (!imagePicker || !isAvailable) {
      showUnavailableAlert();
      return;
    }

    try {
      // 갤러리 권한 요청
      const { status } = await imagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 선택 가능한 개수 계산
      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        Alert.alert('최대 개수 초과', `최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
        return;
      }

      // 갤러리 실행
      const result = await imagePicker.launchImageLibraryAsync({
        mediaTypes: imagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages: ImageInfo[] = result.assets.map((asset) => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type ?? undefined,
          fileName: asset.fileName ?? undefined,
          fileSize: asset.fileSize,
        }));
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('오류', '갤러리 실행 중 오류가 발생했습니다.');
    }
  }, [images.length, imagePicker, isAvailable, showUnavailableAlert]);

  /**
   * 이미지 삭제
   */
  const removeImage = useCallback((uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  }, []);

  /**
   * 모든 이미지 삭제
   */
  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  /**
   * 이미지 개수 체크
   */
  const canAddMore = images.length < MAX_IMAGES;
  const remainingSlots = MAX_IMAGES - images.length;

  return {
    images,
    pickFromCamera,
    pickFromGallery,
    removeImage,
    clearImages,
    canAddMore,
    remainingSlots,
    maxImages: MAX_IMAGES,
    isAvailable,
  };
}

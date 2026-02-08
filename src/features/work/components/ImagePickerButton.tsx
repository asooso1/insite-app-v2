import { useCallback } from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { XStack } from 'tamagui';
import { Button } from '@/components/ui/Button';

interface ImagePickerButtonProps {
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
  disabled?: boolean;
  canAddMore?: boolean;
}

/**
 * 이미지 선택 버튼 컴포넌트
 * - iOS: ActionSheet 표시
 * - Android: Alert 다이얼로그 표시
 */
export function ImagePickerButton({
  onPickFromCamera,
  onPickFromGallery,
  disabled = false,
  canAddMore = true,
}: ImagePickerButtonProps) {
  /**
   * 이미지 선택 옵션 표시
   */
  const handlePress = useCallback(() => {
    if (!canAddMore) {
      Alert.alert('알림', '더 이상 사진을 추가할 수 없습니다.');
      return;
    }

    if (Platform.OS === 'ios') {
      // iOS: ActionSheet 사용
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '카메라로 촬영', '갤러리에서 선택'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onPickFromCamera();
          } else if (buttonIndex === 2) {
            onPickFromGallery();
          }
        }
      );
    } else {
      // Android: Alert 다이얼로그 사용
      Alert.alert(
        '사진 첨부',
        '사진을 어떻게 추가하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '카메라로 촬영',
            onPress: onPickFromCamera,
          },
          {
            text: '갤러리에서 선택',
            onPress: onPickFromGallery,
          },
        ],
        { cancelable: true }
      );
    }
  }, [canAddMore, onPickFromCamera, onPickFromGallery]);

  return (
    <Button
      variant="primary"
      size="md"
      fullWidth
      onPress={handlePress}
      disabled={disabled || !canAddMore}
    >
      사진 추가
    </Button>
  );
}

/**
 * 카메라/갤러리 선택 버튼 (별도 버튼 형태)
 */
export function ImagePickerButtons({
  onPickFromCamera,
  onPickFromGallery,
  disabled = false,
  canAddMore = true,
}: ImagePickerButtonProps) {
  return (
    <XStack gap="$3">
      <Button
        variant="primary"
        size="md"
        onPress={onPickFromCamera}
        disabled={disabled || !canAddMore}
      >
        카메라
      </Button>
      <Button
        variant="outline"
        size="md"
        onPress={onPickFromGallery}
        disabled={disabled || !canAddMore}
      >
        갤러리
      </Button>
    </XStack>
  );
}

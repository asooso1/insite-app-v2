import { Image as RNImage, TouchableOpacity, StyleSheet } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import type { ImageInfo } from '../types/image.types';

interface ImagePreviewListProps {
  images: ImageInfo[];
  onRemove: (uri: string) => void;
  maxImages?: number;
}

/**
 * 이미지 미리보기 리스트 컴포넌트
 * - 가로 스크롤 가능한 이미지 목록
 * - 각 이미지마다 삭제 버튼 표시
 */
export function ImagePreviewList({ images, onRemove, maxImages = 5 }: ImagePreviewListProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <YStack gap="$2">
      {/* 이미지 개수 표시 */}
      <Text fontSize="$3" color="$gray600">
        첨부된 사진 ({images.length}/{maxImages})
      </Text>

      {/* 이미지 목록 */}
      <XStack gap="$3" flexWrap="wrap">
        {images.map((image, index) => (
          <ImagePreviewItem key={image.uri} image={image} index={index} onRemove={onRemove} />
        ))}
      </XStack>
    </YStack>
  );
}

interface ImagePreviewItemProps {
  image: ImageInfo;
  index: number;
  onRemove: (uri: string) => void;
}

/**
 * 개별 이미지 미리보기 아이템
 */
function ImagePreviewItem({ image, index, onRemove }: ImagePreviewItemProps) {
  return (
    <YStack position="relative" width={100} height={100}>
      {/* 이미지 */}
      <RNImage source={{ uri: image.uri }} style={styles.image} resizeMode="cover" />

      {/* 삭제 버튼 */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onRemove(image.uri)}
        activeOpacity={0.8}
      >
        <X size={16} color="white" />
      </TouchableOpacity>

      {/* 순서 표시 */}
      <YStack style={styles.indexBadge}>
        <Text fontSize="$1" color="$white" fontWeight="600">
          {index + 1}
        </Text>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  indexBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

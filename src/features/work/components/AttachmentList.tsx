/**
 * 첨부 파일 목록 컴포넌트
 *
 * 작업지시의 첨부 파일 목록을 표시하고 열기 기능 제공
 */
import React from 'react';
import { Linking, Alert } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@/components/ui/Card';
import type { AttachmentDTO } from '@/api/generated/models';

interface AttachmentListProps {
  attachments?: AttachmentDTO[];
}

/**
 * 파일 확장자로 아이콘 문자 반환
 */
function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📽️';
    case 'zip':
    case 'rar':
    case '7z':
      return '🗜️';
    default:
      return '📎';
  }
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환
 */
function formatFileSize(bytes?: number): string {
  if (!bytes) return '';

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 첨부 파일 항목 컴포넌트
 */
interface AttachmentItemProps {
  attachment: AttachmentDTO;
}

function AttachmentItem({ attachment }: AttachmentItemProps) {
  const icon = getFileIcon(attachment.fileName);
  const fileSize = formatFileSize(attachment.fileSize);

  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(attachment.fileUrl);

      if (canOpen) {
        await Linking.openURL(attachment.fileUrl);
      } else {
        Alert.alert('오류', '파일을 열 수 없습니다.');
      }
    } catch (error) {
      console.error('파일 열기 실패:', error);
      Alert.alert('오류', '파일을 여는 중 오류가 발생했습니다.');
    }
  };

  return (
    <XStack
      padding="$3"
      backgroundColor="$gray50"
      borderRadius="$2"
      gap="$3"
      alignItems="center"
      pressStyle={{
        backgroundColor: '$gray100',
        opacity: 0.9,
      }}
      onPress={handlePress}
    >
      <Text fontSize={24}>{icon}</Text>

      <YStack flex={1} gap="$1">
        <Text fontSize={14} fontWeight="500" color="$gray900" numberOfLines={1}>
          {attachment.fileName}
        </Text>

        {(fileSize || attachment.uploadDate) && (
          <XStack gap="$2" alignItems="center">
            {fileSize && (
              <Text fontSize={12} color="$gray500">
                {fileSize}
              </Text>
            )}
            {fileSize && attachment.uploadDate && (
              <Text fontSize={12} color="$gray400">
                •
              </Text>
            )}
            {attachment.uploadDate && (
              <Text fontSize={12} color="$gray500">
                {attachment.uploadDate}
              </Text>
            )}
          </XStack>
        )}
      </YStack>

      <Text fontSize={12} color="$primary" fontWeight="500">
        열기
      </Text>
    </XStack>
  );
}

/**
 * 첨부 파일 목록 컴포넌트
 *
 * @example
 * ```tsx
 * <AttachmentList attachments={workOrder.attachments} />
 * ```
 */
export function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <Card>
      <YStack gap="$3">
        <Text fontSize={16} fontWeight="700" color="$gray900">
          첨부 파일 ({attachments.length})
        </Text>

        <YStack gap="$2">
          {attachments.map((attachment) => (
            <AttachmentItem key={attachment.id} attachment={attachment} />
          ))}
        </YStack>
      </YStack>
    </Card>
  );
}

export default AttachmentList;

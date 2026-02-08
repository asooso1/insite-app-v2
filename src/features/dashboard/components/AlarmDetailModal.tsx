/**
 * 알람 상세 모달 컴포넌트
 */
import React from 'react';
import { YStack, XStack, Text, ScrollView } from 'tamagui';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import type { AlarmDTO } from '../types/alarm.types';
import {
  getAlarmSeverityColor,
  getAlarmSeverityIcon,
  getAlarmSeverityLabel,
} from '../constants/alarmColors';

interface AlarmDetailModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 알람 데이터 */
  alarm: AlarmDTO | null;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 확인 버튼 콜백 */
  onAcknowledge?: (alarmId: number) => void;
}

/**
 * 알람 상세 정보 모달
 */
export function AlarmDetailModal({
  visible,
  alarm,
  onClose,
  onAcknowledge,
}: AlarmDetailModalProps) {
  if (!alarm) {
    return null;
  }

  const handleAcknowledge = () => {
    onAcknowledge?.(alarm.id);
    onClose();
  };

  // 발생 시각 포맷팅
  const formattedDateTime = new Date(alarm.occurredAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const severityColor = getAlarmSeverityColor(alarm.severity);

  return (
    <Modal visible={visible} onClose={onClose} title="알람 상세">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" padding="$1">
          {/* 심각도 */}
          <YStack gap="$2">
            <XStack alignItems="center" gap="$2">
              <Text fontSize={24}>{getAlarmSeverityIcon(alarm.severity)}</Text>
              <Badge
                style={{
                  backgroundColor: severityColor,
                  borderWidth: 0,
                }}
                paddingHorizontal="$4"
                paddingVertical={8}
              >
                <Text fontSize={14} fontWeight="600" color="$white">
                  {getAlarmSeverityLabel(alarm.severity)}
                </Text>
              </Badge>
              {!alarm.isAcknowledged && (
                <Badge variant="error" size="md">
                  미확인
                </Badge>
              )}
            </XStack>
          </YStack>

          <Divider />

          {/* 제목 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$gray600">
              제목
            </Text>
            <Text fontSize={18} fontWeight="600" color="$gray900">
              {alarm.title}
            </Text>
          </YStack>

          {/* 상세 설명 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$gray600">
              상세 내용
            </Text>
            <Text fontSize={16} color="$gray800" lineHeight={24}>
              {alarm.description}
            </Text>
          </YStack>

          <Divider />

          {/* 발생 위치 */}
          <YStack gap="$3">
            <Text fontSize={14} fontWeight="600" color="$gray600">
              발생 위치
            </Text>

            <XStack gap="$2" alignItems="center">
              <Text fontSize={14} color="$gray500" width={80}>
                건물
              </Text>
              <Text fontSize={16} color="$gray900" flex={1}>
                {alarm.buildingName}
              </Text>
            </XStack>

            <XStack gap="$2" alignItems="center">
              <Text fontSize={14} color="$gray500" width={80}>
                층
              </Text>
              <Text fontSize={16} color="$gray900" flex={1}>
                {alarm.floorName}
              </Text>
            </XStack>

            <XStack gap="$2" alignItems="center">
              <Text fontSize={14} color="$gray500" width={80}>
                구역
              </Text>
              <Text fontSize={16} color="$gray900" flex={1}>
                {alarm.zoneName}
              </Text>
            </XStack>
          </YStack>

          <Divider />

          {/* 발생 시간 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$gray600">
              발생 시간
            </Text>
            <Text fontSize={16} color="$gray900">
              {formattedDateTime}
            </Text>
          </YStack>

          <Divider />

          {/* 조치 사항 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$gray600">
              조치 사항
            </Text>
            <YStack backgroundColor="$gray50" padding="$4" borderRadius="$3" gap="$2">
              <Text fontSize={14} color="$gray700" lineHeight={20}>
                • 발생 위치로 즉시 이동하여 상황을 확인하세요.
              </Text>
              <Text fontSize={14} color="$gray700" lineHeight={20}>
                • 필요시 관련 부서에 연락하세요.
              </Text>
              <Text fontSize={14} color="$gray700" lineHeight={20}>
                • 조치 완료 후 알람 확인 버튼을 누르세요.
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* 하단 버튼 */}
      <XStack gap="$3" marginTop="$4">
        <XStack flex={1}>
          <Button variant="outline" onPress={onClose} fullWidth>
            닫기
          </Button>
        </XStack>
        {!alarm.isAcknowledged && (
          <XStack flex={1}>
            <Button onPress={handleAcknowledge} fullWidth>
              확인 완료
            </Button>
          </XStack>
        )}
      </XStack>
    </Modal>
  );
}

export default AlarmDetailModal;

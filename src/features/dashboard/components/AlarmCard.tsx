/**
 * 알람 카드 컴포넌트
 */
import React from 'react';
import { XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AlarmDTO } from '../types/alarm.types';
import {
  getAlarmSeverityColor,
  getAlarmSeverityBgColor,
  getAlarmSeverityIcon,
  getAlarmSeverityLabel,
} from '../constants/alarmColors';

interface AlarmCardProps {
  alarm: AlarmDTO;
  onPress?: (alarm: AlarmDTO) => void;
}

/**
 * 알람 카드
 */
export function AlarmCard({ alarm, onPress }: AlarmCardProps) {
  const handlePress = () => {
    onPress?.(alarm);
  };

  // 발생 시각 포맷팅
  const formattedTime = new Date(alarm.occurredAt).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const severityColor = getAlarmSeverityColor(alarm.severity);
  const severityBgColor = getAlarmSeverityBgColor(alarm.severity);

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <Card
          marginHorizontal="$4"
          marginVertical="$2"
          opacity={pressed ? 0.8 : 1}
          scale={pressed ? 0.98 : 1}
          borderLeftWidth={4}
          borderLeftColor={severityColor as any}
          backgroundColor={alarm.isAcknowledged ? '$white' : (severityBgColor as any)}
        >
          {/* 헤더: 심각도와 시간 */}
          <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
            <XStack alignItems="center" gap="$2" flex={1}>
              <Text fontSize={20}>{getAlarmSeverityIcon(alarm.severity)}</Text>
              <Badge
                style={{
                  backgroundColor: severityColor,
                  borderWidth: 0,
                }}
                paddingHorizontal="$3"
                paddingVertical={6}
              >
                <Text fontSize={12} fontWeight="600" color="$white">
                  {getAlarmSeverityLabel(alarm.severity)}
                </Text>
              </Badge>
              {!alarm.isAcknowledged && (
                <Badge variant="error" size="sm">
                  미확인
                </Badge>
              )}
            </XStack>
            <Text fontSize={12} color="$gray500">
              {formattedTime}
            </Text>
          </XStack>

          {/* 제목 */}
          <Text fontSize={16} fontWeight="600" color="$gray900" marginBottom="$2" numberOfLines={2}>
            {alarm.title}
          </Text>

          {/* 설명 */}
          <Text fontSize={14} color="$gray700" marginBottom="$3" numberOfLines={2}>
            {alarm.description}
          </Text>

          {/* 위치 정보 */}
          <XStack gap="$2" flexWrap="wrap">
            <Badge variant="default" size="sm">
              {alarm.buildingName}
            </Badge>
            <Badge variant="default" size="sm">
              {alarm.floorName}
            </Badge>
            <Badge variant="default" size="sm">
              {alarm.zoneName}
            </Badge>
          </XStack>
        </Card>
      )}
    </Pressable>
  );
}

export default AlarmCard;

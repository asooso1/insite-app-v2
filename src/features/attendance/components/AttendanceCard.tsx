/**
 * 출퇴근 카드 컴포넌트
 *
 * 홈 화면에 표시되는 출근/퇴근 버튼 카드
 */
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, styled } from 'tamagui';
import { Clock, LogIn, LogOut, MapPin, Wifi, WifiOff } from '@tamagui/lucide-icons';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { useNetworkStore } from '@/stores/network.store';

interface AttendanceCardProps {
  todayCheckIn: string | null;
  todayCheckOut: string | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  isProcessing: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

const AttendanceButton = styled(YStack, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',
  borderRadius: 16,
  borderWidth: 2,

  variants: {
    variant: {
      checkIn: {
        backgroundColor: '$primaryMuted',
        borderColor: '$primary',
      },
      checkOut: {
        backgroundColor: '$warningMuted',
        borderColor: '$warning',
      },
      disabled: {
        backgroundColor: '$gray100',
        borderColor: '$gray300',
      },
    },
    senior: {
      true: {
        padding: '$5',
        borderRadius: 20,
        borderWidth: 3,
      },
    },
  } as const,
});

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  todayCheckIn,
  todayCheckOut,
  canCheckIn,
  canCheckOut,
  isProcessing,
  onCheckIn,
  onCheckOut,
}) => {
  const { isSeniorMode, fontSize, touchTarget } = useSeniorStyles();
  const isConnected = useNetworkStore((state) => state.isConnected);

  const iconSize = isSeniorMode ? 32 : 24;
  const buttonHeight = isSeniorMode ? touchTarget.button + 20 : 100;

  return (
    <YStack
      backgroundColor="$white"
      borderRadius={isSeniorMode ? 20 : 16}
      padding={isSeniorMode ? '$5' : '$4'}
      marginHorizontal="$4"
      marginBottom="$4"
      borderWidth={1}
      borderColor="$gray200"
      shadowColor="$gray900"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.08}
      shadowRadius={8}
      elevation={3}
    >
      {/* 헤더 */}
      <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
        <XStack alignItems="center" gap="$2">
          <Clock size={isSeniorMode ? 24 : 20} color="$gray600" />
          <Text
            fontSize={isSeniorMode ? fontSize.large : 16}
            fontWeight="700"
            color="$gray900"
          >
            출퇴근
          </Text>
        </XStack>

        {/* 네트워크 상태 표시 */}
        <XStack alignItems="center" gap="$1">
          {isConnected ? (
            <>
              <Wifi size={16} color="$success" />
              <Text fontSize={12} color="$success">
                온라인
              </Text>
            </>
          ) : (
            <>
              <WifiOff size={16} color="$warning" />
              <Text fontSize={12} color="$warning">
                오프라인
              </Text>
            </>
          )}
        </XStack>
      </XStack>

      {/* 오늘 출퇴근 현황 */}
      {(todayCheckIn || todayCheckOut) && (
        <XStack
          backgroundColor="$gray50"
          borderRadius={12}
          padding="$3"
          marginBottom="$3"
          justifyContent="space-around"
        >
          <YStack alignItems="center">
            <Text fontSize={12} color="$gray500" marginBottom="$1">
              출근
            </Text>
            <Text
              fontSize={isSeniorMode ? fontSize.medium : 14}
              fontWeight="600"
              color={todayCheckIn ? '$success' : '$gray400'}
            >
              {todayCheckIn || '--:--'}
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize={12} color="$gray500" marginBottom="$1">
              퇴근
            </Text>
            <Text
              fontSize={isSeniorMode ? fontSize.medium : 14}
              fontWeight="600"
              color={todayCheckOut ? '$warning' : '$gray400'}
            >
              {todayCheckOut || '--:--'}
            </Text>
          </YStack>
        </XStack>
      )}

      {/* 버튼 영역 */}
      <XStack gap="$3">
        {/* 출근 버튼 */}
        <AttendanceButton
          variant={canCheckIn ? 'checkIn' : 'disabled'}
          senior={isSeniorMode}
          height={buttonHeight}
          opacity={isProcessing ? 0.6 : 1}
          pressStyle={canCheckIn && !isProcessing ? { scale: 0.98 } : undefined}
          onPress={canCheckIn && !isProcessing ? onCheckIn : undefined}
          disabled={!canCheckIn || isProcessing}
        >
          {isProcessing && canCheckIn ? (
            <ActivityIndicator size="small" color="#0066CC" />
          ) : (
            <>
              <LogIn
                size={iconSize}
                color={canCheckIn ? '$primary' : '$gray400'}
                strokeWidth={2.5}
              />
              <Text
                fontSize={isSeniorMode ? fontSize.medium : 14}
                fontWeight="700"
                color={canCheckIn ? '$primary' : '$gray400'}
                marginTop="$2"
              >
                출근
              </Text>
            </>
          )}
        </AttendanceButton>

        {/* 퇴근 버튼 */}
        <AttendanceButton
          variant={canCheckOut ? 'checkOut' : 'disabled'}
          senior={isSeniorMode}
          height={buttonHeight}
          opacity={isProcessing ? 0.6 : 1}
          pressStyle={canCheckOut && !isProcessing ? { scale: 0.98 } : undefined}
          onPress={canCheckOut && !isProcessing ? onCheckOut : undefined}
          disabled={!canCheckOut || isProcessing}
        >
          {isProcessing && canCheckOut ? (
            <ActivityIndicator size="small" color="#E67E22" />
          ) : (
            <>
              <LogOut
                size={iconSize}
                color={canCheckOut ? '$warning' : '$gray400'}
                strokeWidth={2.5}
              />
              <Text
                fontSize={isSeniorMode ? fontSize.medium : 14}
                fontWeight="700"
                color={canCheckOut ? '$warning' : '$gray400'}
                marginTop="$2"
              >
                퇴근
              </Text>
            </>
          )}
        </AttendanceButton>
      </XStack>

      {/* 위치 안내 */}
      <XStack alignItems="center" justifyContent="center" marginTop="$3" gap="$1">
        <MapPin size={14} color="$gray400" />
        <Text fontSize={12} color="$gray400">
          현재 위치에서 출퇴근 기록
        </Text>
      </XStack>
    </YStack>
  );
};

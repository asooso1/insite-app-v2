/**
 * 순찰점검 상세 화면
 *
 * 순찰 경로, 체크포인트 목록, 완료 상태 표시
 */
import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FloorSection } from '@/features/patrol/components/FloorSection';
import { mockPatrolDetails } from '@/features/patrol/data/mockPatrols';
import { getPatrolStatusBgColor, getPatrolStatusTextColor } from '@/features/patrol/constants/patrolColors';
import type { CheckpointDTO } from '@/features/patrol/types/patrol.types';

export default function PatrolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Mock 데이터 가져오기
  const patrolDetail = useMemo(() => {
    const patrolId = parseInt(id || '0', 10);
    return mockPatrolDetails[patrolId];
  }, [id]);

  // 체크포인트 클릭 핸들러
  const handleCheckpointPress = (checkpoint: CheckpointDTO) => {
    // TODO: 다음 태스크에서 점검 입력 화면으로 이동
    console.log('체크포인트 선택:', checkpoint.name);
  };

  // 순찰 완료 요청 핸들러
  const handleCompletePatrol = () => {
    // TODO: 순찰 완료 로직 구현
    console.log('순찰 완료 요청');
  };

  if (!patrolDetail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <Stack.Screen
          options={{
            title: '순찰 상세',
            headerShown: true,
          }}
        />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontSize={16} color="$gray500">
            순찰 정보를 찾을 수 없습니다.
          </Text>
          <YStack marginTop="$4">
            <Button onPress={() => router.back()} variant="outline">
              돌아가기
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  // 완료율 계산
  const completionRate =
    patrolDetail.totalCheckpoints > 0
      ? Math.round(
          (patrolDetail.completedCheckpoints / patrolDetail.totalCheckpoints) * 100
        )
      : 0;

  // 첫 번째 미완료 층 찾기 (자동 펼치기용)
  const firstIncompleteFloorIndex = patrolDetail.floors.findIndex(
    (floor) => floor.completionRate < 100
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>
      <Stack.Screen
        options={{
          title: '순찰 상세',
          headerShown: true,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 순찰 정보 요약 */}
        <Card margin="$4" marginBottom="$3">
          <YStack gap="$3">
            {/* 제목과 상태 */}
            <XStack justifyContent="space-between" alignItems="flex-start">
              <Text fontSize={18} fontWeight="bold" color="$gray900" flex={1} marginRight="$2">
                {patrolDetail.name}
              </Text>
              <Badge
                style={{
                  backgroundColor: getPatrolStatusBgColor(patrolDetail.state),
                  color: getPatrolStatusTextColor(patrolDetail.state),
                }}
                borderWidth={0}
                paddingHorizontal="$3"
                paddingVertical={6}
                fontSize={13}
              >
                {patrolDetail.stateName}
              </Badge>
            </XStack>

            {/* 건물 정보 */}
            <XStack gap="$2" flexWrap="wrap">
              <Badge variant="default" size="sm">
                {patrolDetail.buildingName}
              </Badge>
              <Badge variant="default" size="sm">
                {patrolDetail.floorCount}개 층
              </Badge>
            </XStack>

            {/* 진행 상황 */}
            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$gray600">
                  체크포인트
                </Text>
                <Text fontSize={14} fontWeight="600" color="$gray900">
                  {patrolDetail.completedCheckpoints}/{patrolDetail.totalCheckpoints} 완료
                </Text>
              </XStack>

              {/* 완료율 바 */}
              <YStack gap="$2">
                <XStack
                  height={10}
                  backgroundColor="$gray200"
                  borderRadius="$full"
                  overflow="hidden"
                >
                  <XStack
                    width={`${completionRate}%`}
                    backgroundColor={
                      patrolDetail.state === 'COMPLETED'
                        ? '$success'
                        : patrolDetail.state === 'PROCESSING'
                          ? '$warning'
                          : '$info'
                    }
                  />
                </XStack>
                <Text fontSize={13} fontWeight="600" color="$primary" textAlign="right">
                  {completionRate}%
                </Text>
              </YStack>
            </YStack>

            {/* 예정 날짜 */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={14} color="$gray600">
                예정 날짜
              </Text>
              <Text fontSize={14} fontWeight="500" color="$gray900">
                {patrolDetail.scheduledDate}
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* 층별 체크포인트 목록 */}
        <YStack paddingBottom="$6">
          {patrolDetail.floors.map((floor, index) => (
            <FloorSection
              key={floor.buildingFloorId}
              floor={floor}
              onCheckpointPress={handleCheckpointPress}
              defaultExpanded={index === firstIncompleteFloorIndex || index === 0}
            />
          ))}
        </YStack>
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <YStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        backgroundColor="$white"
        borderTopWidth={1}
        borderTopColor="$gray200"
      >
        <Button
          size="lg"
          onPress={handleCompletePatrol}
          disabled={patrolDetail.state === 'COMPLETED'}
        >
          {patrolDetail.state === 'COMPLETED' ? '완료된 순찰' : '순찰 완료 요청'}
        </Button>
      </YStack>
    </SafeAreaView>
  );
}

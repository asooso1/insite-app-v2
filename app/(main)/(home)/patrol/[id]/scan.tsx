/**
 * 순찰 NFC 스캔 화면
 *
 * 체크포인트 NFC 태그 스캔 및 검증
 * 스캔 성공 후 다음 미완료 체크포인트 자동 안내
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Alert, Animated, Vibration, Platform } from 'react-native';
import { YStack, XStack, Text, Spinner } from 'tamagui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { AppIcon } from '@/components/icons';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { usePatrolNFC, CheckpointNFCData } from '@/hooks/useNFC';
import {
  showNFCDisabledAlert,
  showNFCNotSupportedAlert,
  openNFCSettings,
} from '@/services/nfc';
import { mockPatrolDetails } from '@/features/patrol/data/mockPatrols';
import type { CheckpointDTO } from '@/features/patrol/types/patrol.types';

// 스캔 결과 상태
type ScanResult = 'idle' | 'scanning' | 'success' | 'mismatch' | 'error';

/** 다음 체크포인트 안내 정보 */
interface NextCheckpointInfo {
  name: string;
  floorName: string;
  zoneName: string;
  checkpointId: number;
  /** 완료된 체크포인트 수 */
  completedCount: number;
  /** 전체 체크포인트 수 */
  totalCount: number;
}

export default function PatrolScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    checkpointId?: string;
    checkpointName?: string;
    zoneName?: string;
    floorName?: string;
    /** 현재 체크포인트의 순서 인덱스 (전체 체크포인트 목록 기준) */
    checkpointIndex?: string;
  }>();
  const { isSeniorMode } = useSeniorStyles();

  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    isSupported,
    isEnabled,
    status,
    checkpoint: scannedCheckpoint,
    error,
    startScan,
    cancelScan,
    reset,
    refresh,
    validateCheckpoint,
  } = usePatrolNFC({
    scanAlertMessage: '체크포인트 NFC 태그를 스캔해주세요',
    scanTimeout: 60000,
  });

  const [scanResult, setScanResult] = useState<ScanResult>('idle');
  const [scannedData, setScannedData] = useState<CheckpointNFCData | null>(null);
  // 다음 체크포인트 안내 정보 (성공 후 표시)
  const [nextCheckpointInfo, setNextCheckpointInfo] = useState<NextCheckpointInfo | null>(null);
  // 모든 체크포인트 완료 여부
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const isScanning = status === 'scanning';
  const patrolId = params.id;
  const expectedCheckpointId = params.checkpointId;
  const checkpointName = params.checkpointName || '체크포인트';
  const zoneName = params.zoneName || '';
  const floorName = params.floorName || '';
  const currentCheckpointIndex = params.checkpointIndex !== undefined
    ? parseInt(params.checkpointIndex, 10)
    : -1;

  /**
   * 순찰 상세 데이터에서 전체 체크포인트 목록 추출 (평면화)
   */
  const allCheckpoints = useMemo((): Array<CheckpointDTO & { floorName: string; zoneName: string }> => {
    const patrolIdNum = parseInt(patrolId || '0', 10);
    const detail = mockPatrolDetails[patrolIdNum];
    if (!detail) return [];

    const result: Array<CheckpointDTO & { floorName: string; zoneName: string }> = [];
    for (const floor of detail.floors) {
      for (const zone of floor.zones) {
        for (const cp of zone.checkpoints) {
          result.push({
            ...cp,
            floorName: floor.buildingFloorName,
            zoneName: zone.buildingFloorZoneName,
          });
        }
      }
    }
    return result;
  }, [patrolId]);

  /**
   * 스캔 성공 시 다음 미완료 체크포인트 계산
   */
  const computeNextCheckpoint = useCallback(() => {
    if (allCheckpoints.length === 0) return;

    // 현재 체크포인트 이후 미완료 체크포인트 탐색
    const searchStart = currentCheckpointIndex >= 0 ? currentCheckpointIndex + 1 : 0;
    let nextCp: (CheckpointDTO & { floorName: string; zoneName: string }) | undefined;
    let nextIndex = -1;

    // 현재 인덱스 이후에서 먼저 탐색
    for (let i = searchStart; i < allCheckpoints.length; i++) {
      const cp = allCheckpoints[i];
      if (cp && cp.status !== 'COMPLETED') {
        nextCp = cp;
        nextIndex = i;
        break;
      }
    }

    // 완료된 체크포인트 수 계산 (현재 스캔한 것 포함하여 +1)
    const completedCount = allCheckpoints.filter((cp) => cp.status === 'COMPLETED').length + 1;
    const totalCount = allCheckpoints.length;

    if (nextCp !== undefined && nextIndex !== -1) {
      setNextCheckpointInfo({
        name: nextCp.name,
        floorName: nextCp.floorName,
        zoneName: nextCp.zoneName,
        checkpointId: nextCp.id,
        completedCount,
        totalCount,
      });
      setIsAllCompleted(false);
    } else {
      // 모든 체크포인트 완료
      setNextCheckpointInfo(null);
      setIsAllCompleted(true);
    }
  }, [allCheckpoints, currentCheckpointIndex]);

  /**
   * NFC 스캔 시작
   */
  const handleStartScan = useCallback(async () => {
    if (!isSupported) {
      showNFCNotSupportedAlert();
      return;
    }

    if (!isEnabled) {
      showNFCDisabledAlert();
      return;
    }

    reset();
    setScanResult('scanning');
    setScannedData(null);
    setNextCheckpointInfo(null);
    setIsAllCompleted(false);

    const tag = await startScan();

    if (tag && scannedCheckpoint) {
      setScannedData(scannedCheckpoint);

      // 예상 체크포인트 ID가 있으면 검증
      if (expectedCheckpointId) {
        const isValid = validateCheckpoint(expectedCheckpointId);

        if (isValid) {
          // 성공 - 진동 피드백
          if (Platform.OS !== 'web') {
            Vibration.vibrate([0, 100, 50, 100]);
          }
          setScanResult('success');
          computeNextCheckpoint();
        } else {
          // 불일치 - 경고 진동
          if (Platform.OS !== 'web') {
            Vibration.vibrate([0, 200, 100, 200, 100, 200]);
          }
          setScanResult('mismatch');
        }
      } else {
        // 검증 없이 성공
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 100, 50, 100]);
        }
        setScanResult('success');
        computeNextCheckpoint();
      }
    } else if (status === 'error') {
      setScanResult('error');
    } else {
      // 취소됨
      setScanResult('idle');
    }
  }, [
    isSupported,
    isEnabled,
    reset,
    startScan,
    scannedCheckpoint,
    expectedCheckpointId,
    validateCheckpoint,
    status,
    computeNextCheckpoint,
  ]);

  /**
   * 스캔 취소
   */
  const handleCancelScan = useCallback(async () => {
    await cancelScan();
    setScanResult('idle');
  }, [cancelScan]);

  /**
   * 스캔 성공 후 결과 입력 화면으로 이동
   */
  const handleProceedToResult = useCallback(() => {
    if (!scannedData) return;

    Alert.alert(
      '스캔 완료',
      `체크포인트: ${checkpointName}\n태그 ID: ${scannedData.tagId}`,
      [
        { text: '다시 스캔', onPress: () => setScanResult('idle') },
        {
          text: '결과 입력',
          onPress: () => {
            // 이전 화면으로 돌아가고 완료 상태 전달
            router.back();
          },
        },
      ]
    );
  }, [scannedData, checkpointName, router]);

  /**
   * 불일치 시 재시도
   */
  const handleRetry = useCallback(() => {
    setScanResult('idle');
    setScannedData(null);
    reset();
  }, [reset]);

  // 에러 처리
  useEffect(() => {
    if (error && status === 'error') {
      setScanResult('error');

      let title = 'NFC 오류';
      let message = error.message || '알 수 없는 오류가 발생했습니다.';

      switch (error.code) {
        case 'NOT_SUPPORTED':
          title = 'NFC 미지원';
          message = '이 기기는 NFC를 지원하지 않습니다.';
          break;
        case 'NOT_ENABLED':
          title = 'NFC 비활성화';
          message = 'NFC가 비활성화되어 있습니다.';
          break;
        case 'TIMEOUT':
          title = '시간 초과';
          message = '스캔 시간이 초과되었습니다.';
          break;
        case 'TAG_LOST':
          title = '태그 읽기 실패';
          message = '태그를 읽을 수 없습니다.';
          break;
        case 'CANCELLED':
          setScanResult('idle');
          return;
      }

      Alert.alert(title, message, [
        { text: '다시 시도', onPress: handleRetry },
        ...(error.code === 'NOT_ENABLED'
          ? [{ text: '설정 열기', onPress: openNFCSettings }]
          : []),
      ]);
    }
  }, [error, status, handleRetry]);

  // 화면 진입 시 NFC 상태 확인
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 스캔 결과에 따른 아이콘 이름
  const getIconName = (): 'success' | 'warning' | 'error' | 'nfc' => {
    switch (scanResult) {
      case 'success':
        return 'success';
      case 'mismatch':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'nfc';
    }
  };

  // 스캔 결과에 따른 아이콘 색상
  const getIconColor = () => {
    switch (scanResult) {
      case 'success':
        return '#43A047';
      case 'mismatch':
        return '#F57C00';
      case 'error':
        return '#E53935';
      case 'scanning':
        return '$primary';
      default:
        return isEnabled ? '$primary' : '$gray400';
    }
  };

  // 스캔 결과에 따른 배경색
  const getIconBgColor = () => {
    switch (scanResult) {
      case 'success':
        return '#E8F5E9';
      case 'mismatch':
        return '#FFF3E0';
      case 'error':
        return '#FFEBEE';
      case 'scanning':
        return '$primaryMuted';
      default:
        return isEnabled ? '$primaryMuted' : '$gray100';
    }
  };

  return (
    <YStack flex={1} backgroundColor="$gray50">
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="체크포인트 스캔"
        expandedHeight={100}
        collapsedHeight={80}
      />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 뒤로가기 버튼 */}
        <YStack paddingHorizontal="$4" paddingTop="$2">
          <XStack
            alignItems="center"
            gap="$2"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => router.back()}
          >
            <YStack transform={[{ rotate: '180deg' }]}>
              <AppIcon name="chevronRight" size="sm" color="$primary" />
            </YStack>
            <Text fontSize={14} color="$primary">
              돌아가기
            </Text>
          </XStack>
        </YStack>

        {/* NFC 비활성화 경고 */}
        {isSupported && !isEnabled && (
          <YStack
            marginHorizontal="$4"
            marginTop="$4"
            padding="$3"
            backgroundColor="#FFF3E0"
            borderRadius={12}
            borderWidth={1}
            borderColor="#FFE0B2"
            pressStyle={{ opacity: 0.8 }}
            onPress={openNFCSettings}
          >
            <XStack alignItems="center" gap="$2">
              <AppIcon name="warning" size="sm" color="#F57C00" />
              <Text flex={1} fontSize={14} color="#E65100">
                NFC가 비활성화되어 있습니다. 탭하여 설정 열기
              </Text>
            </XStack>
          </YStack>
        )}

        {/* 체크포인트 정보 */}
        <YStack
          marginHorizontal="$4"
          marginTop="$4"
          padding="$4"
          backgroundColor="$white"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text
            fontSize={isSeniorMode ? 14 : 12}
            color="$gray500"
            marginBottom="$1"
          >
            스캔할 체크포인트
          </Text>
          <Text
            fontSize={isSeniorMode ? 22 : 18}
            fontWeight="700"
            color="$gray900"
            marginBottom="$2"
          >
            {checkpointName}
          </Text>
          {(floorName || zoneName) && (
            <XStack gap="$2" alignItems="center">
              <AppIcon name="location" size="xs" color="$gray500" />
              <Text fontSize={isSeniorMode ? 16 : 14} color="$gray600">
                {floorName}
                {floorName && zoneName && ' · '}
                {zoneName}
              </Text>
            </XStack>
          )}
        </YStack>

        {/* 스캔 영역 */}
        <YStack alignItems="center" paddingVertical="$8">
          <YStack
            width={isSeniorMode ? 180 : 160}
            height={isSeniorMode ? 180 : 160}
            borderRadius={isSeniorMode ? 90 : 80}
            backgroundColor={getIconBgColor()}
            justifyContent="center"
            alignItems="center"
            marginBottom="$6"
          >
            {isScanning ? (
              <Spinner size="large" color="$primary" />
            ) : (
              <AppIcon name={getIconName()} size="xl" color={getIconColor()} />
            )}
          </YStack>

          {/* 상태 메시지 */}
          <Text
            fontSize={isSeniorMode ? 20 : 18}
            fontWeight="600"
            color="$gray900"
            textAlign="center"
            marginBottom="$2"
          >
            {scanResult === 'scanning' && 'NFC 태그를 스캔하세요'}
            {scanResult === 'success' && '스캔 성공!'}
            {scanResult === 'mismatch' && '체크포인트 불일치'}
            {scanResult === 'error' && '스캔 실패'}
            {scanResult === 'idle' && (isEnabled ? 'NFC 스캔 준비됨' : 'NFC를 활성화해주세요')}
          </Text>

          <Text
            fontSize={isSeniorMode ? 16 : 14}
            color="$gray600"
            textAlign="center"
            paddingHorizontal="$4"
          >
            {scanResult === 'scanning' && '기기 뒷면을 NFC 태그에 가까이 대주세요'}
            {scanResult === 'success' && '체크포인트가 확인되었습니다'}
            {scanResult === 'mismatch' &&
              `스캔된 태그: ${scannedData?.tagId || '-'}\n예상 체크포인트와 일치하지 않습니다`}
            {scanResult === 'error' && '다시 시도해주세요'}
            {scanResult === 'idle' &&
              (isEnabled
                ? '아래 버튼을 눌러 스캔을 시작하세요'
                : '설정에서 NFC를 켜주세요')}
          </Text>
        </YStack>

        {/* 스캔된 정보 (성공/불일치 시) */}
        {scannedData && (scanResult === 'success' || scanResult === 'mismatch') && (
          <YStack
            marginHorizontal="$4"
            padding="$4"
            backgroundColor="$white"
            borderRadius={16}
            borderWidth={1}
            borderColor={scanResult === 'success' ? '#A5D6A7' : '#FFE0B2'}
          >
            <Text fontSize={14} fontWeight="600" color="$gray900" marginBottom="$3">
              스캔 결과
            </Text>
            <YStack gap="$2">
              <XStack justifyContent="space-between">
                <Text fontSize={14} color="$gray600">
                  태그 ID
                </Text>
                <Text fontSize={14} fontWeight="500" color="$gray900">
                  {scannedData.tagId}
                </Text>
              </XStack>
              {scannedData.buildingId && (
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color="$gray600">
                    빌딩 ID
                  </Text>
                  <Text fontSize={14} fontWeight="500" color="$gray900">
                    {scannedData.buildingId}
                  </Text>
                </XStack>
              )}
              {scannedData.floorId && (
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color="$gray600">
                    층 ID
                  </Text>
                  <Text fontSize={14} fontWeight="500" color="$gray900">
                    {scannedData.floorId}
                  </Text>
                </XStack>
              )}
              {scannedData.checkpointId && (
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color="$gray600">
                    체크포인트 ID
                  </Text>
                  <Text fontSize={14} fontWeight="500" color="$gray900">
                    {scannedData.checkpointId}
                  </Text>
                </XStack>
              )}
            </YStack>
          </YStack>
        )}

        {/* 순찰 완료 메시지 (모든 체크포인트 완료 시) */}
        {scanResult === 'success' && isAllCompleted && (
          <YStack
            marginHorizontal="$4"
            marginTop="$4"
            padding="$4"
            backgroundColor="#E8F5E9"
            borderRadius={16}
            borderWidth={1}
            borderColor="#A5D6A7"
            alignItems="center"
            gap="$2"
          >
            <AppIcon name="success" size="lg" color="#43A047" />
            <Text
              fontSize={isSeniorMode ? 20 : 18}
              fontWeight="700"
              color="#2E7D32"
              textAlign="center"
            >
              모든 체크포인트 완료!
            </Text>
            <Text
              fontSize={isSeniorMode ? 16 : 14}
              color="#388E3C"
              textAlign="center"
            >
              순찰이 완료되었습니다.{'\n'}순찰 완료 요청을 진행해주세요.
            </Text>
          </YStack>
        )}

        {/* 다음 체크포인트 안내 (성공 후, 미완료 체크포인트 있을 때) */}
        {scanResult === 'success' && nextCheckpointInfo !== null && !isAllCompleted && (
          <YStack
            marginHorizontal="$4"
            marginTop="$4"
            padding="$4"
            backgroundColor="$white"
            borderRadius={16}
            borderWidth={1}
            borderColor="$gray200"
          >
            {/* 진행률 헤더 */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <Text fontSize={isSeniorMode ? 14 : 12} color="$gray500" fontWeight="600">
                다음 체크포인트
              </Text>
              <Text fontSize={isSeniorMode ? 14 : 12} color="$primary" fontWeight="600">
                {nextCheckpointInfo.completedCount}/{nextCheckpointInfo.totalCount} 완료
              </Text>
            </XStack>

            {/* 진행률 바 */}
            <YStack
              height={6}
              backgroundColor="$gray200"
              borderRadius={3}
              marginBottom="$3"
            >
              <YStack
                height={6}
                borderRadius={3}
                backgroundColor="$primary"
                width={`${Math.round((nextCheckpointInfo.completedCount / nextCheckpointInfo.totalCount) * 100)}%`}
              />
            </YStack>

            {/* 다음 체크포인트 정보 */}
            <XStack gap="$3" alignItems="center">
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="$primaryMuted"
                justifyContent="center"
                alignItems="center"
              >
                <AppIcon name="nfc" size="sm" color="$primary" />
              </YStack>
              <YStack flex={1} gap="$1">
                <Text
                  fontSize={isSeniorMode ? 18 : 16}
                  fontWeight="700"
                  color="$gray900"
                >
                  {nextCheckpointInfo.name}
                </Text>
                <XStack gap="$1" alignItems="center">
                  <AppIcon name="location" size="xs" color="$gray500" />
                  <Text fontSize={isSeniorMode ? 14 : 12} color="$gray600">
                    {nextCheckpointInfo.floorName}
                    {nextCheckpointInfo.floorName && nextCheckpointInfo.zoneName && ' · '}
                    {nextCheckpointInfo.zoneName}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </YStack>
        )}

        {/* 버튼 영역 */}
        <YStack paddingHorizontal="$4" marginTop="$6" gap="$3">
          {scanResult === 'idle' && (
            <YStack
              height={isSeniorMode ? 64 : 56}
              backgroundColor={isEnabled ? '$primary' : '$gray400'}
              borderRadius={12}
              justifyContent="center"
              alignItems="center"
              pressStyle={isEnabled ? { opacity: 0.9, scale: 0.99 } : undefined}
              onPress={isEnabled ? handleStartScan : openNFCSettings}
            >
              <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$white">
                {isEnabled ? 'NFC 스캔 시작' : 'NFC 설정 열기'}
              </Text>
            </YStack>
          )}

          {scanResult === 'scanning' && (
            <YStack
              height={isSeniorMode ? 64 : 56}
              backgroundColor="$gray200"
              borderRadius={12}
              justifyContent="center"
              alignItems="center"
              pressStyle={{ opacity: 0.9 }}
              onPress={handleCancelScan}
            >
              <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$gray700">
                스캔 취소
              </Text>
            </YStack>
          )}

          {scanResult === 'success' && (
            <>
              <YStack
                height={isSeniorMode ? 64 : 56}
                backgroundColor="#43A047"
                borderRadius={12}
                justifyContent="center"
                alignItems="center"
                pressStyle={{ opacity: 0.9, scale: 0.99 }}
                onPress={handleProceedToResult}
              >
                <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$white">
                  결과 입력
                </Text>
              </YStack>
              <YStack
                height={isSeniorMode ? 64 : 56}
                backgroundColor="$white"
                borderRadius={12}
                borderWidth={1}
                borderColor="$gray300"
                justifyContent="center"
                alignItems="center"
                pressStyle={{ opacity: 0.9 }}
                onPress={handleRetry}
              >
                <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$gray700">
                  다시 스캔
                </Text>
              </YStack>
            </>
          )}

          {(scanResult === 'mismatch' || scanResult === 'error') && (
            <YStack
              height={isSeniorMode ? 64 : 56}
              backgroundColor="$primary"
              borderRadius={12}
              justifyContent="center"
              alignItems="center"
              pressStyle={{ opacity: 0.9, scale: 0.99 }}
              onPress={handleRetry}
            >
              <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$white">
                다시 스캔
              </Text>
            </YStack>
          )}
        </YStack>
      </Animated.ScrollView>
    </YStack>
  );
}

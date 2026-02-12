/**
 * 스캔 화면
 *
 * 2026 Modern UI - CollapsibleGradientHeader 적용
 * NFC/QR 코드 스캔 기능
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  Alert,
  Animated,
  Vibration,
  Platform,
  Dimensions,
  TouchableOpacity,
  View,
  Modal,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Spinner } from 'tamagui';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { AppIcon } from '@/components/icons';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { useNFC } from '@/hooks/useNFC';
import { openNFCSettings } from '@/services/nfc';
import { parseQrCode, ParseResult, formatScanData } from '@/utils/scanParser';
import { useAttendance } from '@/features/attendance';

type ScanMode = 'nfc' | 'qr';

interface ScanHistoryItem {
  id: string;
  name: string;
  time: string;
  type: ScanMode;
  data?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export default function ScanScreen() {
  const { isSeniorMode, fontSize } = useSeniorStyles();
  const router = useRouter();
  const { checkIn, checkOut, attendanceFlag } = useAttendance();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  const [scanMode, setScanMode] = useState<ScanMode>('qr');
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 카메라 권한
  const [permission, requestPermission] = useCameraPermissions();

  // NFC 훅
  const {
    isSupported: nfcSupported,
    isEnabled: nfcEnabled,
    status: nfcStatus,
    startScan: startNfcScan,
    cancelScan: cancelNfcScan,
    reset: resetNfc,
  } = useNFC({
    scanAlertMessage: 'NFC 태그를 스캔해주세요',
    scanTimeout: 30000,
  });

  const nfcScanning = nfcStatus === 'scanning';

  /**
   * QR 스캔 시작 - 카메라 모달 열기
   */
  const handleStartQrScan = useCallback(async () => {
    console.log('[Scan] QR 스캔 시작');

    let hasPermission = permission?.granted;

    if (!hasPermission) {
      const result = await requestPermission();
      hasPermission = result?.granted;
      if (!hasPermission) {
        Alert.alert('카메라 권한 필요', 'QR 코드 스캔을 위해 카메라 권한이 필요합니다.');
        return;
      }
    }

    setShowCamera(true);
  }, [permission, requestPermission]);

  /**
   * 카메라 닫기
   */
  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
    setIsProcessing(false);
  }, []);

  /**
   * 스캔 결과에 따른 업무 연계 처리
   */
  const handleScanSuccess = useCallback(
    async (result: ParseResult, scanType: ScanMode) => {
      if (!result.success || !result.data) return;

      // 스캔 기록 추가
      const newScan: ScanHistoryItem = {
        id: Date.now().toString(),
        name: formatScanData(result.data) || (scanType === 'nfc' ? 'NFC 스캔' : 'QR 스캔'),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        type: scanType,
        data: result.data.rawData?.substring(0, 50),
      };
      setRecentScans((prev) => [newScan, ...prev.slice(0, 9)]);

      // 스캔 결과 타입에 따른 분기 처리
      switch (result.type) {
        case 'attendance':
          handleAttendance();
          break;

        case 'patrol':
          Alert.alert(
            '순찰 시작',
            formatScanData(result.data) || '순찰을 시작하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '시작',
                onPress: () => {
                  router.push({
                    pathname: '/(main)/(home)/patrol',
                    params: { scanData: JSON.stringify(result.data) },
                  });
                },
              },
            ]
          );
          break;

        case 'workOrder':
          Alert.alert(
            '업무등록',
            formatScanData(result.data) || '업무등록 기능은 추후 구현 예정입니다.',
            [{ text: '확인' }]
          );
          break;

        case 'facility':
          Alert.alert(
            '설비 정보',
            formatScanData(result.data) || '설비 상세 화면은 추후 구현 예정입니다.',
            [{ text: '확인' }]
          );
          break;

        case 'location':
          Alert.alert(
            '위치 정보',
            formatScanData(result.data) || '위치 정보를 확인했습니다.',
            [{ text: '확인' }]
          );
          break;

        default:
          Alert.alert(
            '스캔 완료',
            formatScanData(result.data) || 'QR 코드가 인식되었습니다.',
            [{ text: '확인' }]
          );
          break;
      }
    },
    [router]
  );

  /**
   * 출퇴근 처리 함수
   */
  const handleAttendance = useCallback(() => {
    const canCheckIn = attendanceFlag.login;
    const canCheckOut = attendanceFlag.logOut;

    if (!canCheckIn && !canCheckOut) {
      Alert.alert('출퇴근 불가', '현재 출퇴근 처리가 불가능합니다.');
      return;
    }

    const buttons = [];

    if (canCheckIn) {
      buttons.push({
        text: '출근',
        onPress: async () => {
          const result = await checkIn('QR');
          if (!result.success) {
            Alert.alert('출근 실패', result.message);
          }
        },
      });
    }

    if (canCheckOut) {
      buttons.push({
        text: '퇴근',
        onPress: async () => {
          const result = await checkOut('QR');
          if (!result.success) {
            Alert.alert('퇴근 실패', result.message);
          }
        },
      });
    }

    buttons.push({ text: '취소', style: 'cancel' as const });

    Alert.alert('출퇴근 처리', '출근 또는 퇴근을 선택하세요.', buttons);
  }, [attendanceFlag, checkIn, checkOut]);

  /**
   * QR 코드 스캔 처리
   */
  const handleBarCodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        console.log('[Scan] QR 데이터:', data.substring(0, 50));

        const result = await parseQrCode(data);

        // 진동 피드백
        if (Platform.OS !== 'web') {
          Vibration.vibrate(result.success ? [0, 100, 50, 100] : [0, 200]);
        }

        // 카메라 닫기
        setShowCamera(false);

        if (result.success) {
          await handleScanSuccess(result, 'qr');
        } else {
          Alert.alert('스캔 실패', result.error || '인식할 수 없는 QR 코드입니다.');
        }
      } catch (error) {
        console.error('[Scan] QR 처리 오류:', error);
        Alert.alert('오류', 'QR 코드 처리 중 오류가 발생했습니다.');
      } finally {
        setTimeout(() => setIsProcessing(false), 1000);
      }
    },
    [isProcessing, handleScanSuccess]
  );

  /**
   * NFC 스캔 시작
   */
  const handleStartNfcScan = useCallback(async () => {
    if (!nfcSupported) {
      Alert.alert('NFC 미지원', 'NFC를 지원하지 않는 환경입니다.\n(Development Build 필요)');
      return;
    }

    if (!nfcEnabled) {
      Alert.alert('NFC 비활성화', 'NFC가 비활성화되어 있습니다.', [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: openNFCSettings },
      ]);
      return;
    }

    resetNfc();
    const tag = await startNfcScan();

    if (tag) {
      try {
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 100, 50, 100]);
        }

        const nfcText = tag.ndefMessage || tag.tagId;
        const result = await parseQrCode(nfcText);

        if (result.success) {
          await handleScanSuccess(result, 'nfc');
        } else {
          const newScan: ScanHistoryItem = {
            id: Date.now().toString(),
            name: `태그 ${tag.tagId.substring(0, 8)}`,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            type: 'nfc',
            data: tag.tagId,
          };
          setRecentScans((prev) => [newScan, ...prev.slice(0, 9)]);

          Alert.alert('스캔 완료', `태그 ID: ${tag.tagId}`, [{ text: '확인' }]);
        }
      } catch (error) {
        console.error('[Scan] NFC 처리 오류:', error);
        Alert.alert('오류', 'NFC 태그 처리 중 오류가 발생했습니다.');
      }
    }
  }, [nfcSupported, nfcEnabled, resetNfc, startNfcScan, handleScanSuccess]);

  /**
   * NFC 스캔 취소
   */
  const handleCancelNfcScan = useCallback(async () => {
    await cancelNfcScan();
  }, [cancelNfcScan]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* 카메라 모달 */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={handleCloseCamera}
      >
        <View style={styles.cameraContainer}>
          <StatusBar barStyle="light-content" />

          {/* 카메라 뷰 - children 없이 */}
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
            }}
            onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
          />

          {/* 오버레이 - CameraView 위에 absolute로 배치 */}
          <SafeAreaView style={styles.overlay}>
            {/* 닫기 버튼 */}
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity
                onPress={handleCloseCamera}
                style={styles.closeButton}
              >
                <Text color="white" fontSize={16} fontWeight="600">
                  닫기
                </Text>
              </TouchableOpacity>
            </View>

            {/* 스캔 영역 */}
            <View style={styles.scanAreaContainer}>
              <View style={[styles.scanFrame, { width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }]} />
              <Text color="white" fontSize={16} textAlign="center" marginTop="$4">
                QR 코드를 프레임 안에 맞춰주세요
              </Text>
            </View>

            {/* 하단 여백 */}
            <View style={{ height: 100 }} />
          </SafeAreaView>

          {/* 처리 중 표시 */}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Spinner size="large" color="$white" />
              <Text color="white" marginTop="$2">
                처리 중...
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="스캔"
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
        {/* 모드 선택 */}
        <XStack paddingHorizontal="$4" paddingVertical="$4" gap="$3">
          <YStack
            flex={1}
            paddingVertical="$3"
            borderRadius={12}
            backgroundColor={scanMode === 'qr' ? '$primary' : '$white'}
            borderWidth={1}
            borderColor={scanMode === 'qr' ? '$primary' : '$gray200'}
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => {
              setScanMode('qr');
              handleCancelNfcScan();
            }}
          >
            <Text fontSize={16} fontWeight="600" color={scanMode === 'qr' ? '$white' : '$gray600'}>
              QR 코드
            </Text>
          </YStack>
          <YStack
            flex={1}
            paddingVertical="$3"
            borderRadius={12}
            backgroundColor={scanMode === 'nfc' ? '$primary' : '$white'}
            borderWidth={1}
            borderColor={scanMode === 'nfc' ? '$primary' : '$gray200'}
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => {
              setScanMode('nfc');
              handleCancelNfcScan();
            }}
          >
            <Text fontSize={16} fontWeight="600" color={scanMode === 'nfc' ? '$white' : '$gray600'}>
              NFC
            </Text>
          </YStack>
        </XStack>

        {/* 스캔 영역 */}
        <YStack alignItems="center" paddingVertical="$4">
          {scanMode === 'qr' ? (
            // QR 스캔 모드
            <YStack alignItems="center" width="100%">
              <YStack
                width={SCAN_AREA_SIZE}
                height={SCAN_AREA_SIZE}
                borderRadius={16}
                borderWidth={3}
                borderColor="$primary"
                borderStyle="dashed"
                justifyContent="center"
                alignItems="center"
                marginBottom="$4"
                backgroundColor="$gray100"
              >
                <AppIcon name="qrCode" size="xl" color="$gray400" />
                <Text fontSize={14} color="$gray500" marginTop="$2">
                  QR 코드를 스캔하세요
                </Text>
              </YStack>
              <Text
                fontSize={isSeniorMode ? fontSize.large : 16}
                color="$gray600"
                textAlign="center"
              >
                QR 코드를 스캔하려면{'\n'}아래 버튼을 누르세요
              </Text>
            </YStack>
          ) : (
            // NFC 스캔 모드
            <YStack alignItems="center">
              <YStack
                width={isSeniorMode ? 180 : 140}
                height={isSeniorMode ? 180 : 140}
                borderRadius={isSeniorMode ? 90 : 70}
                backgroundColor={
                  nfcScanning
                    ? '$primary'
                    : nfcEnabled
                    ? '$primaryMuted'
                    : '$gray200'
                }
                justifyContent="center"
                alignItems="center"
                marginBottom="$6"
              >
                {nfcScanning ? (
                  <Spinner size="large" color="$white" />
                ) : (
                  <AppIcon
                    name="nfc"
                    size="xl"
                    color={nfcEnabled ? '$primary' : '$gray400'}
                  />
                )}
              </YStack>
              <Text
                fontSize={isSeniorMode ? fontSize.large : 16}
                color="$gray600"
                textAlign="center"
              >
                {nfcScanning
                  ? 'NFC 태그를 스캔하세요...\n기기 뒷면을 태그에 가까이 대주세요'
                  : nfcEnabled
                  ? 'NFC 태그를 스캔하려면\n아래 버튼을 누르세요'
                  : nfcSupported
                  ? 'NFC를 활성화해주세요'
                  : 'NFC 미지원 환경입니다\n(Development Build 필요)'}
              </Text>
            </YStack>
          )}
        </YStack>

        {/* 스캔 버튼 */}
        <YStack paddingHorizontal="$4" marginBottom="$6">
          {scanMode === 'qr' ? (
            <TouchableOpacity activeOpacity={0.9} onPress={handleStartQrScan}>
              <YStack
                height={isSeniorMode ? 64 : 56}
                backgroundColor="$primary"
                borderRadius={12}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$white">
                  QR 스캔 시작
                </Text>
              </YStack>
            </TouchableOpacity>
          ) : nfcScanning ? (
            <TouchableOpacity activeOpacity={0.9} onPress={handleCancelNfcScan}>
              <YStack
                height={isSeniorMode ? 64 : 56}
                backgroundColor="$gray400"
                borderRadius={12}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$white">
                  스캔 취소
                </Text>
              </YStack>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={nfcEnabled ? handleStartNfcScan : openNFCSettings}
            >
              <YStack
                height={isSeniorMode ? 64 : 56}
                backgroundColor={nfcEnabled ? '$primary' : '$gray400'}
                borderRadius={12}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={isSeniorMode ? 20 : 18} fontWeight="600" color="$white">
                  {nfcEnabled ? 'NFC 스캔 시작' : nfcSupported ? 'NFC 설정 열기' : 'NFC 미지원'}
                </Text>
              </YStack>
            </TouchableOpacity>
          )}
        </YStack>

        {/* 최근 스캔 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text
            fontSize={isSeniorMode ? fontSize.large : 16}
            fontWeight="600"
            color="$gray900"
            marginBottom="$3"
          >
            최근 스캔
          </Text>
          {recentScans.length === 0 ? (
            <YStack alignItems="center" paddingVertical="$4">
              <AppIcon name="scan" size="lg" color="$gray300" />
              <Text fontSize={14} color="$gray400" marginTop="$2">
                스캔 기록이 없습니다
              </Text>
            </YStack>
          ) : (
            <YStack gap="$2">
              {recentScans.map((item) => (
                <XStack
                  key={item.id}
                  backgroundColor="$gray50"
                  borderRadius={10}
                  padding="$3"
                  alignItems="center"
                  gap="$3"
                >
                  <YStack
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="$primaryMuted"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <AppIcon
                      name={item.type === 'nfc' ? 'nfc' : 'qrCode'}
                      size="sm"
                      color="$primary"
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize={isSeniorMode ? fontSize.medium : 14}
                      fontWeight="500"
                      color="$gray900"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      fontSize={isSeniorMode ? fontSize.small : 12}
                      color="$gray500"
                    >
                      {item.time}
                    </Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </Animated.ScrollView>
    </YStack>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  closeButtonContainer: {
    padding: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 16,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

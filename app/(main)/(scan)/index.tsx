/**
 * 스캔 화면
 *
 * 2026 Modern UI - CollapsibleGradientHeader 적용
 * NFC/QR 코드 스캔 기능
 */
import React, { useState, useRef } from 'react';
import { Alert, Animated } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { AppIcon } from '@/components/icons';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

type ScanMode = 'nfc' | 'qr';

export default function ScanScreen() {
  const { isSeniorMode } = useSeniorStyles();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  const [scanMode, setScanMode] = useState<ScanMode>('nfc');
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert('스캔 완료', '태그 ID: ABC123 (개발 중)');
    }, 2000);
  };

  const recentScans = [
    { id: '1', name: '체크포인트 A', time: '09:30', type: 'nfc' as const },
    { id: '2', name: '설비 #1234', time: '09:15', type: 'qr' as const },
  ];

  return (
    <YStack flex={1} backgroundColor="$gray50">
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
            backgroundColor={scanMode === 'nfc' ? '$primary' : '$white'}
            borderWidth={1}
            borderColor={scanMode === 'nfc' ? '$primary' : '$gray200'}
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setScanMode('nfc')}
          >
            <Text fontSize={16} fontWeight="600" color={scanMode === 'nfc' ? '$white' : '$gray600'}>
              NFC
            </Text>
          </YStack>
          <YStack
            flex={1}
            paddingVertical="$3"
            borderRadius={12}
            backgroundColor={scanMode === 'qr' ? '$primary' : '$white'}
            borderWidth={1}
            borderColor={scanMode === 'qr' ? '$primary' : '$gray200'}
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setScanMode('qr')}
          >
            <Text fontSize={16} fontWeight="600" color={scanMode === 'qr' ? '$white' : '$gray600'}>
              QR 코드
            </Text>
          </YStack>
        </XStack>

        {/* 스캔 영역 */}
        <YStack alignItems="center" paddingVertical="$8">
          {scanMode === 'nfc' ? (
            <YStack alignItems="center">
              <YStack
                width={140}
                height={140}
                borderRadius={70}
                backgroundColor={isScanning ? '$primary' : '$primaryMuted'}
                justifyContent="center"
                alignItems="center"
                marginBottom="$6"
              >
                <AppIcon name="nfc" size="xl" color={isScanning ? '$white' : '$primary'} />
              </YStack>
              <Text fontSize={isSeniorMode ? 18 : 16} color="$gray600" textAlign="center">
                {isScanning
                  ? 'NFC 태그를 스캔하세요...'
                  : 'NFC 태그를 스캔하려면\n아래 버튼을 누르세요'}
              </Text>
            </YStack>
          ) : (
            <YStack alignItems="center" width="100%">
              <YStack
                width={250}
                height={250}
                borderRadius={16}
                borderWidth={3}
                borderColor="$primary"
                borderStyle="dashed"
                justifyContent="center"
                alignItems="center"
                marginBottom="$6"
              >
                <AppIcon name="qrCode" size="xl" color="$gray400" />
                <Text fontSize={14} color="$gray400" marginTop="$2">
                  QR 카메라 뷰
                </Text>
              </YStack>
              <Text fontSize={isSeniorMode ? 18 : 16} color="$gray600">
                QR 코드를 프레임 안에 맞춰주세요
              </Text>
            </YStack>
          )}
        </YStack>

        {/* NFC 스캔 버튼 */}
        {scanMode === 'nfc' && (
          <YStack paddingHorizontal="$4" marginBottom="$6">
            <YStack
              height={56}
              backgroundColor={isScanning ? '$gray400' : '$primary'}
              borderRadius={12}
              justifyContent="center"
              alignItems="center"
              pressStyle={!isScanning ? { opacity: 0.9, scale: 0.99 } : undefined}
              onPress={!isScanning ? handleStartScan : undefined}
            >
              <Text fontSize={18} fontWeight="600" color="$white">
                {isScanning ? '스캔 중...' : 'NFC 스캔 시작'}
              </Text>
            </YStack>
          </YStack>
        )}

        {/* 최근 스캔 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text fontSize={16} fontWeight="600" color="$gray900" marginBottom="$3">
            최근 스캔
          </Text>
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
                  <Text fontSize={14} fontWeight="500" color="$gray900">
                    {item.name}
                  </Text>
                  <Text fontSize={12} color="$gray500">
                    {item.time}
                  </Text>
                </YStack>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </Animated.ScrollView>
    </YStack>
  );
}

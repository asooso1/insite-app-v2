/**
 * 일상업무 등록 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 카드 폼
 * v1 참조: 기본 정보 접이식, 위치/설비 선택, 이미지 업로드, Push 알림 토글
 * 시니어 모드 지원
 */
import React, { useState, useMemo } from 'react';
import { ScrollView, Alert, Pressable, View, Switch } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextField } from '@/components/ui/TextField';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { gradients } from '@/theme/tokens';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { useCreatePersonalTask } from '@/features/personal-task/hooks';
import { useAuthStore } from '@/stores/auth.store';

/**
 * 일상업무 등록 화면
 */
export default function CreatePersonalTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSeniorMode, card: cardStyles, fontSize } = useSeniorStyles();

  // 현재 사용자 정보
  const currentUser = useAuthStore((s) => s.user);
  const selectedBuilding = useAuthStore((s) => s.user?.selectedBuildingAccountDTO);
  const buildingId = Number(selectedBuilding?.buildingId) || 1;

  // API mutation
  const createMutation = useCreatePersonalTask();

  // 폼 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAlertPush, setIsAlertPush] = useState(true);

  // 위치/설비 상태
  const [location, setLocation] = useState('');
  const [, setBuildingFloorId] = useState<number | null>(null);
  const [, setBuildingFloorZoneId] = useState<number | null>(null);
  const [, setFacilityId] = useState<number | null>(null);
  const [facilityName, setFacilityName] = useState('');

  // 확인자 상태
  const [confirmInfo, setConfirmInfo] = useState<{ id: number; name: string }>({ id: 0, name: '' });

  // 이미지 상태
  const [images, setImages] = useState<string[]>([]);

  // 기본 정보 섹션 접기/펼치기
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(false);

  // 에러 상태
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // 버튼 활성화 여부
  const isFormValid = useMemo(() => {
    return title.trim() && description.trim();
  }, [title, description]);

  /**
   * 위치 선택 초기화
   */
  const resetLocationInfo = () => {
    setLocation('');
    setBuildingFloorId(null);
    setBuildingFloorZoneId(null);
    setFacilityId(null);
    setFacilityName('');
  };

  /**
   * 설비 선택 초기화
   */
  const resetFacilityInfo = () => {
    setFacilityId(null);
    setFacilityName('');
  };

  /**
   * 폼 검증
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError('업무명을 입력해주세요.');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!description.trim()) {
      setDescriptionError('업무 내용을 입력해주세요.');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    setConfirmError('');

    return isValid;
  };

  /**
   * 위치 선택 (Mock - 실제로는 네비게이션)
   */
  const handleSelectLocation = () => {
    // TODO: 위치 선택 화면으로 이동
    Alert.alert('위치 선택', '위치 선택 화면으로 이동합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '선택 (Mock)',
        onPress: () => {
          setLocation('3F > 대회의실');
          setBuildingFloorId(3);
          setBuildingFloorZoneId(301);
        },
      },
    ]);
  };

  /**
   * QR 스캔으로 위치 선택
   */
  const handleScanLocationQR = () => {
    // TODO: QR 스캔 화면으로 이동
    Alert.alert('QR 스캔', 'QR 스캔으로 위치를 인식합니다.');
  };

  /**
   * 설비 선택 (Mock - 실제로는 네비게이션)
   */
  const handleSelectFacility = () => {
    // TODO: 설비 선택 화면으로 이동
    Alert.alert('설비 선택', '설비 선택 화면으로 이동합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '선택 (Mock)',
        onPress: () => {
          setFacilityId(1001);
          setFacilityName('대회의실 에어컨');
          if (!location) {
            setLocation('3F > 대회의실');
            setBuildingFloorId(3);
            setBuildingFloorZoneId(301);
          }
        },
      },
    ]);
  };

  /**
   * QR 스캔으로 설비 선택
   */
  const handleScanFacilityQR = () => {
    // TODO: QR 스캔 화면으로 이동
    Alert.alert('QR 스캔', 'QR 스캔으로 설비를 인식합니다.');
  };

  /**
   * 승인자 선택 (Mock - 실제로는 네비게이션)
   */
  const handleSelectConfirmUser = () => {
    // TODO: 승인자 선택 화면으로 이동
    Alert.alert('승인자 선택', '승인자 선택 화면으로 이동합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '선택 (Mock)',
        onPress: () => {
          setConfirmInfo({ id: 202, name: '박팀장' });
          setConfirmError('');
        },
      },
    ]);
  };

  /**
   * 이미지 추가 (Mock - 실제로는 이미지 피커)
   */
  const handleAddImage = () => {
    if (images.length >= 10) {
      Alert.alert('알림', '이미지는 최대 10장까지 첨부할 수 있습니다.');
      return;
    }
    // TODO: 이미지 피커 열기
    Alert.alert('이미지 추가', '이미지 선택 화면으로 이동합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '추가 (Mock)',
        onPress: () => {
          setImages([...images, `image_${images.length + 1}.jpg`]);
        },
      },
    ]);
  };

  /**
   * 이미지 삭제
   */
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  /**
   * 등록 처리
   */
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('입력 오류', '필수 항목을 입력해주세요.');
      return;
    }

    Alert.alert('등록', '일상업무를 등록하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '등록',
        onPress: () => {
          createMutation.mutate(
            {
              buildingId,
              taskName: title.trim(),
              description: description.trim(),
              taskDate: new Date().toISOString().split('T')[0] ?? '',
              accountId: Number(currentUser?.id) || 0,
              location: location || undefined,
            },
            {
              onSuccess: () => {
                Alert.alert('알림', '일상업무가 등록되었습니다.', [
                  { text: '확인', onPress: () => router.back() },
                ]);
              },
              onError: () => {
                Alert.alert('오류', '일상업무 등록에 실패했습니다.');
              },
            }
          );
        },
      },
    ]);
  };

  /**
   * 취소 처리
   */
  const handleCancel = () => {
    if (title || description || location) {
      Alert.alert('취소', '입력한 내용이 사라집니다. 취소하시겠습니까?', [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <YStack flex={1} backgroundColor="$gray50">
      <Stack.Screen options={{ headerShown: false }} />

      {/* 그라디언트 헤더 */}
      <YStack>
        <LinearGradient
          colors={[...gradients.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top,
            paddingBottom: 40,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          {/* 네비게이션 바 */}
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            alignItems="center"
            justifyContent="space-between"
          >
            <Pressable onPress={handleCancel}>
              <XStack
                backgroundColor="rgba(255, 255, 255, 0.2)"
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius={12}
                alignItems="center"
                gap="$1"
              >
                <Text fontSize={16} color="$white">
                  {'<-'}
                </Text>
                <Text fontSize={14} fontWeight="600" color="$white">
                  취소
                </Text>
              </XStack>
            </Pressable>

            {/* 저장 버튼 */}
            <Pressable onPress={handleSubmit} disabled={!isFormValid}>
              <XStack
                backgroundColor={
                  isFormValid ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
                }
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius={12}
                alignItems="center"
                opacity={isFormValid ? 1 : 0.5}
              >
                <Text fontSize={14} fontWeight="700" color="$white">
                  등록
                </Text>
              </XStack>
            </Pressable>
          </XStack>

          {/* 제목 */}
          <YStack paddingHorizontal="$5" paddingTop="$2">
            <Text
              fontSize={isSeniorMode ? 28 : 24}
              fontWeight="800"
              color="$white"
              letterSpacing={-0.5}
            >
              일상업무 등록
            </Text>
            <Text fontSize={14} color="rgba(255, 255, 255, 0.8)" marginTop="$2">
              새로운 일상업무를 등록합니다
            </Text>
          </YStack>
        </LinearGradient>

        {/* 장식용 원형 오버레이 */}
        <YStack
          position="absolute"
          top={insets.top + 40}
          right={-30}
          width={100}
          height={100}
          borderRadius={50}
          backgroundColor="rgba(255, 255, 255, 0.1)"
          pointerEvents="none"
        />
      </YStack>

      {/* 스크롤 가능한 폼 */}
      <ScrollView
        style={{ flex: 1, marginTop: -24 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 기본 정보 섹션 (접이식) */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard floating intensity="heavy">
              <Pressable onPress={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}>
                <XStack justifyContent="space-between" alignItems="center">
                  <SectionHeader title="기본 정보" size="sm" showAccent />
                  <Text fontSize={16} color="$gray500">
                    {isBasicInfoExpanded ? '▲' : '▼'}
                  </Text>
                </XStack>
              </Pressable>

              {isBasicInfoExpanded && (
                <YStack gap="$3" marginTop="$3">
                  <InfoRow label="구분" value="일상업무" />
                  <InfoRow
                    label="담당그룹"
                    value={selectedBuilding?.buildingName || '-'}
                  />
                  <InfoRow label="담당자" value={currentUser?.name || '-'} />
                </YStack>
              )}
            </GlassCard>
          </YStack>
        </View>

        {/* 업무 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="medium">
              <SectionHeader title="업무 정보" size="sm" showAccent />
              <YStack gap="$4" marginTop="$3">
                <TextField
                  label="업무명"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (text.trim()) setTitleError('');
                  }}
                  placeholder="예: 회의실 청소 및 정리"
                  required
                  errorMessage={titleError}
                  maxLength={100}
                  showCharacterCount
                  size={isSeniorMode ? 'senior' : 'md'}
                />

                <TextField
                  label="업무 내용"
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (text.trim()) setDescriptionError('');
                  }}
                  placeholder="업무 내용을 입력하세요"
                  required
                  errorMessage={descriptionError}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  showCharacterCount
                  size={isSeniorMode ? 'senior' : 'md'}
                />
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 승인자 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="medium">
              <SectionHeader title="승인자" size="sm" showAccent />
              <YStack marginTop="$3">
                <Text
                  fontSize={isSeniorMode ? fontSize.small : 14}
                  color="$gray700"
                  marginBottom="$2"
                >
                  승인자 <Text color="$error">*</Text>
                </Text>
                <Pressable onPress={handleSelectConfirmUser}>
                  <XStack
                    backgroundColor="$surface"
                    borderWidth={confirmError ? 2 : 1}
                    borderColor={confirmError ? '$error' : '$gray200'}
                    borderRadius={12}
                    padding="$3"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text
                      fontSize={isSeniorMode ? fontSize.medium : 16}
                      color={confirmInfo.name ? '$gray900' : '$gray400'}
                    >
                      {confirmInfo.name || '승인자를 선택하세요'}
                    </Text>
                    <Text fontSize={16} color="$gray400">
                      Q
                    </Text>
                  </XStack>
                </Pressable>
                {confirmError && (
                  <Text fontSize={12} color="$error" marginTop="$1">
                    {confirmError}
                  </Text>
                )}
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* Push 알림 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="light">
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={isSeniorMode ? fontSize.medium : 16}
                  fontWeight="600"
                  color="$gray900"
                >
                  Push 알림여부
                </Text>
                <Switch
                  value={isAlertPush}
                  onValueChange={setIsAlertPush}
                  trackColor={{ false: '#E2E8F0', true: '#FF6B00' }}
                  thumbColor="#FFFFFF"
                />
              </XStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 위치 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="light">
              <SectionHeader title="위치(존)" size="sm" showAccent />
              <YStack marginTop="$3">
                <XStack gap="$2" alignItems="center">
                  <Pressable style={{ flex: 1 }} onPress={handleSelectLocation}>
                    <XStack
                      backgroundColor="$surface"
                      borderWidth={1}
                      borderColor="$gray200"
                      borderRadius={12}
                      padding="$3"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text
                        fontSize={isSeniorMode ? fontSize.medium : 16}
                        color={location ? '$gray900' : '$gray400'}
                        flex={1}
                        numberOfLines={1}
                      >
                        {location || '위치를 선택하세요'}
                      </Text>
                      {location && (
                        <Pressable onPress={resetLocationInfo} style={{ marginRight: 8 }}>
                          <Text fontSize={16} color="$gray400">
                            X
                          </Text>
                        </Pressable>
                      )}
                      <Text fontSize={16} color="$gray400">
                        Q
                      </Text>
                    </XStack>
                  </Pressable>
                  <Pressable
                    onPress={handleScanLocationQR}
                    style={{
                      padding: 12,
                      backgroundColor: '#F7F7FA',
                      borderRadius: 12,
                    }}
                  >
                    <Text fontSize={20}>QR</Text>
                  </Pressable>
                </XStack>
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 설비 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="light">
              <SectionHeader title="설비" size="sm" showAccent />
              <YStack marginTop="$3">
                <XStack gap="$2" alignItems="center">
                  <Pressable style={{ flex: 1 }} onPress={handleSelectFacility}>
                    <XStack
                      backgroundColor="$surface"
                      borderWidth={1}
                      borderColor="$gray200"
                      borderRadius={12}
                      padding="$3"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text
                        fontSize={isSeniorMode ? fontSize.medium : 16}
                        color={facilityName ? '$gray900' : '$gray400'}
                        flex={1}
                        numberOfLines={1}
                      >
                        {facilityName || '설비를 선택하세요'}
                      </Text>
                      {facilityName && (
                        <Pressable onPress={resetFacilityInfo} style={{ marginRight: 8 }}>
                          <Text fontSize={16} color="$gray400">
                            X
                          </Text>
                        </Pressable>
                      )}
                      <Text fontSize={16} color="$gray400">
                        Q
                      </Text>
                    </XStack>
                  </Pressable>
                  <Pressable
                    onPress={handleScanFacilityQR}
                    style={{
                      padding: 12,
                      backgroundColor: '#F7F7FA',
                      borderRadius: 12,
                    }}
                  >
                    <Text fontSize={20}>QR</Text>
                  </Pressable>
                </XStack>
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 이미지 파일 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="light">
              <XStack justifyContent="space-between" alignItems="center">
                <SectionHeader title="이미지 파일" size="sm" showAccent />
                <Text fontSize={12} color="$gray500">
                  {images.length}/10
                </Text>
              </XStack>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 12 }}
                contentContainerStyle={{ gap: 12 }}
              >
                {/* 이미지 추가 버튼 */}
                <Pressable
                  onPress={handleAddImage}
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: '#F7F7FA',
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#E2E8F0',
                    borderStyle: 'dashed',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text fontSize={32} color="$gray400">
                    +
                  </Text>
                </Pressable>

                {/* 첨부된 이미지들 */}
                {images.map((image, index) => (
                  <View
                    key={index}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                      backgroundColor: '#E2E8F0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <Text fontSize={12} color="$gray500">
                      {image}
                    </Text>
                    {/* 삭제 버튼 */}
                    <Pressable
                      onPress={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#EF4444',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>X</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </GlassCard>
          </YStack>
        </View>

        {/* 안내 메시지 */}
        <View>
          <YStack
            backgroundColor="rgba(255, 107, 0, 0.05)"
            padding="$4"
            borderRadius={12}
            borderWidth={1}
            borderColor="rgba(255, 107, 0, 0.1)"
          >
            <Text fontSize={13} color="$gray600" lineHeight={20}>
              {'- 업무명과 업무 내용은 필수 입력 항목입니다\n' +
                '- 승인자를 선택해야 등록할 수 있습니다\n' +
                '- 위치와 설비 정보는 선택 사항입니다\n' +
                '- 이미지는 최대 10장까지 첨부할 수 있습니다'}
            </Text>
          </YStack>
        </View>
      </ScrollView>
    </YStack>
  );
}

/**
 * 정보 행 컴포넌트
 */
interface InfoRowProps {
  label: string;
  value?: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  const { isSeniorMode, fontSize } = useSeniorStyles();

  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text fontSize={isSeniorMode ? fontSize.small : 14} color="$gray500" flex={1}>
        {label}
      </Text>
      <Text
        fontSize={isSeniorMode ? fontSize.medium : 14}
        color="$gray900"
        fontWeight="500"
        flex={2}
        textAlign="right"
        backgroundColor="$gray50"
        paddingVertical="$2"
        paddingHorizontal="$3"
        borderRadius={8}
      >
        {value || '-'}
      </Text>
    </XStack>
  );
}

/**
 * 고객불편(VOC) 등록 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 카드 입력 폼
 * 템플릿 선택, 위치 정보, 내용, 첨부파일 입력
 * 시니어 모드 지원: 확대된 입력 필드, 큰 터치 영역
 */
import React, { useState } from 'react';
import {
  ScrollView,
  Alert,
  Platform,
  ViewStyle,
  Pressable,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CLAIM_TEMPLATES, type ClaimTemplateType } from '@/features/claim/types';
import { useCreateClaim } from '@/features/claim/hooks';
import { gradients } from '@/theme/tokens';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

/**
 * 고객불편 등록 화면
 */
export default function CreateClaimScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSeniorMode, card: cardStyles, fontSize: seniorFontSize } = useSeniorStyles();

  // 폼 상태
  const [selectedTemplate, setSelectedTemplate] = useState<ClaimTemplateType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [zone, setZone] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // API Hook
  const { createClaim, isLoading: isSubmitting } = useCreateClaim({
    onSuccess: () => {
      Alert.alert('등록 완료', '고객불편이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: () => {
      Alert.alert('등록 실패', '고객불편 등록에 실패했습니다.');
    },
  });

  /**
   * 템플릿 선택 핸들러
   * v1 스타일: 제목에 템플릿 내용을 추가 (기존 내용 유지)
   */
  const handleSelectTemplate = (templateType: ClaimTemplateType) => {
    const template = CLAIM_TEMPLATES[templateType];
    setSelectedTemplate(templateType);
    // 제목에 추가 (v1 스타일)
    setTitle((prev) => prev + template.label);
    // 내용이 비어있을 때만 템플릿 내용 적용
    if (!content.trim()) {
      setContent(template.content);
    }
  };

  /**
   * 등록 처리
   */
  const handleSubmit = () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('입력 오류', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('입력 오류', '내용을 입력해주세요.');
      return;
    }

    createClaim({
      title: title.trim(),
      content: content.trim(),
      floor,
      zone,
      location,
      phoneNumber,
      templateType: selectedTemplate || undefined,
    });
  };

  const inputFontSize = isSeniorMode ? seniorFontSize.medium : 15;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
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
              <Pressable onPress={() => router.back()}>
                <XStack
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={12}
                  alignItems="center"
                  gap="$1"
                >
                  <Text fontSize={16} color="$white">
                    ←
                  </Text>
                  <Text fontSize={14} fontWeight="600" color="$white">
                    뒤로
                  </Text>
                </XStack>
              </Pressable>

              <YStack
                backgroundColor="rgba(255, 255, 255, 0.25)"
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius={20}
              >
                <Text fontSize={14} fontWeight="700" color="$white">
                  등록
                </Text>
              </YStack>
            </XStack>

            {/* 제목 */}
            <YStack paddingHorizontal="$5" paddingTop="$2">
              <Text fontSize={28} fontWeight="800" color="$white" letterSpacing={-0.5}>
                고객불편 등록
              </Text>
              <Text fontSize={14} color="rgba(255, 255, 255, 0.8)" marginTop="$2">
                템플릿을 선택하거나 직접 입력해주세요
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
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* 템플릿 선택 섹션 */}
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
              borderRadius={16}
            >
              <GlassCard floating intensity="heavy">
                <SectionHeader title="빠른 템플릿 선택" size="sm" showAccent />
                <YStack gap="$3" marginTop="$3">
                  <XStack gap="$2" flexWrap="wrap">
                    {Object.entries(CLAIM_TEMPLATES).map(([key, template]) => (
                      <Pressable
                        key={key}
                        onPress={() => handleSelectTemplate(key as ClaimTemplateType)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <XStack
                          backgroundColor={
                            selectedTemplate === key ? '$primary' : 'rgba(255, 255, 255, 0.8)'
                          }
                          paddingHorizontal="$3"
                          paddingVertical="$2.5"
                          borderRadius={12}
                          gap="$2"
                          alignItems="center"
                          borderWidth={1}
                          borderColor={selectedTemplate === key ? '$primary' : '$gray200'}
                        >
                          <Text fontSize={16}>{template.icon}</Text>
                          <Text
                            fontSize={13}
                            fontWeight="600"
                            color={selectedTemplate === key ? '$white' : '$gray700'}
                          >
                            {template.label}
                          </Text>
                        </XStack>
                      </Pressable>
                    ))}
                  </XStack>
                </YStack>
              </GlassCard>
            </YStack>
          </View>

          {/* 기본 정보 섹션 */}
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
              borderRadius={16}
            >
              <GlassCard intensity="medium">
                <SectionHeader title="기본 정보" size="sm" showAccent />
                <YStack gap="$3" marginTop="$3">
                  {/* 제목 */}
                  <YStack gap="$2">
                    <Text fontSize={13} fontWeight="600" color="$gray700">
                      제목 <Text color="$error">*</Text>
                    </Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="제목을 입력하세요"
                      placeholderTextColor="#94A3B8"
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: inputFontSize,
                        color: '#0F172A',
                      }}
                    />
                  </YStack>

                  {/* 내용 */}
                  <YStack gap="$2">
                    <Text fontSize={13} fontWeight="600" color="$gray700">
                      내용 <Text color="$error">*</Text>
                    </Text>
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      placeholder="내용을 입력하세요"
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: inputFontSize,
                        color: '#0F172A',
                        minHeight: 100,
                      }}
                    />
                  </YStack>

                  {/* 전화번호 */}
                  <YStack gap="$2">
                    <Text fontSize={13} fontWeight="600" color="$gray700">
                      연락처
                    </Text>
                    <TextInput
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="010-1234-5678"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: inputFontSize,
                        color: '#0F172A',
                      }}
                    />
                  </YStack>
                </YStack>
              </GlassCard>
            </YStack>
          </View>

          {/* 위치 정보 섹션 */}
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
              borderRadius={16}
            >
              <GlassCard intensity="medium">
                <SectionHeader title="위치 정보" size="sm" showAccent />
                <YStack gap="$3" marginTop="$3">
                  {/* 건물 */}
                  <YStack gap="$2">
                    <Text fontSize={13} fontWeight="600" color="$gray700">
                      건물
                    </Text>
                    <TextInput
                      value={building}
                      onChangeText={setBuilding}
                      placeholder="예: A동, B동"
                      placeholderTextColor="#94A3B8"
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: inputFontSize,
                        color: '#0F172A',
                      }}
                    />
                  </YStack>

                  {/* 층/구역 */}
                  <XStack gap="$3">
                    <YStack flex={1} gap="$2">
                      <Text fontSize={13} fontWeight="600" color="$gray700">
                        층
                      </Text>
                      <TextInput
                        value={floor}
                        onChangeText={setFloor}
                        placeholder="예: 5층, B1"
                        placeholderTextColor="#94A3B8"
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#E2E8F0',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          fontSize: inputFontSize,
                          color: '#0F172A',
                        }}
                      />
                    </YStack>

                    <YStack flex={1} gap="$2">
                      <Text fontSize={13} fontWeight="600" color="$gray700">
                        구역
                      </Text>
                      <TextInput
                        value={zone}
                        onChangeText={setZone}
                        placeholder="예: 동측, A구역"
                        placeholderTextColor="#94A3B8"
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#E2E8F0',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          fontSize: inputFontSize,
                          color: '#0F172A',
                        }}
                      />
                    </YStack>
                  </XStack>

                  {/* 위치 상세 */}
                  <YStack gap="$2">
                    <Text fontSize={13} fontWeight="600" color="$gray700">
                      위치 상세
                    </Text>
                    <TextInput
                      value={location}
                      onChangeText={setLocation}
                      placeholder="예: 대회의실, 남자화장실"
                      placeholderTextColor="#94A3B8"
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: inputFontSize,
                        color: '#0F172A',
                      }}
                    />
                  </YStack>
                </YStack>
              </GlassCard>
            </YStack>
          </View>

          {/* 첨부파일 섹션 (추후 구현) */}
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
              borderRadius={16}
            >
              <GlassCard intensity="light">
                <SectionHeader title="첨부파일" size="sm" showAccent />
                <YStack gap="$3" marginTop="$3" alignItems="center" paddingVertical="$4">
                  <Text fontSize={40}>📷</Text>
                  <Text fontSize={14} color="$gray600" textAlign="center">
                    사진 첨부 기능은 곧 제공될 예정입니다
                  </Text>
                </YStack>
              </GlassCard>
            </YStack>
          </View>
        </ScrollView>

        {/* 제출 버튼 (하단 고정) */}
        <View>
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            paddingHorizontal="$5"
            paddingTop="$4"
            paddingBottom={insets.bottom + 16}
            backgroundColor="$surface"
            borderTopWidth={1}
            borderTopColor="$gray100"
            style={
              Platform.select({
                ios: {
                  shadowColor: '#FF6B00',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                },
                android: {
                  elevation: 8,
                },
              }) as ViewStyle
            }
          >
            <GradientActionButton
              label="등록하기"
              onPress={handleSubmit}
              loading={isSubmitting}
              gradient={gradients.accent}
            />
          </YStack>
        </View>
      </YStack>
    </KeyboardAvoidingView>
  );
}

/**
 * 그라디언트 액션 버튼
 */
interface GradientActionButtonProps {
  label: string;
  onPress: () => void;
  gradient?: readonly [string, string];
  loading?: boolean;
}

function GradientActionButton({
  label,
  onPress,
  gradient = gradients.primary,
  loading = false,
}: GradientActionButtonProps) {
  const colors: [string, string] = [gradient[0], gradient[1]];

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => ({
        opacity: pressed || loading ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <YStack
        borderRadius={16}
        overflow="hidden"
        style={
          Platform.select({
            ios: {
              shadowColor: colors[0],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            },
            android: {
              elevation: 6,
            },
          }) as ViewStyle
        }
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text fontSize={16} fontWeight="700" color="$white">
            {loading ? '등록 중...' : label}
          </Text>
        </LinearGradient>
      </YStack>
    </Pressable>
  );
}

/**
 * 작업 결과 입력 화면
 *
 * 작업 결과 입력 폼, 체크리스트, 사진 첨부 기능 제공
 */
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, XStack, Text } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Select } from '@/components/ui/Select';
import { ChecklistSection } from '@/features/work/components/ChecklistSection';
import { ImagePickerButton } from '@/features/work/components/ImagePickerButton';
import { ImagePreviewList } from '@/features/work/components/ImagePreviewList';
import { useWorkOrderDetail } from '@/features/work/hooks/useWorkOrderDetail';
import { useWorkResult } from '@/features/work/hooks/useWorkResult';
import { useImagePicker } from '@/features/work/hooks/useImagePicker';
import type {
  ChecklistItemResult,
  WorkResultFormData,
} from '@/features/work/types/checklist.types';

/**
 * 작업 결과 폼 스키마
 */
const workResultSchema = z.object({
  accidentType: z.string().optional(),
  accidentReason: z.string().optional(),
  damage: z.string().optional(),
  countermeasure: z.string().optional(),
  improvement: z.string().optional(),
  takeAction: z.string().min(1, '조치사항을 입력하세요'),
});

type WorkResultFormValues = z.infer<typeof workResultSchema>;

/**
 * 작업 결과 입력 화면
 */
export default function WorkResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const workOrderId = parseInt(params.id, 10);

  // 작업지시 상세 정보 조회
  const { data: workOrderResponse, isLoading: isLoadingWorkOrder } = useWorkOrderDetail({
    workOrderId,
  });

  // 작업 결과 훅 (상세 API에서 가져온 items 전달)
  const { checklistItems, submitResult, uploadImages, isSubmitting } = useWorkResult({
    workOrderId,
    items: workOrderResponse?.data?.workOrderDTO?.items,
  });

  // 체크리스트 결과 상태
  const [checklistResults, setChecklistResults] = useState<ChecklistItemResult[]>([]);

  // 이미지 선택 훅
  const {
    images,
    pickFromCamera,
    pickFromGallery,
    removeImage,
    canAddMore,
    remainingSlots,
    maxImages,
  } = useImagePicker();

  // 폼 관리
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkResultFormValues>({
    resolver: zodResolver(workResultSchema),
    defaultValues: {
      accidentType: '',
      accidentReason: '',
      damage: '',
      countermeasure: '',
      improvement: '',
      takeAction: '',
    },
  });

  // 체크리스트 결과 변경 핸들러
  const handleChecklistResultChange = (result: ChecklistItemResult) => {
    setChecklistResults((prev) => {
      const existingIndex = prev.findIndex((r) => r.itemId === result.itemId);
      if (existingIndex >= 0) {
        // 기존 결과 업데이트
        const updated = [...prev];
        updated[existingIndex] = result;
        return updated;
      } else {
        // 새로운 결과 추가
        return [...prev, result];
      }
    });
  };

  // 폼 제출 핸들러
  const onSubmit = async (formData: WorkResultFormValues) => {
    try {
      // 필수 체크리스트 항목 검증
      const requiredItems = checklistItems.filter((item) => item.required);
      const completedRequiredItems = requiredItems.filter((item) =>
        checklistResults.some((result) => result.itemId === item.id && result.value)
      );

      if (completedRequiredItems.length < requiredItems.length) {
        Alert.alert('입력 오류', '필수 체크리스트 항목을 모두 작성해주세요');
        return;
      }

      // 사진 업로드
      const photoUris = images.map((img) => img.uri);
      const uploadedPhotos = photoUris.length > 0 ? await uploadImages(photoUris) : undefined;

      // 결과 저장
      const resultData: WorkResultFormData = {
        ...formData,
        checklistResults,
        photos: uploadedPhotos,
      };

      await submitResult(resultData);

      Alert.alert('완료', '작업 결과가 저장되었습니다', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('작업 결과 저장 오류:', error);
      Alert.alert('오류', '작업 결과 저장 중 오류가 발생했습니다');
    }
  };

  // 작업지시 데이터 추출
  const workOrder = workOrderResponse?.data?.workOrderDTO;

  if (isLoadingWorkOrder || !workOrder) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$gray50">
        <Text>로딩 중...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$gray50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <YStack gap="$4">
          {/* 헤더 */}
          <Card>
            <YStack gap="$2">
              <Text fontSize={20} fontWeight="700" color="$gray900">
                작업 결과 입력
              </Text>
              <Text fontSize={14} color="$gray600">
                {workOrder.name}
              </Text>
            </YStack>
          </Card>

          {/* 작업 정보 요약 */}
          <Card>
            <YStack gap="$3">
              <Text fontSize={16} fontWeight="700" color="$gray900">
                작업 정보
              </Text>
              <Divider />
              <YStack gap="$2">
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color="$gray600">
                    작업 위치
                  </Text>
                  <Text fontSize={14} color="$gray900" fontWeight="600">
                    {workOrder.location || '-'}
                  </Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color="$gray600">
                    계획 기간
                  </Text>
                  <Text fontSize={14} color="$gray900" fontWeight="600">
                    {workOrder.planStartDate} ~ {workOrder.planEndDate}
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          {/* 체크리스트 섹션 */}
          <ChecklistSection
            items={checklistItems}
            results={checklistResults}
            onResultChange={handleChecklistResultChange}
          />

          {/* 결과 입력 섹션 */}
          <Card>
            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color="$gray900">
                작업 결과
              </Text>

              <Controller
                control={control}
                name="accidentType"
                render={({ field: { onChange, value } }) => (
                  <YStack gap="$2">
                    <Text fontSize={14} fontWeight="600" color="$gray700">
                      사고 유형
                    </Text>
                    <Select
                      placeholder="선택하세요"
                      value={value}
                      onChange={onChange}
                      options={[
                        { label: '없음', value: 'NONE' },
                        { label: '경미', value: 'MINOR' },
                        { label: '중대', value: 'MAJOR' },
                      ]}
                    />
                  </YStack>
                )}
              />

              <Controller
                control={control}
                name="accidentReason"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="사고 원인"
                    placeholder="사고 원인을 입력하세요"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />

              <Controller
                control={control}
                name="damage"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="피해 현황"
                    placeholder="피해 현황을 입력하세요"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />

              <Controller
                control={control}
                name="countermeasure"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="향후 대책"
                    placeholder="향후 대책을 입력하세요"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />

              <Controller
                control={control}
                name="improvement"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="개선점"
                    placeholder="개선점을 입력하세요"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />

              <Controller
                control={control}
                name="takeAction"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="조치사항"
                    placeholder="조치사항을 입력하세요"
                    value={value}
                    onChangeText={onChange}
                    required
                    errorMessage={errors.takeAction?.message}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />
            </YStack>
          </Card>

          {/* 사진 첨부 섹션 */}
          <Card>
            <YStack gap="$3">
              <YStack gap="$2">
                <Text fontSize={18} fontWeight="700" color="$gray900">
                  사진 첨부
                </Text>
                <Text fontSize={14} color="$gray600">
                  현장 사진을 첨부하세요 (최대 {maxImages}장)
                </Text>
              </YStack>

              {/* 이미지 미리보기 */}
              <ImagePreviewList images={images} onRemove={removeImage} maxImages={maxImages} />

              {/* 사진 추가 버튼 */}
              <ImagePickerButton
                onPickFromCamera={pickFromCamera}
                onPickFromGallery={pickFromGallery}
                canAddMore={canAddMore}
                disabled={isSubmitting}
              />

              {/* 남은 슬롯 안내 */}
              {canAddMore && images.length > 0 && (
                <Text fontSize={12} color="$gray500" textAlign="center">
                  {remainingSlots}장 더 추가할 수 있습니다
                </Text>
              )}
            </YStack>
          </Card>

          {/* 하단 저장 버튼 */}
          <YStack gap="$3" paddingBottom="$6">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              결과 저장
            </Button>
            <Button variant="outline" size="lg" fullWidth onPress={() => router.back()}>
              취소
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}

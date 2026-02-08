/**
 * 작업지시 생성 화면
 *
 * 새로운 작업지시를 등록하는 폼 화면
 */
import React, { useState } from 'react';
import { ScrollView, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { YStack, XStack, Text, Separator } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { useCreateWorkOrder } from '@/features/work/hooks/useCreateWorkOrder';

/**
 * 작업지시 생성 폼 스키마
 */
const workOrderSchema = z.object({
  name: z.string().min(1, '작업명을 입력하세요'),
  description: z.string().optional(),
  firstClassId: z.number().min(1, '대분류를 선택하세요'),
  secondClassId: z.number().min(1, '소분류를 선택하세요'),
  planStartDate: z.date({ required_error: '시작일을 선택하세요' }),
  planEndDate: z.date({ required_error: '종료일을 선택하세요' }),
  buildingId: z.number().min(1, '건물을 선택하세요'),
  chargeAccountIds: z.array(z.number()).min(1, '담당자를 선택하세요'),
  approveAccountIds: z.array(z.number()).optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

/**
 * Mock 데이터: 업무 분류
 */
const mockCategories = [
  {
    id: 1,
    name: '설비관리',
    children: [
      { id: 11, name: '공조설비' },
      { id: 12, name: '전기설비' },
      { id: 13, name: '급배수설비' },
      { id: 14, name: '소방설비' },
    ],
  },
  {
    id: 2,
    name: '시설관리',
    children: [
      { id: 21, name: '건축' },
      { id: 22, name: '조경' },
      { id: 23, name: '청소' },
      { id: 24, name: '방제' },
    ],
  },
  {
    id: 3,
    name: '보안관리',
    children: [
      { id: 31, name: '출입통제' },
      { id: 32, name: 'CCTV' },
      { id: 33, name: '순찰' },
    ],
  },
];

/**
 * Mock 데이터: 건물 목록
 */
const mockBuildings = [
  { id: 1, name: '아이파크몰 1동' },
  { id: 2, name: '아이파크몰 2동' },
  { id: 3, name: '아이파크몰 3동' },
  { id: 4, name: '아이파크몰 지하주차장' },
];

/**
 * Mock 데이터: 담당자 목록
 */
const mockAccounts = [
  { id: 101, name: '김철수', role: '기술팀장' },
  { id: 102, name: '이영희', role: '설비담당' },
  { id: 103, name: '박민수', role: '전기담당' },
  { id: 104, name: '정수진', role: '관리사무소장' },
];

/**
 * 작업지시 생성 화면
 */
export default function WorkCreateScreen() {
  const { mutate: createWorkOrder, isPending } = useCreateWorkOrder();
  const [selectedFirstClass, setSelectedFirstClass] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      chargeAccountIds: [],
      approveAccountIds: [],
    },
  });

  // 대분류 선택 시 소분류 초기화
  const handleFirstClassChange = (value: string) => {
    const classId = Number(value);
    setSelectedFirstClass(classId);
    setValue('firstClassId', classId);
    setValue('secondClassId', 0); // 소분류 초기화
  };

  // 소분류 옵션 (대분류 선택에 따라 동적 생성)
  const secondClassOptions = selectedFirstClass
    ? mockCategories
        .find((cat) => cat.id === selectedFirstClass)
        ?.children.map((child) => ({
          value: String(child.id),
          label: child.name,
        })) || []
    : [];

  // 폼 제출
  const onSubmit = (data: WorkOrderFormData) => {
    createWorkOrder(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '작업지시 등록',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: '#F5F6F8' }}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 40 : 20 }}
      >
        <YStack padding={16} gap={24}>
          {/* 기본 정보 섹션 */}
          <YStack
            backgroundColor="$white"
            padding={16}
            borderRadius={12}
            gap={16}
          >
            <Text fontSize={18} fontWeight="600" color="$gray900">
              기본 정보
            </Text>
            <Separator borderColor="$gray200" />

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="작업명"
                  placeholder="작업명을 입력하세요"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.name?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="작업 설명"
                  placeholder="작업 내용을 입력하세요 (선택)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  height={100}
                />
              )}
            />

            <Controller
              control={control}
              name="firstClassId"
              render={({ field: { value } }) => (
                <YStack gap={8}>
                  <XStack alignItems="center">
                    <Text fontSize={14} fontWeight="600" color="$gray700">
                      업무 분류 (대분류)
                    </Text>
                    <Text color="$error" marginLeft={4}>*</Text>
                  </XStack>
                  <Select
                    options={mockCategories.map((cat) => ({
                      value: String(cat.id),
                      label: cat.name,
                    }))}
                    value={value ? String(value) : undefined}
                    onChange={handleFirstClassChange}
                    placeholder="대분류를 선택하세요"
                    title="업무 대분류 선택"
                    error={!!errors.firstClassId}
                  />
                  {errors.firstClassId && (
                    <Text fontSize={12} color="$error">
                      {errors.firstClassId.message}
                    </Text>
                  )}
                </YStack>
              )}
            />

            <Controller
              control={control}
              name="secondClassId"
              render={({ field: { onChange, value } }) => (
                <YStack gap={8}>
                  <XStack alignItems="center">
                    <Text fontSize={14} fontWeight="600" color="$gray700">
                      업무 분류 (소분류)
                    </Text>
                    <Text color="$error" marginLeft={4}>*</Text>
                  </XStack>
                  <Select
                    options={secondClassOptions}
                    value={value ? String(value) : undefined}
                    onChange={(val) => onChange(Number(val))}
                    placeholder="소분류를 선택하세요"
                    title="업무 소분류 선택"
                    disabled={!selectedFirstClass}
                    error={!!errors.secondClassId}
                  />
                  {errors.secondClassId && (
                    <Text fontSize={12} color="$error">
                      {errors.secondClassId.message}
                    </Text>
                  )}
                </YStack>
              )}
            />
          </YStack>

          {/* 일정 섹션 */}
          <YStack
            backgroundColor="$white"
            padding={16}
            borderRadius={12}
            gap={16}
          >
            <Text fontSize={18} fontWeight="600" color="$gray900">
              일정
            </Text>
            <Separator borderColor="$gray200" />

            <Controller
              control={control}
              name="planStartDate"
              render={({ field: { onChange, value } }) => (
                <YStack gap={8}>
                  <XStack alignItems="center">
                    <Text fontSize={14} fontWeight="600" color="$gray700">
                      계획 시작일
                    </Text>
                    <Text color="$error" marginLeft={4}>*</Text>
                  </XStack>
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    placeholder="시작일을 선택하세요"
                    error={!!errors.planStartDate}
                  />
                  {errors.planStartDate && (
                    <Text fontSize={12} color="$error">
                      {errors.planStartDate.message}
                    </Text>
                  )}
                </YStack>
              )}
            />

            <Controller
              control={control}
              name="planEndDate"
              render={({ field: { onChange, value } }) => (
                <YStack gap={8}>
                  <XStack alignItems="center">
                    <Text fontSize={14} fontWeight="600" color="$gray700">
                      계획 종료일
                    </Text>
                    <Text color="$error" marginLeft={4}>*</Text>
                  </XStack>
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    placeholder="종료일을 선택하세요"
                    error={!!errors.planEndDate}
                    minimumDate={watch('planStartDate')}
                  />
                  {errors.planEndDate && (
                    <Text fontSize={12} color="$error">
                      {errors.planEndDate.message}
                    </Text>
                  )}
                </YStack>
              )}
            />
          </YStack>

          {/* 담당 섹션 */}
          <YStack
            backgroundColor="$white"
            padding={16}
            borderRadius={12}
            gap={16}
          >
            <Text fontSize={18} fontWeight="600" color="$gray900">
              담당
            </Text>
            <Separator borderColor="$gray200" />

            <Controller
              control={control}
              name="buildingId"
              render={({ field: { onChange, value } }) => (
                <YStack gap={8}>
                  <XStack alignItems="center">
                    <Text fontSize={14} fontWeight="600" color="$gray700">
                      건물
                    </Text>
                    <Text color="$error" marginLeft={4}>*</Text>
                  </XStack>
                  <Select
                    options={mockBuildings.map((building) => ({
                      value: String(building.id),
                      label: building.name,
                    }))}
                    value={value ? String(value) : undefined}
                    onChange={(val) => onChange(Number(val))}
                    placeholder="건물을 선택하세요"
                    title="건물 선택"
                    error={!!errors.buildingId}
                  />
                  {errors.buildingId && (
                    <Text fontSize={12} color="$error">
                      {errors.buildingId.message}
                    </Text>
                  )}
                </YStack>
              )}
            />

            <YStack gap={8}>
              <XStack alignItems="center">
                <Text fontSize={14} fontWeight="600" color="$gray700">
                  담당자
                </Text>
                <Text color="$error" marginLeft={4}>*</Text>
              </XStack>
              <Text fontSize={12} color="$gray500">
                담당자는 Mock 데이터를 사용합니다. 다중 선택 기능은 추후 구현됩니다.
              </Text>
              <YStack gap={8} padding={12} backgroundColor="$gray50" borderRadius={8}>
                {mockAccounts.map((account) => (
                  <Text key={account.id} fontSize={14} color="$gray700">
                    • {account.name} ({account.role})
                  </Text>
                ))}
              </YStack>
              {errors.chargeAccountIds && (
                <Text fontSize={12} color="$error">
                  {errors.chargeAccountIds.message}
                </Text>
              )}
            </YStack>
          </YStack>

          {/* 첨부파일 섹션 */}
          <YStack
            backgroundColor="$white"
            padding={16}
            borderRadius={12}
            gap={16}
          >
            <Text fontSize={18} fontWeight="600" color="$gray900">
              첨부파일
            </Text>
            <Separator borderColor="$gray200" />

            <YStack gap={12}>
              <Button variant="outline" size="md" disabled>
                파일 추가
              </Button>
              <Text fontSize={12} color="$gray500" textAlign="center">
                파일 업로드 기능은 추후 구현됩니다.
              </Text>
            </YStack>
          </YStack>

          {/* 저장 버튼 */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
          >
            저장
          </Button>
        </YStack>
      </ScrollView>
    </>
  );
}

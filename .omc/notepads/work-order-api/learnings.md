# 작업지시 API 스펙 추가 및 코드 생성 - 학습 노트

## 날짜
2026-02-08

## 완료된 작업

### 1. OpenAPI 스펙 추가 (specs/insite-api.yaml)
- 작업지시 목록 조회 API (`GET /m/api/workOrder/workOrderList`)
- 작업지시 상세 조회 API (`GET /m/api/workOrder/orderView/view/{workorderId}`)
- 작업지시 발행 API (`PUT /m/api/workOrder/issueWorkOrder/{workorderId}`)
- 작업 결과 등록 API (`POST /m/api/workOrder/addWorkOrderResult/v2`)

### 2. 스키마 정의
- `WorkOrderDTO`: 기본 작업지시 정보
- `WorkOrderDetailDTO`: 상세 정보 (항목, 첨부파일, 결과 포함)
- `WorkOrderItemDTO`: 작업 항목
- `AttachmentDTO`: 첨부 파일
- `WorkOrderResultDTO`: 작업 결과
- `WorkOrderListResponse`: 목록 응답 (페이지네이션 포함)
- `WorkOrderDetailResponse`: 상세 응답
- `WorkOrderResultRequest`: 결과 등록 요청

### 3. Orval 코드 생성
- TanStack Query 훅 자동 생성
  - `useGetWorkOrderList`: 목록 조회
  - `useGetWorkOrderDetail`: 상세 조회
  - `useIssueWorkOrder`: 작업지시 발행
  - `useAddWorkOrderResult`: 작업 결과 등록
- TypeScript 타입 정의 생성

### 4. features/work 폴더 구조 생성

#### hooks/
- `useWorkOrders.ts`: 목록 조회 커스텀 훅 (필터링, 페이지네이션)
- `useWorkOrderDetail.ts`: 상세 조회 및 mutation 통합 훅
- `index.ts`: 훅 export

#### types/
- `index.ts`: Orval 생성 타입 재export

#### components/
- `WorkOrderCard.tsx`: 작업지시 카드 컴포넌트 (기존 파일 업데이트)
- `WorkOrderStatusBadge.tsx`: 상태 배지 컴포넌트
- `index.ts`: 컴포넌트 export

## 주요 패턴

### 1. Orval 생성 훅 래핑
```typescript
// 생성된 훅을 직접 사용하지 않고 커스텀 훅으로 래핑
export function useWorkOrders(options: UseWorkOrdersOptions) {
  const params = { /* 파라미터 구성 */ };
  return useGetWorkOrderList(params, {
    query: { enabled, staleTime: 1000 * 60 * 5 }
  });
}
```

### 2. Query Invalidation 패턴
```typescript
// mutation 성공 시 관련 쿼리 무효화
const issueMutation = useIssueWorkOrder({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailQuery.queryKey });
      queryClient.invalidateQueries({ queryKey: getGetWorkOrderListQueryKey() });
    }
  }
});
```

### 3. 타입 재export로 편의성 제공
```typescript
// features/work/types/index.ts
export type { WorkOrderDTO, WorkOrderDetailDTO } from '@/api/generated/models';
```

## 발견한 이슈 및 해결

### 1. Orval 버전 호환성 문제
- 문제: orval 8.2.0에서 commander.js conflicts 메서드 오류
- 해결: orval을 최신 버전으로 재설치 (`bun add -D orval@latest`)

### 2. TypeScript 타입 오류
- 문제: WorkOrderDTO에 없는 `assigneeName` 필드 참조
- 해결: 기존 코드에서 해당 필드 제거

### 3. Tamagui 타입 오류
- 문제: Badge 컴포넌트의 backgroundColor, color props 타입 불일치
- 해결: style prop으로 전달

## 베스트 프랙티스

1. **Orval 생성 코드는 직접 수정하지 않기**
   - 커스텀 훅으로 래핑하여 사용
   - 타입은 재export하여 사용

2. **Query Key 관리**
   - Orval이 생성한 `getXXXQueryKey` 함수 활용
   - invalidateQueries 시 일관성 유지

3. **TypeScript Strict Mode 준수**
   - optional 체이닝 사용 (`?.`)
   - undefined 체크 (`!== undefined`)
   - any 타입 사용 금지

4. **파일 구조**
   ```
   features/{feature}/
   ├── hooks/           # 비즈니스 로직
   ├── components/      # UI 컴포넌트
   ├── types/           # 타입 정의
   └── index.ts         # 통합 export
   ```

## 다음 단계

1. 무한 스크롤 훅 구현 (`useWorkOrdersInfinite`)
2. 작업지시 상세 화면 구현
3. 작업 결과 등록 폼 구현
4. 첨부 파일 업로드 기능 추가
5. 실제 API 연동 테스트

## 참고 문서
- [Orval 공식 문서](https://orval.dev/)
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [OpenAPI Specification](https://swagger.io/specification/)

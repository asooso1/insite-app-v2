# InsiteApp v2 - API 연동 상세 계획

> **작성일**: 2026-02-12
> **상태**: 검토 대기

---

## 목차

1. [개요](#1-개요)
2. [현재 상태 분석](#2-현재-상태-분석)
3. [인증 시스템](#3-인증-시스템)
4. [API 엔드포인트 매핑](#4-api-엔드포인트-매핑)
5. [화면별 API 연동 계획](#5-화면별-api-연동-계획)
6. [공통 인프라](#6-공통-인프라)
7. [구현 우선순위](#7-구현-우선순위)
8. [예상 일정](#8-예상-일정)

---

## 1. 개요

### 1.1 목표

- v1의 Mock 데이터를 실제 백엔드 API(`csp-mas`)로 교체
- v1과 동일한 기능을 제공하면서 코드 품질 향상
- TanStack Query 기반 캐싱 및 상태 관리

### 1.2 범위

| 포함 | 제외 |
|------|------|
| 인증 (로그인, 기기인증) | BEMS API (빌딩 에너지) |
| 작업지시 (CRUD) | PC API |
| 순찰점검 (CRUD) | 대시보드 API |
| 승인/확인 | 캘린더 API |
| 일상업무 | - |
| 고객불편 | - |
| 내 업무 | - |

### 1.3 기술 스택

| 항목 | v1 | v2 |
|------|-----|-----|
| HTTP 클라이언트 | Axios | Axios (동일) |
| 상태 관리 | Apollo Client (Reactive Vars) | Zustand + TanStack Query |
| API 코드 생성 | 수동 | Orval (OpenAPI) |
| 타입 | JavaScript | TypeScript (Strict) |

---

## 2. 현재 상태 분석

### 2.1 v2 기존 API 레이어

```
src/api/
├── client.ts          # Axios 인스턴스 (완료)
├── generated/         # Orval 자동 생성 (부분)
│   ├── account/       # 인증 API (완료)
│   ├── devices/       # 기기 API (완료)
│   └── models/        # 타입 정의 (부분)
└── customInstance.ts  # mutator (완료)

specs/
└── insite-api.yaml    # OpenAPI 스펙 (확장 필요)
```

### 2.2 OpenAPI 스펙 확장 필요 항목

현재 정의됨:
- `/m/api/account/login` - 로그인
- `/m/api/account/guestLogin` - 게스트 로그인
- `/m/api/account/logout` - 로그아웃
- `/m/api/devices/*` - 기기 관리

추가 필요:
- `/m/api/workOrder/*` - 작업지시 (15+ 엔드포인트)
- `/m/api/nfc-round/*` - 순찰점검 (10+ 엔드포인트)
- `/m/api/personal/work-order/*` - 일상업무
- `/m/api/tasks/*` - 내 업무/승인
- `/m/api/mypage/*` - 마이페이지

---

## 3. 인증 시스템

### 3.1 인증 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   로그인     │────▶│  JWT 발급   │────▶│  홈 화면    │
│   화면      │     │  토큰 저장   │     │            │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ 기기 인증   │ (v2)
                    │ 필요 시     │
                    └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
             ┌──────────┐  ┌──────────┐
             │ 승인대기  │  │ 기기변경  │
             │ 화면     │  │ 모달     │
             └──────────┘  └──────────┘
```

### 3.2 토큰 관리

```typescript
// src/stores/auth.store.ts (기존)
interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  // 추가 필요
  deviceInfo: DeviceInfo | null;
  autoLogin: boolean;
}
```

### 3.3 API 요청 헤더

```typescript
// 모든 API 요청에 포함
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'X-App-Version': '2.0.0',
  'X-Platform': 'mobile',
  'X-LOGIN-VERSION': 'v2', // 기기 인증 시
}
```

### 3.4 로그인 응답 코드 처리

| 코드 | 처리 |
|------|------|
| `success` | 토큰 저장 → 홈 이동 |
| `fail` | 에러 메시지 표시 |
| `DEVICE_NOT_REGISTERED` | 기기 등록 요청 |
| `DEVICE_PENDING_APPROVAL` | 승인 대기 화면 이동 |
| `DEVICE_MISMATCH` | 기기 변경 모달 |
| `DEVICE_BLOCKED` | 계정 차단 메시지 |

---

## 4. API 엔드포인트 매핑

### 4.1 작업지시 API

| v1 사용 | 백엔드 엔드포인트 | v2 훅 이름 |
|---------|------------------|-----------|
| 목록 조회 | `GET /m/api/workOrder/workOrderList` | `useWorkOrderList` |
| 상세 조회 | `GET /m/api/workOrder/orderView/{type}/{id}` | `useWorkOrderDetail` |
| 등록 | `POST /m/api/workOrder/addOrder/v2` | `useCreateWorkOrder` |
| 수정 | `PUT /m/api/workOrder/orderEdit` | `useUpdateWorkOrder` |
| 발행 | `PUT /m/api/workOrder/issueWorkOrder/{id}` | `useIssueWorkOrder` |
| 완료요청 | `PUT /m/api/workOrder/requestComplete/{id}` | `useRequestComplete` |
| 결과등록 | `POST /m/api/workOrder/addWorkOrderResult/v2` | `useAddWorkOrderResult` |
| 승인 | `PUT /m/api/workOrder/approveWorkOrder` | `useApproveWorkOrder` |
| 반려 | `PUT /m/api/workOrder/denyWorkOrder` | `useDenyWorkOrder` |

### 4.2 순찰점검 API

| v1 사용 | 백엔드 엔드포인트 | v2 훅 이름 |
|---------|------------------|-----------|
| 목록 조회 | `GET /m/api/nfc-round` | `usePatrolList` |
| 상세 조회 | `GET /m/api/nfc-round/{id}` | `usePatrolDetail` |
| 상태 변경 | `PUT /m/api/nfc-round/state` | `useUpdatePatrolState` |
| 점검 대상 | `GET /m/api/nfc-round/targets` | `usePatrolTargets` |
| 점검 항목 | `GET /m/api/nfc-round/items` | `usePatrolItems` |
| 결과 조회 | `GET /m/api/nfc-round/result` | `usePatrolResult` |
| 결과 저장 | `POST /m/api/nfc-round/result` | `useSavePatrolResult` |
| 결과 수정 | `PUT /m/api/nfc-round/result` | `useUpdatePatrolResult` |
| 완료 요청 | `POST /m/api/nfc-round/request-complete/{id}` | `useRequestPatrolComplete` |

### 4.3 승인/확인 API

| v1 사용 | 백엔드 엔드포인트 | v2 훅 이름 |
|---------|------------------|-----------|
| 확인 목록 | `GET /m/api/tasks?type=confirm` | `useConfirmTasks` |
| 건수 조회 | `GET /m/api/tasks/count?type=confirm` | `useConfirmTasksCount` |
| 일괄 승인 | `POST /m/api/tasks/confirm` | `useBatchConfirm` |
| 미승인 업무 | `GET /m/api/workOrder/unapproved/{dateType}` | `useUnapprovedTasks` |

### 4.4 일상업무 API

| v1 사용 | 백엔드 엔드포인트 | v2 훅 이름 |
|---------|------------------|-----------|
| 목록 조회 | `GET /m/api/personal/work-order` | `usePersonalTaskList` |
| 상세 조회 | `GET /m/api/personal/work-order/{id}` | `usePersonalTaskDetail` |
| 등록 | `POST /m/api/personal/work-order?type=create` | `useCreatePersonalTask` |
| 수정 | `POST /m/api/personal/work-order?type=update` | `useUpdatePersonalTask` |
| 확인 | `POST /m/api/personal/work-order?type=confirm` | `useConfirmPersonalTask` |

### 4.5 내 업무 API

| v1 사용 | 백엔드 엔드포인트 | v2 훅 이름 |
|---------|------------------|-----------|
| 내 업무 조회 | `GET /m/api/tasks?type=own` | `useMyTasks` |
| 지연 업무 | `GET /m/api/tasks?type=delayed` | `useDelayedTasks` |
| 건수 조회 | `GET /m/api/tasks/count?type=own` | `useMyTasksCount` |

### 4.6 고객불편 API

| v1 사용 | 백엔드 엔드포인트 | v2 훅 이름 |
|---------|------------------|-----------|
| 목록 조회 | `GET /m/api/workOrder/complainList` | `useClaimList` |
| 상세 조회 | `GET /m/api/workOrder/viewComplain/{id}` | `useClaimDetail` |
| 등록 | `POST /m/api/workOrder/addComplain` | `useCreateClaim` |

### 4.7 공통 API

| 용도 | 백엔드 엔드포인트 | v2 훅 이름 |
|------|------------------|-----------|
| 내 정보 | `GET /m/api/mypage/myInfoView` | `useMyInfo` |
| 팀 목록 | `GET /m/api/site/buildingUserGroups/{buildingId}` | `useTeams` |
| 팀원 목록 | `GET /m/api/site/buildingUserGroup/{teamId}` | `useTeamMembers` |
| 승인자 목록 | `GET /m/api/site/admins` | `useApprovers` |
| 설비 검색 | `GET /m/api/facility/facilityList` | `useFacilities` |

---

## 5. 화면별 API 연동 계획

### 5.1 홈 화면 (`/(main)/(home)/index.tsx`)

**현재**: Mock 데이터
**연동 API**:
- `GET /m/api/tasks?type=own` - 오늘의 업무
- `GET /m/api/tasks/count?type=confirm` - 승인 대기 건수
- `GET /m/api/workOrder/workOrderStatePerCount` - 상태별 건수

**구현 방법**:
```typescript
// src/features/home/hooks/useHomeData.ts
export function useHomeData() {
  const myTasks = useMyTasks({ from: today, to: today });
  const confirmCount = useConfirmTasksCount();
  const workOrderStats = useWorkOrderStats();

  return {
    todayWork: myTasks.data?.workOrder?.length ?? 0,
    todayPatrol: myTasks.data?.nfcRound?.length ?? 0,
    pendingApproval: confirmCount.data ?? 0,
    isLoading: myTasks.isLoading || confirmCount.isLoading,
  };
}
```

### 5.2 작업지시 목록 (`/(main)/(home)/work/index.tsx`)

**현재**: Mock 데이터
**연동 API**: `GET /m/api/workOrder/workOrderList`

**파라미터**:
```typescript
interface WorkOrderListParams {
  page: number;
  size: number;
  buildingId?: number;
  state?: WorkOrderState;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}
```

### 5.3 작업지시 상세 (`/(main)/(home)/work/[id]/index.tsx`)

**연동 API**: `GET /m/api/workOrder/orderView/view/{id}`

**액션 버튼**:
| 상태 | 권한 | 버튼 |
|------|------|------|
| ISSUE | 담당자 | 작업 시작 |
| PROCESSING | 담당자 | 결과 입력, 완료 요청 |
| REQ_COMPLETE | 승인자 | 승인, 반려 |

### 5.4 순찰 목록 (`/(main)/(home)/patrol/index.tsx`)

**연동 API**: `GET /m/api/nfc-round`

### 5.5 순찰 상세 (`/(main)/(home)/patrol/[id]/index.tsx`)

**연동 API**:
- `GET /m/api/nfc-round/{id}` - 상세 정보
- `GET /m/api/nfc-round/targets` - 점검 대상
- `GET /m/api/nfc-round/items` - 점검 항목

### 5.6 승인/확인 (`/(main)/(home)/approval/index.tsx`)

**연동 API**:
- `GET /m/api/tasks?type=confirm` - 오늘 확인 대상
- `GET /m/api/workOrder/unapproved/past` - 지연 업무
- `POST /m/api/tasks/confirm` - 일괄 승인

### 5.7 내 작업 (`/(main)/(my-work)/index.tsx`)

**연동 API**: `GET /m/api/tasks?type=own`

---

## 6. 공통 인프라

### 6.1 에러 핸들링

```typescript
// src/api/errorHandler.ts
export const API_ERROR_CODES = {
  E00400: { message: '잘못된 요청입니다', action: 'toast' },
  E00401: { message: '인증이 필요합니다', action: 'logout' },
  E00403: { message: '접근 권한이 없습니다', action: 'toast' },
  E00412: { message: '로그인이 만료되었습니다', action: 'logout' },
  E00500: { message: '서버 오류가 발생했습니다', action: 'modal' },
};
```

### 6.2 응답 타입

```typescript
// src/api/types.ts
interface ApiResponse<T> {
  code: 'success' | 'fail' | string;
  message: string;
  data: T;
  authToken?: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

### 6.3 토큰 갱신

```typescript
// src/api/client.ts - 응답 인터셉터
api.interceptors.response.use((response) => {
  // 응답에 새 토큰이 있으면 갱신
  if (response.data?.authToken) {
    useAuthStore.getState().setAccessToken(response.data.authToken);
  }
  return response;
});
```

### 6.4 파일 업로드

```typescript
// src/utils/fileUpload.ts
export async function uploadWithFiles(
  endpoint: string,
  data: Record<string, any>,
  files: ImageFile[]
): Promise<ApiResponse<any>> {
  const formData = new FormData();

  // JSON 데이터
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
  });

  // 파일 첨부
  files.forEach((file, index) => {
    formData.append('files', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || `image_${index}.jpg`,
    });
  });

  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
```

---

## 7. 구현 우선순위

### Phase 1: 인프라 (1일)

1. OpenAPI 스펙 확장 (작업지시, 순찰, 승인 API 추가)
2. Orval 코드 재생성
3. 에러 핸들링 강화
4. 토큰 갱신 로직 완성

### Phase 2: 인증 완성 (0.5일)

1. 로그인 API 응답 코드 처리 완성
2. 기기 인증 v2 지원
3. 자동 로그인 구현

### Phase 3: 홈 화면 (0.5일)

1. 오늘의 업무 현황 API 연동
2. 빠른 실행 버튼 동작 확인

### Phase 4: 작업지시 (1일)

1. 목록 조회 + 무한 스크롤
2. 상세 조회
3. 등록/수정
4. 상태 변경 (발행, 완료요청, 승인, 반려)
5. 결과 입력 + 이미지 업로드

### Phase 5: 순찰점검 (1일)

1. 목록 조회
2. 상세 조회 (층별 항목)
3. 결과 입력 + 이미지 업로드
4. 완료 요청

### Phase 6: 승인/확인 (0.5일)

1. 확인 대상 목록
2. 일괄 승인
3. 미승인 업무

### Phase 7: 내 작업/일상업무/고객불편 (1일)

1. 내 작업 화면 연동
2. 일상업무 CRUD
3. 고객불편 CRUD

### Phase 8: 통합 테스트 (0.5일)

1. 전체 플로우 테스트
2. 에러 케이스 테스트
3. 오프라인 대응 확인

---

## 8. 예상 일정

| Phase | 작업 | 예상 기간 |
|-------|------|----------|
| 1 | 인프라 | 1일 |
| 2 | 인증 완성 | 0.5일 |
| 3 | 홈 화면 | 0.5일 |
| 4 | 작업지시 | 1일 |
| 5 | 순찰점검 | 1일 |
| 6 | 승인/확인 | 0.5일 |
| 7 | 기타 화면 | 1일 |
| 8 | 통합 테스트 | 0.5일 |
| **합계** | | **6일** |

---

## 결정 필요 사항

1. **오프라인 지원**: 필요한가? (v1은 미지원)
2. **캐싱 전략**: 어느 수준까지? (목록만? 상세도?)
3. **백엔드 API 버전**: v1과 v2 중 어떤 것 우선?
4. **테스트 서버**: 스테이징 서버 접근 가능?

---

_검토 후 승인되면 구현을 시작합니다._

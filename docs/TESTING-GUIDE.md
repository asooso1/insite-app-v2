# 테스트 가이드

> InsiteApp v2.0 테스트 환경, 실행 방법, 기능별 테스트 추가 패턴, 권한별 테스트 전략

---

## 1. 테스트 환경 요약

| 항목 | 값 |
|------|-----|
| 프레임워크 | Jest 29 + jest-expo 54 |
| 컴포넌트 테스트 | @testing-library/react-native 13 |
| API Mock | MSW 2.12 (설치 완료, 향후 활용) |
| 설정 파일 | `jest.config.js`, `jest.setup.js` |
| 경로 별칭 | `@/` → `src/` (moduleNameMapper) |
| 테스트 위치 | 각 모듈의 `__tests__/` 디렉토리 |
| 파일 패턴 | `**/__tests__/**/*.test.ts(x)` |

### 디렉토리 구조

```
src/
├── stores/
│   ├── __tests__/
│   │   ├── auth.store.test.ts       # 인증 스토어 (12 tests)
│   │   ├── attendance.store.test.ts  # 출퇴근 스토어 (10 tests)
│   │   └── offlineQueue.store.test.ts # 오프라인 큐 (9 tests)
│   ├── auth.store.ts
│   ├── attendance.store.ts
│   └── offlineQueue.store.ts
├── hooks/
│   └── __tests__/
│       └── usePermission.test.ts     # 권한 시스템 (23 tests)
├── api/
│   └── __tests__/
│       └── errorHandler.test.ts      # 에러 핸들러 (15 tests)
└── features/
    ├── work/hooks/       # 테스트 추가 대상
    ├── patrol/hooks/     # 테스트 추가 대상
    ├── claim/hooks/      # 테스트 추가 대상
    ├── approval/hooks/   # 테스트 추가 대상
    └── ...
```

---

## 2. 테스트 실행 방법

### 기본 명령어

```bash
# 전체 테스트 실행
npm test

# 커버리지 포함
npm run test:coverage

# 특정 파일만 실행
npx jest src/stores/__tests__/auth.store.test.ts

# 특정 패턴 매칭
npx jest --testPathPattern="stores"

# watch 모드 (파일 변경 감지)
npx jest --watch

# 특정 테스트 이름만 실행
npx jest -t "로그아웃"
```

### 커버리지 기준 (jest.config.js)

```
branches:   60%
functions:  60%
lines:      70%
statements: 70%
```

커버리지 제외 대상:
- `src/api/generated/**` (Orval 자동생성 코드)
- `src/theme/**` (Tamagui 테마)
- `src/**/index.ts` (re-export 배럴 파일)
- `*.d.ts` (타입 선언)

---

## 3. 기능별 테스트 추가 가이드

### 3.1 Zustand 스토어 테스트

Zustand 스토어는 React 훅 없이 직접 테스트 가능하다.

```typescript
// src/stores/__tests__/example.store.test.ts
import { useExampleStore } from '../example.store';

describe('example.store', () => {
  beforeEach(() => {
    // 매 테스트마다 초기 상태로 리셋
    useExampleStore.setState({
      items: [],
      loading: false,
    });
    jest.clearAllMocks();
  });

  it('아이템을 추가한다', () => {
    const { addItem } = useExampleStore.getState();

    addItem({ id: '1', name: '테스트' });

    expect(useExampleStore.getState().items).toHaveLength(1);
  });
});
```

**핵심 패턴:**
- `useXXXStore.setState({...})` → 테스트 전 상태 초기화
- `useXXXStore.getState().action()` → 액션 호출
- `useXXXStore.getState().field` → 상태 검증
- persist 미들웨어가 있는 스토어도 동일 패턴 (jest.setup.js에서 SecureStore/AsyncStorage가 mock됨)

### 3.2 순수 함수 / 유틸리티 테스트

React 훅에 의존하지 않는 순수 함수는 직접 import해서 테스트한다.

```typescript
// src/utils/__tests__/jwt.test.ts
import { isTokenExpired, decodeJwt } from '../jwt';

describe('isTokenExpired', () => {
  it('만료된 토큰은 true를 반환한다', () => {
    const expired = createExpiredToken(); // 헬퍼
    expect(isTokenExpired(expired)).toBe(true);
  });
});
```

### 3.3 API 에러 핸들러 / 서비스 레이어 테스트

외부 의존성은 `jest.mock()`으로 격리한다.

```typescript
// mock 선언 (파일 최상단, describe 바깥)
jest.mock('../globalToast', () => ({
  showGlobalToast: jest.fn(),
}));

jest.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ logout: jest.fn() })),
  },
}));

// require로 mock 인스턴스 참조 (jest.mock 호이스팅 때문)
const { showGlobalToast } = require('../globalToast');
```

**AxiosError 생성 헬퍼** (이미 `errorHandler.test.ts`에 구현됨):

```typescript
function createAxiosError(options: {
  status?: number;
  data?: Record<string, unknown>;
  code?: string;
  message?: string;
  noResponse?: boolean;
}): AxiosError {
  const error = new Error(options.message || 'Request failed') as AxiosError;
  error.isAxiosError = true;
  error.code = options.code;
  error.name = 'AxiosError';
  error.toJSON = () => ({});

  if (!options.noResponse && options.status) {
    error.response = {
      status: options.status,
      data: options.data || {},
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  error.config = { headers: new AxiosHeaders() };

  return error;
}
```

### 3.4 TanStack Query 래핑 훅 테스트 (Feature Hooks)

Orval 생성 훅을 래핑하는 커스텀 훅(`useWorkOrders` 등)은 두 가지 전략이 있다.

#### 전략 A: Orval 생성 훅을 mock (권장, 빠름)

```typescript
// src/features/work/hooks/__tests__/useWorkOrders.test.ts
import { renderHook } from '@testing-library/react-native';

// Orval 생성 훅 mock
jest.mock('@/api/generated/work-order/work-order', () => ({
  useGetWorkOrderList: jest.fn(),
}));

const { useGetWorkOrderList } = require('@/api/generated/work-order/work-order');

describe('useWorkOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGetWorkOrderList.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('기본 파라미터로 Orval 훅을 호출한다', () => {
    // 동적 import (mock 적용 후)
    const { useWorkOrders } = require('../useWorkOrders');
    renderHook(() => useWorkOrders());

    expect(useGetWorkOrderList).toHaveBeenCalledWith(
      expect.objectContaining({ buildingId: 1, page: 0, size: 20 }),
      expect.objectContaining({ query: { enabled: true, staleTime: 300000 } })
    );
  });

  it('상태 필터가 파라미터에 포함된다', () => {
    const { useWorkOrders } = require('../useWorkOrders');
    renderHook(() => useWorkOrders({ state: 'ISSUE' }));

    expect(useGetWorkOrderList).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'ISSUE' }),
      expect.anything()
    );
  });
});
```

#### 전략 B: MSW로 실제 HTTP 요청 mock (통합 테스트)

```typescript
// src/features/work/hooks/__tests__/useWorkOrders.integration.test.tsx
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const server = setupServer(
  http.get('*/m/api/work-order/list', () => {
    return HttpResponse.json({
      code: 'success',
      data: [
        { id: 1, title: '테스트 작업', state: 'ISSUE' },
      ],
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// QueryClient 래퍼
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useWorkOrders (통합)', () => {
  it('API에서 작업 목록을 조회한다', async () => {
    const { useWorkOrders } = require('../useWorkOrders');
    const { result } = renderHook(() => useWorkOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.data).toHaveLength(1);
  });
});
```

### 3.5 React 컴포넌트 테스트 (향후)

```typescript
// src/features/work/components/__tests__/WorkOrderCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { WorkOrderCard } from '../WorkOrderCard';

// Tamagui 래퍼 필요 시
import { TamaguiProvider, config } from '@tamagui/config';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <TamaguiProvider config={config}>{ui}</TamaguiProvider>
  );
}

describe('WorkOrderCard', () => {
  it('작업 제목을 표시한다', () => {
    renderWithProviders(
      <WorkOrderCard title="복도 조명 교체" state="ISSUE" />
    );
    expect(screen.getByText('복도 조명 교체')).toBeTruthy();
  });
});
```

---

## 4. 권한(역할)별 테스트 세팅

### 4.1 역할 시스템 요약

| 그룹 | roleId | 역할명 | 주요 권한 |
|------|--------|--------|-----------|
| ADMIN | 1 | 시스템관리자 | 전체 접근 |
| ADMIN | 3 | 본사관리자 | 전체 접근 |
| ADMIN | 9 | 현장소장 | 전체 접근 |
| ADMIN | 10 | 현장관리자 | 전체 접근 |
| WORKER | 12 | 시설팀원 | 내 업무, 순찰, 스캔, 출퇴근 |
| WORKER | 14 | 미화팀원 | 내 업무, 순찰, 스캔, 출퇴근 |
| WORKER | 20 | 보안팀원 | 내 업무, 순찰, 스캔, 출퇴근 |
| PARTNER | 15 | 고객사관리자 | 승인, 대시보드, 고객불편 |
| PARTNER | 16 | 건물주 | 승인, 대시보드, 고객불편 |
| PARTNER | 19 | 협력사 | 승인, 대시보드, 고객불편 |
| EXTERNAL | 17 | 민원인 | 고객불편만 |
| EXTERNAL | 18 | 입주사 | 고객불편만 |
| EXTERNAL | 21 | 일일계정 | 고객불편만 |

### 4.2 역할별 Mock User 팩토리

테스트 전역에서 재사용할 Mock 팩토리를 만든다.

```typescript
// src/__tests__/fixtures/mockUsers.ts

/** 역할별 Mock 사용자 생성 */
export function createMockUser(roleId: number, overrides?: Record<string, unknown>) {
  const roleNames: Record<number, string> = {
    1: '시스템관리자', 3: '본사관리자', 9: '현장소장', 10: '현장관리자',
    12: '시설팀원', 14: '미화팀원', 20: '보안팀원',
    15: '고객사관리자', 16: '건물주', 19: '협력사',
    17: '민원인', 18: '입주사', 21: '일일계정',
  };

  return {
    id: String(roleId),
    userId: `user_${roleId}`,
    name: `테스트_${roleNames[roleId] || '사용자'}`,
    roleId,
    buildingCnt: 1,
    buildingAccountDTO: [{ buildingId: 'b1', buildingName: '테스트빌딩' }],
    ...overrides,
  };
}

/** 자주 쓰는 프리셋 */
export const MOCK_USERS = {
  admin: createMockUser(10),           // 현장관리자
  sysAdmin: createMockUser(1),         // 시스템관리자
  worker: createMockUser(12),          // 시설팀원
  securityWorker: createMockUser(20),  // 보안팀원
  partner: createMockUser(15),         // 고객사관리자
  external: createMockUser(17),        // 민원인
  dailyAccount: createMockUser(21),    // 일일계정
};
```

### 4.3 Auth Store Mock으로 역할 주입

스토어를 직접 조작하여 특정 역할 상태를 세팅한다.

```typescript
import { useAuthStore } from '@/stores/auth.store';
import { MOCK_USERS } from '@/__tests__/fixtures/mockUsers';

describe('역할별 동작 테스트', () => {
  function setRole(roleId: number) {
    useAuthStore.setState({
      user: createMockUser(roleId),
      token: 'mock-token',
      isAuthenticated: true,
      isHydrated: true,
    });
  }

  afterEach(() => {
    useAuthStore.setState({
      user: null, token: null, isAuthenticated: false, isHydrated: false,
    });
  });

  it('ADMIN은 승인 권한이 있다', () => {
    setRole(10); // 현장관리자
    const { hasPermission } = getRolePermissions(10);
    expect(hasPermission('approval')).toBe(true);
  });

  it('WORKER는 승인 권한이 없다', () => {
    setRole(12); // 시설팀원
    const { hasPermission } = getRolePermissions(12);
    expect(hasPermission('approval')).toBe(false);
  });
});
```

### 4.4 권한별 컴포넌트 렌더링 테스트 (패턴)

화면에서 역할에 따라 UI가 달라지는 경우를 테스트한다.

```typescript
// src/features/home/__tests__/HomeScreen.permission.test.tsx
import { render, screen } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/auth.store';
import { createMockUser } from '@/__tests__/fixtures/mockUsers';

// usePermission 훅은 내부에서 useAuthStore를 읽으므로
// 스토어만 세팅하면 자동으로 권한이 결정된다.

describe('HomeScreen 권한별 렌더링', () => {
  function renderWithRole(roleId: number) {
    useAuthStore.setState({
      user: createMockUser(roleId),
      token: 'mock-token',
      isAuthenticated: true,
      isHydrated: true,
    });
    return render(<HomeScreen />);
  }

  describe('ADMIN (roleId: 10)', () => {
    beforeEach(() => renderWithRole(10));

    it('승인/확인 메뉴가 표시된다', () => {
      expect(screen.getByText('승인/확인')).toBeTruthy();
    });

    it('운영대시보드가 표시된다', () => {
      expect(screen.getByText('운영대시보드')).toBeTruthy();
    });

    it('수시업무등록이 표시된다', () => {
      expect(screen.getByText('수시업무등록')).toBeTruthy();
    });
  });

  describe('WORKER (roleId: 12)', () => {
    beforeEach(() => renderWithRole(12));

    it('승인/확인 메뉴가 없다', () => {
      expect(screen.queryByText('승인/확인')).toBeNull();
    });

    it('순찰점검이 표시된다', () => {
      expect(screen.getByText('순찰점검')).toBeTruthy();
    });
  });

  describe('EXTERNAL (roleId: 17)', () => {
    beforeEach(() => renderWithRole(17));

    it('고객불편만 표시된다', () => {
      expect(screen.getByText('고객불편등록')).toBeTruthy();
      expect(screen.getByText('고객불편목록')).toBeTruthy();
    });

    it('그 외 메뉴는 없다', () => {
      expect(screen.queryByText('내업무')).toBeNull();
      expect(screen.queryByText('순찰점검')).toBeNull();
    });
  });
});
```

### 4.5 역할별 매트릭스 테스트 (it.each 패턴)

여러 역할을 한꺼번에 검증할 때는 `it.each`를 활용한다.

```typescript
import { getRoleGroup } from '@/hooks/usePermission';
import { ROLE_PERMISSIONS } from '@/types/permission.types';

describe('권한 매트릭스', () => {
  // 승인 권한: ADMIN, PARTNER만 가능
  it.each([
    { roleId: 1,  group: 'ADMIN',    expected: true },
    { roleId: 10, group: 'ADMIN',    expected: true },
    { roleId: 12, group: 'WORKER',   expected: false },
    { roleId: 15, group: 'PARTNER',  expected: true },
    { roleId: 17, group: 'EXTERNAL', expected: false },
  ])('roleId $roleId ($group) → approval=$expected', ({ roleId, expected }) => {
    const group = getRoleGroup(roleId);
    const perms = ROLE_PERMISSIONS[group];
    expect(perms.includes('approval')).toBe(expected);
  });

  // 탭 접근: ADMIN, WORKER만 전체 5탭
  it.each([
    { roleId: 10, tabCount: 5 },  // ADMIN
    { roleId: 12, tabCount: 5 },  // WORKER
    { roleId: 15, tabCount: 2 },  // PARTNER
    { roleId: 17, tabCount: 2 },  // EXTERNAL
  ])('roleId $roleId → 탭 $tabCount개', ({ roleId, tabCount }) => {
    const group = getRoleGroup(roleId);
    const { ROLE_TABS } = require('@/types/permission.types');
    expect(ROLE_TABS[group]).toHaveLength(tabCount);
  });

  // 출퇴근 QR: ADMIN + WORKER + 일일계정(21)
  it.each([
    { roleId: 1,  expected: true },   // 시스템관리자
    { roleId: 12, expected: true },   // 시설팀원
    { roleId: 21, expected: true },   // 일일계정
    { roleId: 15, expected: false },  // 고객사관리자
    { roleId: 17, expected: false },  // 민원인
  ])('roleId $roleId → 출퇴근 QR=$expected', ({ roleId, expected }) => {
    const { QR_ATTENDANCE_ROLE_IDS } = require('@/types/permission.types');
    expect(QR_ATTENDANCE_ROLE_IDS.includes(roleId)).toBe(expected);
  });
});
```

---

## 5. 테스트 추가 시 체크리스트

### 새 파일 추가 순서

1. 대상 모듈 옆에 `__tests__/` 디렉토리 생성
2. `대상파일.test.ts(x)` 파일 생성
3. 필요한 mock 선언 (파일 최상단)
4. `beforeEach`에서 상태 초기화
5. 테스트 작성 → 실행 → 통과 확인

### Mock 필요 여부 판단

| 의존성 | Mock 방법 | 이유 |
|--------|-----------|------|
| 네이티브 모듈 (expo-*, RN) | jest.setup.js에 이미 등록 | 전역 mock |
| Zustand 스토어 | `setState()` 직접 조작 | mock 불필요 |
| Orval 생성 훅 | `jest.mock('@/api/generated/...')` | 네트워크 격리 |
| axios | `jest.spyOn(axios, 'isAxiosError')` | 부분 mock |
| expo-router | `jest.mock('expo-router')` | 네비게이션 격리 |
| 내부 유틸 | `jest.mock('@/utils/xxx')` | 격리 필요 시 |

### jest.setup.js에 이미 mock된 네이티브 모듈

- `expo-secure-store`
- `@react-native-async-storage/async-storage`
- `expo-notifications`
- `expo-location`
- `expo-network`
- `react-native-nfc-manager`
- `expo-camera`
- `expo-image-picker`
- `expo-updates`
- `expo-blur`
- `expo-linear-gradient`
- `expo-linking`
- `react-native-reanimated`

새 네이티브 모듈 사용 시 `jest.setup.js`에 mock을 추가해야 한다.

---

## 6. 추가 기능 테스트 우선순위

현재 테스트가 없는 주요 모듈 (권장 순서):

| 순위 | 모듈 | 파일 | 테스트 유형 |
|------|------|------|------------|
| 1 | JWT 유틸 | `src/utils/jwt.ts` | 순수 함수 |
| 2 | 세션 타임아웃 | `src/hooks/useSessionTimeout.ts` | 훅 (AppState mock 필요) |
| 3 | 로그인 훅 | `src/features/auth/hooks/useLogin.ts` | TanStack Query mock |
| 4 | 작업지시 목록 | `src/features/work/hooks/useWorkOrders.ts` | Orval mock |
| 5 | 순찰점검 | `src/features/patrol/hooks/usePatrolActions.ts` | Orval mock |
| 6 | 고객불편 | `src/features/claim/hooks/useClaims.ts` | Orval mock |
| 7 | 승인 | `src/features/approval/hooks/useApproval.ts` | Orval mock + 권한 |
| 8 | 출퇴근 | `src/features/attendance/hooks/useAttendance.ts` | 네이티브 mock |
| 9 | 홈 화면 데이터 | `src/features/home/hooks/useHomeData.ts` | 복합 mock |
| 10 | API 클라이언트 | `src/api/client.ts` | 인터셉터 테스트 |

---

## 7. 자주 겪는 문제와 해결

### Jest 버전 충돌

jest-expo 54는 **Jest 29**를 요구한다. Jest 30 설치 시 아래 에러 발생:

```
ReferenceError: You are trying to import a file outside of the scope of the test code
```

해결: `npm install --save-dev jest@^29.2.1`

### setupFiles vs setupFilesAfterSetup

- `setupFiles`: 테스트 프레임워크 로드 **전** 실행. `beforeAll` 등 Jest 전역 사용 불가.
- `setupFilesAfterSetup`: **유효하지 않은 필드**. 사용 시 에러 발생.
- 프레임워크 로드 **후** 실행이 필요하면 `setupFilesAfterFramework`를 사용. 현재 프로젝트에서는 `setupFiles`만으로 충분.

### TypeScript 캐스팅 에러

strict 모드에서 관련 없는 타입 간 직접 캐스팅 불가:

```typescript
// 에러: TS2352
(error as Record<string, unknown>)

// 해결: unknown 경유
(error as unknown as Record<string, unknown>)
```

### console 출력 억제

`jest.setup.js`에서 전역 mock:

```javascript
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
```

특정 테스트에서 console 출력을 확인하려면:

```typescript
const consoleSpy = jest.spyOn(console, 'error');
// ... 테스트 코드
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('에러'));
consoleSpy.mockRestore();
```

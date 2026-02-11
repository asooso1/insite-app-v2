# Sprint 3.3 - 알람 대시보드 구현 학습 내용

## 구현 완료 항목

### 1. 타입 정의 (alarm.types.ts)
- AlarmSeverity: 'CRITICAL' | 'WARNING' | 'INFO'
- AlarmDTO: 알람 데이터 모델 (id, title, description, severity, location, timestamp 등)
- AlarmStats: 알람 통계 (total, critical, warning, info, unacknowledged)
- AlarmFilter: 필터 인터페이스

### 2. 색상 상수 (alarmColors.ts)
- ALARM_SEVERITY_MAP: 심각도별 색상, 레이블, 아이콘, 배경색 정의
- getAlarmSeverityColor/BgColor/Label/Icon: 헬퍼 함수

### 3. Mock 데이터 (mockAlarms.ts)
- mockAlarms: 8개의 샘플 알람 데이터
- calculateAlarmStats: 통계 계산 함수
- mockAlarmStats: 미리 계산된 통계

### 4. 컴포넌트 구현

#### AlarmSummaryCard
- 알람 통계 요약 표시
- 4개 통계 그리드 (전체, 심각, 경고, 정보)
- 미확인 알람 배지 표시
- 심각도별 색상 및 아이콘

#### AlarmFilterBar
- 4개 필터 버튼 (전체, 심각, 경고, 정보)
- 선택된 필터 강조 표시
- Pressable 터치 피드백

#### AlarmCard
- 알람 목록 항목 카드
- 좌측 심각도 컬러 바
- 심각도 뱃지 + 미확인 표시
- 제목, 설명, 위치 정보 표시
- 발생 시각 포맷팅

#### AlarmDetailModal
- 알람 상세 정보 모달
- 심각도, 제목, 상세 설명
- 발생 위치 (건물, 층, 구역)
- 발생 시간 (전체 타임스탬프)
- 조치 사항 안내
- 확인 완료 버튼 (미확인 알람만)

### 5. 화면 구현 (alarm.tsx)
- Stack 네비게이션 헤더
- AlarmSummaryCard (상단 통계)
- AlarmFilterBar (필터 바)
- FlatList 알람 목록
- Pull-to-refresh 기능
- EmptyState 표시
- 알람 카드 터치로 상세 모달 열기
- 확인 핸들러로 알람 상태 업데이트

## 기술적 결정 사항

### 1. Tamagui 색상 타입 처리
- 커스텀 색상 hex 값 사용 시 `as any` 타입 캐스팅 필요
- backgroundColor, color prop에 적용
- 예: `backgroundColor={(getAlarmSeverityColor('CRITICAL') + '10') as any}`

### 2. Button 컴포넌트 flex 처리
- Button은 style prop을 받지 않음
- XStack으로 감싸서 flex 속성 적용
- fullWidth prop 활용

### 3. 날짜 포맷팅
- ISO 8601 형식 사용 ('2026-02-08T14:30:00+09:00')
- toLocaleString('ko-KR') 사용
- 목록: '02/08 14:30'
- 상세: '2026. 02. 08. 14:30:00'

### 4. 필터 상태 관리
- useState로 selectedSeverity 관리
- useMemo로 필터링된 목록 계산
- 실시간 필터링으로 성능 최적화

### 5. Mock 데이터 새로고침
- setTimeout으로 1초 딜레이 시뮬레이션
- 실제 API 연동 시 대체 필요

## 컨벤션 준수 사항

- ✅ TypeScript strict mode (any 최소화)
- ✅ 한국어 주석
- ✅ Tamagui 컴포넌트 사용
- ✅ 컴포넌트 파일 구조 (interface, 주석, export)
- ✅ PascalCase 컴포넌트명
- ✅ Prettier 포맷팅

## 다음 단계 고려사항

1. API 연동 준비
   - Orval 생성 후 mock 데이터 대체
   - useAlarmQuery, useAcknowledgeAlarmMutation 훅 생성

2. 실시간 알람
   - WebSocket 연동 검토
   - Push Notification 연동

3. 알람 히스토리
   - 확인한 알람 목록 화면
   - 날짜별 필터링

4. 알람 설정
   - 알람 타입별 on/off 설정
   - 알림음 설정

5. 성능 최적화
   - FlatList getItemLayout 추가
   - 무한 스크롤 페이지네이션

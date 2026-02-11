/**
 * Home Tab - Stack Navigator
 *
 * 홈 탭 내부 화면들 (파일 기반 자동 라우팅):
 * - index: 홈 화면
 * - work: 작업지시
 * - patrol: 순찰점검
 * - dashboard: 대시보드
 * - facility: 설비정보
 * - personal-task: 일상업무
 * - claim: 고객불편
 * - approval: 승인/확인
 */
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

/**
 * 대시보드 Mock 데이터
 */
import type { DashboardStats } from '../types/dashboard.types';

/**
 * Mock 대시보드 통계 데이터
 */
export const mockDashboardStats: DashboardStats = {
  work: {
    total: 25,
    completed: 15,
    processing: 7,
    pending: 3,
  },
  patrol: {
    total: 10,
    completed: 6,
    processing: 2,
    notStarted: 2,
  },
  weeklyTrend: [
    { day: '월', work: 5, patrol: 2 },
    { day: '화', work: 8, patrol: 3 },
    { day: '수', work: 6, patrol: 2 },
    { day: '목', work: 7, patrol: 4 },
    { day: '금', work: 9, patrol: 3 },
    { day: '토', work: 4, patrol: 1 },
    { day: '일', work: 3, patrol: 1 },
  ],
};

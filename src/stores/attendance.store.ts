/**
 * 출퇴근 상태 관리 스토어
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AttendanceMethod = 'NFC' | 'QR' | 'MANUAL' | 'NONE';

export interface AttendanceFlag {
  /** 출근 가능 여부 */
  login: boolean;
  /** 퇴근 가능 여부 */
  logOut: boolean;
}

export interface AttendanceRecord {
  id?: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: number;
  latitude: number;
  longitude: number;
  method: AttendanceMethod;
  synced: boolean;
}

interface AttendanceState {
  // State
  /** 출퇴근 가능 여부 플래그 */
  attendanceFlag: AttendanceFlag;
  /** 오늘 출근 시간 */
  todayCheckIn: string | null;
  /** 오늘 퇴근 시간 */
  todayCheckOut: string | null;
  /** 처리 중 여부 */
  isProcessing: boolean;
  /** 에러 메시지 */
  error: string | null;

  // Actions
  setAttendanceFlag: (flag: AttendanceFlag) => void;
  setTodayCheckIn: (time: string | null) => void;
  setTodayCheckOut: (time: string | null) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  resetDaily: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      // Initial State
      attendanceFlag: { login: false, logOut: false },
      todayCheckIn: null,
      todayCheckOut: null,
      isProcessing: false,
      error: null,

      // Actions
      setAttendanceFlag: (flag) => {
        console.log('[Attendance] 플래그 업데이트:', flag);
        set({ attendanceFlag: flag });
      },

      setTodayCheckIn: (time) => {
        console.log('[Attendance] 출근 시간 설정:', time);
        set({ todayCheckIn: time });
      },

      setTodayCheckOut: (time) => {
        console.log('[Attendance] 퇴근 시간 설정:', time);
        set({ todayCheckOut: time });
      },

      setProcessing: (processing) => {
        set({ isProcessing: processing });
      },

      setError: (error) => {
        set({ error });
      },

      resetDaily: () => {
        console.log('[Attendance] 일일 데이터 초기화');
        set({
          todayCheckIn: null,
          todayCheckOut: null,
          error: null,
        });
      },
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        todayCheckIn: state.todayCheckIn,
        todayCheckOut: state.todayCheckOut,
      }),
    }
  )
);

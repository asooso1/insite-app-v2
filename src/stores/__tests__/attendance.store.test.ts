/**
 * Attendance Store 단위 테스트
 */
import { useAttendanceStore } from '../attendance.store';

describe('attendance.store', () => {
  beforeEach(() => {
    useAttendanceStore.setState({
      attendanceFlag: { login: false, logOut: false },
      todayCheckIn: null,
      todayCheckOut: null,
      isProcessing: false,
      error: null,
    });
  });

  describe('setAttendanceFlag', () => {
    it('출퇴근 플래그를 업데이트한다', () => {
      useAttendanceStore.getState().setAttendanceFlag({ login: true, logOut: false });

      const state = useAttendanceStore.getState();
      expect(state.attendanceFlag).toEqual({ login: true, logOut: false });
    });

    it('출퇴근 플래그를 퇴근 가능 상태로 변경한다', () => {
      useAttendanceStore.getState().setAttendanceFlag({ login: false, logOut: true });

      expect(useAttendanceStore.getState().attendanceFlag).toEqual({ login: false, logOut: true });
    });
  });

  describe('setTodayCheckIn', () => {
    it('오늘 출근 시간을 설정한다', () => {
      useAttendanceStore.getState().setTodayCheckIn('2026-02-20T09:00:00');

      expect(useAttendanceStore.getState().todayCheckIn).toBe('2026-02-20T09:00:00');
    });

    it('null로 초기화할 수 있다', () => {
      useAttendanceStore.getState().setTodayCheckIn('2026-02-20T09:00:00');
      useAttendanceStore.getState().setTodayCheckIn(null);

      expect(useAttendanceStore.getState().todayCheckIn).toBeNull();
    });
  });

  describe('setTodayCheckOut', () => {
    it('오늘 퇴근 시간을 설정한다', () => {
      useAttendanceStore.getState().setTodayCheckOut('2026-02-20T18:00:00');

      expect(useAttendanceStore.getState().todayCheckOut).toBe('2026-02-20T18:00:00');
    });
  });

  describe('setProcessing', () => {
    it('처리 중 상태를 설정한다', () => {
      useAttendanceStore.getState().setProcessing(true);
      expect(useAttendanceStore.getState().isProcessing).toBe(true);

      useAttendanceStore.getState().setProcessing(false);
      expect(useAttendanceStore.getState().isProcessing).toBe(false);
    });
  });

  describe('setError', () => {
    it('에러 메시지를 설정한다', () => {
      useAttendanceStore.getState().setError('출근 실패');
      expect(useAttendanceStore.getState().error).toBe('출근 실패');
    });

    it('에러를 초기화한다', () => {
      useAttendanceStore.getState().setError('에러');
      useAttendanceStore.getState().setError(null);

      expect(useAttendanceStore.getState().error).toBeNull();
    });
  });

  describe('resetDaily', () => {
    it('일일 데이터를 초기화한다 (출퇴근 시간, 에러)', () => {
      useAttendanceStore.setState({
        todayCheckIn: '2026-02-20T09:00:00',
        todayCheckOut: '2026-02-20T18:00:00',
        error: '일부 에러',
      });

      useAttendanceStore.getState().resetDaily();

      const state = useAttendanceStore.getState();
      expect(state.todayCheckIn).toBeNull();
      expect(state.todayCheckOut).toBeNull();
      expect(state.error).toBeNull();
    });

    it('출퇴근 플래그와 처리 상태는 유지한다', () => {
      useAttendanceStore.setState({
        attendanceFlag: { login: true, logOut: false },
        isProcessing: true,
        todayCheckIn: '09:00',
      });

      useAttendanceStore.getState().resetDaily();

      const state = useAttendanceStore.getState();
      expect(state.attendanceFlag).toEqual({ login: true, logOut: false });
      expect(state.isProcessing).toBe(true);
    });
  });
});

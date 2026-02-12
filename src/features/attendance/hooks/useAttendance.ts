/**
 * 출퇴근 Hook
 *
 * 출근/퇴근 처리 및 상태 관리
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAttendanceStore, AttendanceMethod } from '@/stores/attendance.store';
import { useOfflineQueueStore } from '@/stores/offlineQueue.store';
import { isOnline } from '@/stores/network.store';
import { getCurrentLocation, cacheLocation, getCachedLocation } from '@/services/locationService';
import { apiClient } from '@/api/client';

interface AttendanceResult {
  success: boolean;
  message: string;
  time?: string;
}

export const useAttendance = () => {
  const {
    attendanceFlag,
    todayCheckIn,
    todayCheckOut,
    isProcessing,
    error,
    setAttendanceFlag,
    setTodayCheckIn,
    setTodayCheckOut,
    setProcessing,
    setError,
  } = useAttendanceStore();

  const addToQueue = useOfflineQueueStore((state) => state.addToQueue);

  const [localProcessing, setLocalProcessing] = useState(false);

  /**
   * 출근 처리
   */
  const checkIn = useCallback(
    async (method: AttendanceMethod = 'QR'): Promise<AttendanceResult> => {
      // 중복 요청 방지
      if (isProcessing || localProcessing) {
        return { success: false, message: '이미 처리 중입니다.' };
      }

      // 출근 가능 여부 확인
      if (!attendanceFlag.login) {
        return { success: false, message: '현재 출근할 수 없습니다.' };
      }

      setProcessing(true);
      setLocalProcessing(true);
      setError(null);

      try {
        // 위치 정보 가져오기
        let location = await getCurrentLocation().catch((err) => {
          console.log('[Attendance] 출근 - 위치 조회 실패:', err);
          return null;
        });

        // 오프라인이거나 위치 조회 실패 시 캐시된 위치 사용
        if (!location) {
          location = await getCachedLocation();
        }

        // 여전히 위치를 못 가져오면 에러
        if (!location) {
          const message = '위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.';
          setError(message);
          Alert.alert('위치 오류', message);
          setProcessing(false);
          setLocalProcessing(false);
          return { success: false, message };
        }

        // 위치 캐시
        await cacheLocation(location);

        const payload = {
          latitude: location.latitude,
          longitude: location.longitude,
          type: method,
        };

        // 온라인이면 즉시 API 호출
        if (isOnline()) {
          try {
            const response = await apiClient.post(
              `/m/api/duties/check-in?type=${method}`,
              {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            );

            if (response.data.code === 'success' || response.data.success) {
              const checkInTime = new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              setTodayCheckIn(checkInTime);
              setAttendanceFlag({ ...attendanceFlag, login: false });

              Alert.alert('출근 완료', `${checkInTime}에 출근 처리되었습니다.`);

              return {
                success: true,
                message: '출근이 정상 처리되었습니다.',
                time: checkInTime,
              };
            }

            throw new Error(response.data.message || '출근 처리 실패');
          } catch (apiError: unknown) {
            // 위치 범위 외 에러 처리
            if (
              apiError &&
              typeof apiError === 'object' &&
              'response' in apiError
            ) {
              const errorResponse = (apiError as { response?: { data?: { message?: string } } })
                .response?.data;
              if (errorResponse?.message?.includes('반경 외')) {
                throw new Error('출근지 반경 외입니다. 지정된 구역 내에서 출근해주세요.');
              }
            }
            throw apiError;
          }
        }

        // 오프라인이면 큐에 저장
        console.log('[Attendance] 오프라인 - 출근 요청 큐에 저장');
        addToQueue('ATTENDANCE_CHECK_IN', payload);

        const pendingTime = new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        setTodayCheckIn(`${pendingTime} (동기화 대기)`);
        setAttendanceFlag({ ...attendanceFlag, login: false });

        Alert.alert(
          '출근 저장됨',
          '오프라인 상태입니다. 네트워크 연결 시 자동으로 동기화됩니다.'
        );

        return {
          success: true,
          message: '출근이 저장되었습니다. (동기화 대기)',
          time: pendingTime,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : '출근 처리 중 오류가 발생했습니다.';
        console.error('[Attendance] 출근 실패:', message);
        setError(message);
        Alert.alert('출근 실패', message);
        return { success: false, message };
      } finally {
        setProcessing(false);
        setLocalProcessing(false);
      }
    },
    [
      attendanceFlag,
      isProcessing,
      localProcessing,
      setAttendanceFlag,
      setError,
      setProcessing,
      setTodayCheckIn,
      addToQueue,
    ]
  );

  /**
   * 퇴근 처리
   */
  const checkOut = useCallback(
    async (method: AttendanceMethod = 'QR'): Promise<AttendanceResult> => {
      // 중복 요청 방지
      if (isProcessing || localProcessing) {
        return { success: false, message: '이미 처리 중입니다.' };
      }

      // 퇴근 가능 여부 확인
      if (!attendanceFlag.logOut) {
        return { success: false, message: '현재 퇴근할 수 없습니다.' };
      }

      setProcessing(true);
      setLocalProcessing(true);
      setError(null);

      try {
        // 위치 정보 가져오기
        let location = await getCurrentLocation().catch((err) => {
          console.log('[Attendance] 퇴근 - 위치 조회 실패:', err);
          return null;
        });

        // 오프라인이거나 위치 조회 실패 시 캐시된 위치 사용
        if (!location) {
          location = await getCachedLocation();
        }

        // 여전히 위치를 못 가져오면 에러
        if (!location) {
          const message = '위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.';
          setError(message);
          Alert.alert('위치 오류', message);
          setProcessing(false);
          setLocalProcessing(false);
          return { success: false, message };
        }

        // 위치 캐시
        await cacheLocation(location);

        const payload = {
          latitude: location.latitude,
          longitude: location.longitude,
          type: method,
        };

        // 온라인이면 즉시 API 호출
        if (isOnline()) {
          try {
            const response = await apiClient.post(
              `/m/api/duties/check-out?type=${method}`,
              {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            );

            if (response.data.code === 'success' || response.data.success) {
              const checkOutTime = new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              setTodayCheckOut(checkOutTime);
              setAttendanceFlag({ ...attendanceFlag, logOut: false });

              Alert.alert('퇴근 완료', `${checkOutTime}에 퇴근 처리되었습니다.`);

              return {
                success: true,
                message: '퇴근이 정상 처리되었습니다.',
                time: checkOutTime,
              };
            }

            throw new Error(response.data.message || '퇴근 처리 실패');
          } catch (apiError: unknown) {
            // 위치 범위 외 에러 처리
            if (
              apiError &&
              typeof apiError === 'object' &&
              'response' in apiError
            ) {
              const errorResponse = (apiError as { response?: { data?: { message?: string } } })
                .response?.data;
              if (errorResponse?.message?.includes('반경 외')) {
                throw new Error('퇴근지 반경 외입니다. 지정된 구역 내에서 퇴근해주세요.');
              }
            }
            throw apiError;
          }
        }

        // 오프라인이면 큐에 저장
        console.log('[Attendance] 오프라인 - 퇴근 요청 큐에 저장');
        addToQueue('ATTENDANCE_CHECK_OUT', payload);

        const pendingTime = new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        setTodayCheckOut(`${pendingTime} (동기화 대기)`);
        setAttendanceFlag({ ...attendanceFlag, logOut: false });

        Alert.alert(
          '퇴근 저장됨',
          '오프라인 상태입니다. 네트워크 연결 시 자동으로 동기화됩니다.'
        );

        return {
          success: true,
          message: '퇴근이 저장되었습니다. (동기화 대기)',
          time: pendingTime,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : '퇴근 처리 중 오류가 발생했습니다.';
        console.error('[Attendance] 퇴근 실패:', message);
        setError(message);
        Alert.alert('퇴근 실패', message);
        return { success: false, message };
      } finally {
        setProcessing(false);
        setLocalProcessing(false);
      }
    },
    [
      attendanceFlag,
      isProcessing,
      localProcessing,
      setAttendanceFlag,
      setError,
      setProcessing,
      setTodayCheckOut,
      addToQueue,
    ]
  );

  /**
   * 출퇴근 상태 새로고침 (서버에서 최신 상태 가져오기)
   */
  const refreshAttendanceStatus = useCallback(async () => {
    if (!isOnline()) {
      console.log('[Attendance] 오프라인 - 상태 새로고침 스킵');
      return;
    }

    try {
      const response = await apiClient.get('/m/api/mypage/myInfoView');
      const data = response.data.data;

      if (data?.attendanceFlag) {
        setAttendanceFlag(data.attendanceFlag);
      }

      // 오늘 출퇴근 시간 업데이트 (API 응답에 있다면)
      if (data?.todayCheckIn) {
        setTodayCheckIn(data.todayCheckIn);
      }
      if (data?.todayCheckOut) {
        setTodayCheckOut(data.todayCheckOut);
      }
    } catch (err) {
      console.error('[Attendance] 상태 새로고침 실패:', err);
    }
  }, [setAttendanceFlag, setTodayCheckIn, setTodayCheckOut]);

  return {
    // State
    attendanceFlag,
    todayCheckIn,
    todayCheckOut,
    isProcessing: isProcessing || localProcessing,
    error,

    // Actions
    checkIn,
    checkOut,
    refreshAttendanceStatus,
  };
};

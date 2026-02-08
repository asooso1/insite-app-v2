/**
 * Debounce Hook
 *
 * 값의 변경을 지연시켜 불필요한 API 호출을 방지합니다.
 */
import { useState, useEffect } from 'react';

/**
 * 디바운스 훅
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지연된 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 다음 effect 실행 전 또는 언마운트 시 타이머 제거
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

/**
 * useDebounce 훅 단위 테스트
 */
import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));

    expect(result.current).toBe('hello');
  });

  it('지연 시간 전에는 값이 변경되지 않는다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    );

    rerender({ value: 'world', delay: 300 });

    // 300ms 전
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('hello');
  });

  it('지연 시간 후에 값이 변경된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    );

    rerender({ value: 'world', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('world');
  });

  it('연속 변경 시 마지막 값만 적용된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    act(() => { jest.advanceTimersByTime(100); });

    rerender({ value: 'c', delay: 300 });
    act(() => { jest.advanceTimersByTime(100); });

    rerender({ value: 'd', delay: 300 });
    act(() => { jest.advanceTimersByTime(300); });

    expect(result.current).toBe('d');
  });

  it('기본 지연 시간은 300ms이다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => { jest.advanceTimersByTime(299); });
    expect(result.current).toBe('initial');

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('updated');
  });

  it('커스텀 지연 시간을 적용한다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    act(() => { jest.advanceTimersByTime(400); });
    expect(result.current).toBe('initial');

    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current).toBe('updated');
  });

  it('숫자 타입에서도 동작한다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    rerender({ value: 42, delay: 300 });

    act(() => { jest.advanceTimersByTime(300); });

    expect(result.current).toBe(42);
  });

  it('객체 타입에서도 동작한다', () => {
    const obj1 = { name: 'test' };
    const obj2 = { name: 'updated' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 300 } }
    );

    rerender({ value: obj2, delay: 300 });

    act(() => { jest.advanceTimersByTime(300); });

    expect(result.current).toEqual({ name: 'updated' });
  });

  it('값이 동일하면 변경되지 않는다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'same', delay: 300 } }
    );

    rerender({ value: 'same', delay: 300 });

    act(() => { jest.advanceTimersByTime(300); });

    expect(result.current).toBe('same');
  });
});

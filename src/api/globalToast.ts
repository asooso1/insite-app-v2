/**
 * 글로벌 Toast 브릿지
 *
 * React Context 외부(Axios 인터셉터 등)에서 Toast를 호출하기 위한 모듈.
 * ToastProvider가 마운트되면 registerGlobalToast로 콜백을 등록하고,
 * 이후 showGlobalToast로 어디서든 Toast를 표시할 수 있다.
 */

type ToastVariant = 'error' | 'warning' | 'info' | 'success';
type ToastFn = (message: string, variant: ToastVariant) => void;

let _showToast: ToastFn | null = null;

/**
 * ToastProvider에서 호출하여 Toast 함수를 등록
 */
export function registerGlobalToast(fn: ToastFn): void {
  _showToast = fn;
}

/**
 * React Context 외부에서 Toast 표시
 */
export function showGlobalToast(message: string, variant: ToastVariant = 'error'): void {
  if (_showToast) {
    _showToast(message, variant);
  } else {
    console.warn('[GlobalToast] Toast 미등록:', message);
  }
}

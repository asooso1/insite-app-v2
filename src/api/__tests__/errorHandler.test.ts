/**
 * API 에러 핸들러 단위 테스트
 */
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { handleApiError, getApiErrorMessage } from '../errorHandler';

// globalToast mock
jest.mock('../globalToast', () => ({
  showGlobalToast: jest.fn(),
}));

// auth store mock
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      logout: jest.fn(),
    })),
  },
}));

const { showGlobalToast } = require('../globalToast');
const { useAuthStore } = require('@/stores/auth.store');

/**
 * AxiosError를 생성하는 헬퍼
 */
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
  } else if (options.noResponse) {
    error.response = undefined;
  }

  error.config = { headers: new AxiosHeaders() };

  // axios.isAxiosError가 true를 반환하도록
  (error as unknown as Record<string, unknown>)['__CANCEL__'] = false;

  return error;
}

describe('handleApiError', () => {
  let mockLogout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout = jest.fn();
    useAuthStore.getState.mockReturnValue({ logout: mockLogout });

    // axios.isAxiosError mock
    jest.spyOn(axios, 'isAxiosError').mockImplementation((error) => {
      return (error as Record<string, unknown>)?.isAxiosError === true;
    });
  });

  it('일반 Error 객체 시 에러 메시지를 반환하고 toast를 표시한다', () => {
    const result = handleApiError(new Error('일반 에러'));

    expect(result).toBe('일반 에러');
    expect(showGlobalToast).toHaveBeenCalledWith('일반 에러', 'error');
  });

  it('비 Error 객체 시 기본 메시지를 반환한다', () => {
    const result = handleApiError('문자열 에러');

    expect(result).toBe('알 수 없는 오류가 발생했습니다.');
  });

  it('네트워크 에러 시 오프라인 메시지를 표시한다', () => {
    const error = createAxiosError({
      noResponse: true,
      code: 'ERR_NETWORK',
      message: 'Network Error',
    });

    const result = handleApiError(error);

    expect(result).toBe('네트워크에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.');
    expect(showGlobalToast).toHaveBeenCalledWith(expect.stringContaining('네트워크'), 'warning');
  });

  it('타임아웃 에러 시 타임아웃 메시지를 표시한다', () => {
    const error = createAxiosError({
      noResponse: true,
      code: 'ECONNABORTED',
    });

    const result = handleApiError(error);

    expect(result).toBe('요청 시간이 초과되었습니다. 다시 시도해 주세요.');
    expect(showGlobalToast).toHaveBeenCalledWith(expect.stringContaining('시간이 초과'), 'warning');
  });

  it('401 응답 시 toast 없이 메시지만 반환한다', () => {
    const error = createAxiosError({ status: 401 });

    const result = handleApiError(error);

    expect(result).toBe('인증이 필요합니다.');
    expect(showGlobalToast).not.toHaveBeenCalled();
  });

  it('서버 에러 코드 E00400 시 toast를 표시한다', () => {
    const error = createAxiosError({
      status: 400,
      data: { code: 'E00400', message: '잘못된 입력입니다.' },
    });

    const result = handleApiError(error);

    expect(result).toBe('잘못된 입력입니다.');
    expect(showGlobalToast).toHaveBeenCalledWith('잘못된 입력입니다.', 'error');
  });

  it('서버 에러 코드 E00412 시 로그아웃한다', () => {
    const error = createAxiosError({
      status: 412,
      data: { code: 'E00412' },
    });

    handleApiError(error);

    expect(mockLogout).toHaveBeenCalled();
    expect(showGlobalToast).toHaveBeenCalledWith(
      '로그인이 만료되었습니다. 다시 로그인해 주세요.',
      'error'
    );
  });

  it('서버 에러 코드 E00500 시 서버 오류 메시지를 표시한다', () => {
    const error = createAxiosError({
      status: 500,
      data: { code: 'E00500' },
    });

    const result = handleApiError(error);

    expect(result).toBe('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  });

  it('알 수 없는 서버 에러 코드 시 서버 메시지를 사용한다', () => {
    const error = createAxiosError({
      status: 422,
      data: { code: 'UNKNOWN_CODE', message: '커스텀 에러 메시지' },
    });

    const result = handleApiError(error);

    expect(result).toBe('커스텀 에러 메시지');
  });

  it('서버 메시지 없는 경우 HTTP 상태 코드 기본 메시지를 사용한다', () => {
    const error = createAxiosError({
      status: 503,
      data: {},
    });

    const result = handleApiError(error);

    expect(result).toBe('서비스를 이용할 수 없습니다.');
  });
});

describe('getApiErrorMessage', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'isAxiosError').mockImplementation((error) => {
      return (error as Record<string, unknown>)?.isAxiosError === true;
    });
  });

  it('일반 Error에서 메시지를 추출한다', () => {
    expect(getApiErrorMessage(new Error('테스트 에러'))).toBe('테스트 에러');
  });

  it('비 Error 객체에서 기본 메시지를 반환한다', () => {
    expect(getApiErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다.');
  });

  it('네트워크 에러 시 오프라인 메시지를 반환한다', () => {
    const error = createAxiosError({
      noResponse: true,
      code: 'ERR_NETWORK',
      message: 'Network Error',
    });
    expect(getApiErrorMessage(error)).toBe('네트워크에 연결할 수 없습니다.');
  });

  it('서버 응답 메시지가 있으면 해당 메시지를 반환한다', () => {
    const error = createAxiosError({
      status: 400,
      data: { message: '이름은 필수입니다.' },
    });
    expect(getApiErrorMessage(error)).toBe('이름은 필수입니다.');
  });

  it('서버 응답 메시지 없는 경우 HTTP 상태별 메시지를 반환한다', () => {
    const error = createAxiosError({
      status: 500,
      data: {},
    });
    expect(getApiErrorMessage(error)).toBe('서버 오류가 발생했습니다.');
  });
});

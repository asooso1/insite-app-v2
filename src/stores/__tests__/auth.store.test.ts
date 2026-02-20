/**
 * Auth Store 단위 테스트
 */
import { useAuthStore } from '../auth.store';

// refreshTokenApi mock
jest.mock('@/api/auth', () => ({
  refreshTokenApi: jest.fn(),
}));

// jwt mock
jest.mock('@/utils/jwt', () => ({
  isTokenExpired: jest.fn(),
}));

const { refreshTokenApi } = require('@/api/auth');
const { isTokenExpired } = require('@/utils/jwt');

const mockUser = {
  id: '1',
  userId: 'testuser',
  name: '테스트유저',
  roleId: 10,
  buildingCnt: 1,
  buildingAccountDTO: [{ buildingId: 'b1', buildingName: '테스트빌딩' }],
};

describe('auth.store', () => {
  beforeEach(() => {
    // 매 테스트마다 스토어 초기화
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      attendanceFlag: { login: false, logOut: false },
      isAuthenticated: false,
      isHydrated: false,
    });
    jest.clearAllMocks();
  });

  describe('setAuth', () => {
    it('사용자 정보, 토큰 설정 후 인증 상태가 true가 된다', () => {
      const { setAuth } = useAuthStore.getState();

      setAuth(mockUser, 'test-token', 'test-refresh');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.refreshToken).toBe('test-refresh');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('사용자 정보만 업데이트한다', () => {
      const updatedUser = { ...mockUser, name: '수정유저' };

      useAuthStore.getState().setUser(updatedUser);

      expect(useAuthStore.getState().user?.name).toBe('수정유저');
    });
  });

  describe('setToken', () => {
    it('토큰만 업데이트한다', () => {
      useAuthStore.getState().setToken('new-token');

      expect(useAuthStore.getState().token).toBe('new-token');
    });
  });

  describe('setAttendanceFlag', () => {
    it('출퇴근 플래그를 업데이트한다', () => {
      useAuthStore.getState().setAttendanceFlag({ login: true, logOut: false });

      expect(useAuthStore.getState().attendanceFlag).toEqual({ login: true, logOut: false });
    });
  });

  describe('logout', () => {
    it('모든 인증 상태를 초기화한다', () => {
      // 먼저 인증 상태 설정
      useAuthStore.getState().setAuth(mockUser, 'token', 'refresh');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // 로그아웃
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.attendanceFlag).toEqual({ login: false, logOut: false });
    });
  });

  describe('hydrate', () => {
    it('isHydrated를 true로 설정한다', () => {
      expect(useAuthStore.getState().isHydrated).toBe(false);

      useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().isHydrated).toBe(true);
    });
  });

  describe('checkAuth', () => {
    it('토큰이 없으면 미인증 상태로 설정한다', async () => {
      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('토큰이 유효하면 인증 상태를 유지한다', async () => {
      useAuthStore.setState({ token: 'valid-token', refreshToken: 'rt' });
      isTokenExpired.mockReturnValue(false);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('토큰이 만료되고 refresh token이 없으면 로그아웃한다', async () => {
      useAuthStore.setState({
        token: 'expired-token',
        refreshToken: null,
        user: mockUser,
        isAuthenticated: true,
      });
      isTokenExpired.mockReturnValue(true);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('토큰 갱신 성공 시 새 토큰으로 업데이트한다', async () => {
      useAuthStore.setState({
        token: 'expired-token',
        refreshToken: 'valid-refresh',
        isAuthenticated: false,
      });
      isTokenExpired.mockReturnValue(true);
      refreshTokenApi.mockResolvedValue({
        code: 'success',
        authToken: 'new-token',
        refreshToken: 'new-refresh',
      });

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.token).toBe('new-token');
      expect(state.refreshToken).toBe('new-refresh');
      expect(state.isAuthenticated).toBe(true);
    });

    it('토큰 갱신 실패 시 로그아웃한다', async () => {
      useAuthStore.setState({
        token: 'expired-token',
        refreshToken: 'invalid-refresh',
        user: mockUser,
        isAuthenticated: true,
      });
      isTokenExpired.mockReturnValue(true);
      refreshTokenApi.mockResolvedValue({ code: 'fail' });

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('API 에러 발생 시 로그아웃한다', async () => {
      useAuthStore.setState({
        token: 'expired-token',
        refreshToken: 'refresh',
        user: mockUser,
        isAuthenticated: true,
      });
      isTokenExpired.mockReturnValue(true);
      refreshTokenApi.mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});

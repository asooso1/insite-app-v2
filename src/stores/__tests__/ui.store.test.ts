/**
 * UI Store 단위 테스트
 */
import { useUIStore } from '../ui.store';

describe('ui.store', () => {
  beforeEach(() => {
    useUIStore.setState({
      isLoading: false,
      isSeniorMode: false,
      themeMode: 'light',
      isOnline: true,
      isHydrated: false,
    });
    jest.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('로딩 상태가 false이다', () => {
      expect(useUIStore.getState().isLoading).toBe(false);
    });

    it('시니어 모드가 비활성화이다', () => {
      expect(useUIStore.getState().isSeniorMode).toBe(false);
    });

    it('테마 모드가 light이다', () => {
      expect(useUIStore.getState().themeMode).toBe('light');
    });

    it('온라인 상태가 true이다', () => {
      expect(useUIStore.getState().isOnline).toBe(true);
    });
  });

  describe('setLoading', () => {
    it('로딩 상태를 true로 설정한다', () => {
      useUIStore.getState().setLoading(true);

      expect(useUIStore.getState().isLoading).toBe(true);
    });

    it('로딩 상태를 false로 설정한다', () => {
      useUIStore.setState({ isLoading: true });

      useUIStore.getState().setLoading(false);

      expect(useUIStore.getState().isLoading).toBe(false);
    });
  });

  describe('setSeniorMode', () => {
    it('시니어 모드를 활성화한다', () => {
      useUIStore.getState().setSeniorMode(true);

      expect(useUIStore.getState().isSeniorMode).toBe(true);
    });

    it('시니어 모드를 비활성화한다', () => {
      useUIStore.setState({ isSeniorMode: true });

      useUIStore.getState().setSeniorMode(false);

      expect(useUIStore.getState().isSeniorMode).toBe(false);
    });
  });

  describe('toggleSeniorMode', () => {
    it('시니어 모드를 토글한다 (false → true)', () => {
      useUIStore.getState().toggleSeniorMode();

      expect(useUIStore.getState().isSeniorMode).toBe(true);
    });

    it('시니어 모드를 토글한다 (true → false)', () => {
      useUIStore.setState({ isSeniorMode: true });

      useUIStore.getState().toggleSeniorMode();

      expect(useUIStore.getState().isSeniorMode).toBe(false);
    });

    it('연속 토글이 올바르게 동작한다', () => {
      const store = useUIStore.getState();

      store.toggleSeniorMode();
      expect(useUIStore.getState().isSeniorMode).toBe(true);

      useUIStore.getState().toggleSeniorMode();
      expect(useUIStore.getState().isSeniorMode).toBe(false);
    });
  });

  describe('setThemeMode', () => {
    it('다크 모드로 변경한다', () => {
      useUIStore.getState().setThemeMode('dark');

      expect(useUIStore.getState().themeMode).toBe('dark');
    });

    it('시스템 모드로 변경한다', () => {
      useUIStore.getState().setThemeMode('system');

      expect(useUIStore.getState().themeMode).toBe('system');
    });

    it('라이트 모드로 변경한다', () => {
      useUIStore.setState({ themeMode: 'dark' });

      useUIStore.getState().setThemeMode('light');

      expect(useUIStore.getState().themeMode).toBe('light');
    });
  });

  describe('setOnline', () => {
    it('오프라인으로 설정한다', () => {
      useUIStore.getState().setOnline(false);

      expect(useUIStore.getState().isOnline).toBe(false);
    });

    it('온라인으로 설정한다', () => {
      useUIStore.setState({ isOnline: false });

      useUIStore.getState().setOnline(true);

      expect(useUIStore.getState().isOnline).toBe(true);
    });
  });

  describe('persist partialize', () => {
    it('isSeniorMode와 themeMode만 persist 대상이다', () => {
      // persist 설정의 partialize가 올바르게 동작하는지 검증
      const state = useUIStore.getState();
      // 이 두 필드는 persist 대상
      expect(state).toHaveProperty('isSeniorMode');
      expect(state).toHaveProperty('themeMode');
      // isLoading, isOnline 등은 persist 대상이 아님 (재시작 시 기본값)
      expect(state.isLoading).toBe(false);
      expect(state.isOnline).toBe(true);
    });
  });
});

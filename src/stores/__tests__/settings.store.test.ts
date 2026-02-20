/**
 * Settings Store 단위 테스트
 */
import { useSettingsStore } from '../settings.store';

describe('settings.store', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      notifications: {
        pushEnabled: true,
        workOrderAlerts: true,
        patrolReminders: true,
        systemAlerts: true,
      },
      favoriteMenus: [],
      lastSyncedAt: null,
    });
    jest.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('기본 알림 설정이 모두 활성화되어 있다', () => {
      const { notifications } = useSettingsStore.getState();

      expect(notifications.pushEnabled).toBe(true);
      expect(notifications.workOrderAlerts).toBe(true);
      expect(notifications.patrolReminders).toBe(true);
      expect(notifications.systemAlerts).toBe(true);
    });

    it('즐겨찾기 메뉴가 비어있다', () => {
      expect(useSettingsStore.getState().favoriteMenus).toEqual([]);
    });

    it('마지막 동기화 시간이 null이다', () => {
      expect(useSettingsStore.getState().lastSyncedAt).toBeNull();
    });
  });

  describe('setNotificationSetting', () => {
    it('개별 알림 설정을 변경한다', () => {
      useSettingsStore.getState().setNotificationSetting('pushEnabled', false);

      expect(useSettingsStore.getState().notifications.pushEnabled).toBe(false);
    });

    it('다른 알림 설정은 유지된다', () => {
      useSettingsStore.getState().setNotificationSetting('pushEnabled', false);

      const { notifications } = useSettingsStore.getState();
      expect(notifications.workOrderAlerts).toBe(true);
      expect(notifications.patrolReminders).toBe(true);
      expect(notifications.systemAlerts).toBe(true);
    });

    it('여러 설정을 순차적으로 변경할 수 있다', () => {
      const { setNotificationSetting } = useSettingsStore.getState();

      setNotificationSetting('pushEnabled', false);
      setNotificationSetting('workOrderAlerts', false);

      const { notifications } = useSettingsStore.getState();
      expect(notifications.pushEnabled).toBe(false);
      expect(notifications.workOrderAlerts).toBe(false);
      expect(notifications.patrolReminders).toBe(true);
    });
  });

  describe('addFavoriteMenu', () => {
    it('즐겨찾기 메뉴를 추가한다', () => {
      useSettingsStore.getState().addFavoriteMenu('work');

      expect(useSettingsStore.getState().favoriteMenus).toEqual(['work']);
    });

    it('중복 메뉴는 추가하지 않는다', () => {
      const { addFavoriteMenu } = useSettingsStore.getState();

      addFavoriteMenu('work');
      addFavoriteMenu('work');

      expect(useSettingsStore.getState().favoriteMenus).toEqual(['work']);
    });

    it('여러 메뉴를 추가할 수 있다', () => {
      const { addFavoriteMenu } = useSettingsStore.getState();

      addFavoriteMenu('work');
      addFavoriteMenu('patrol');
      addFavoriteMenu('claim');

      expect(useSettingsStore.getState().favoriteMenus).toEqual(['work', 'patrol', 'claim']);
    });
  });

  describe('removeFavoriteMenu', () => {
    it('즐겨찾기 메뉴를 제거한다', () => {
      useSettingsStore.setState({ favoriteMenus: ['work', 'patrol'] });

      useSettingsStore.getState().removeFavoriteMenu('work');

      expect(useSettingsStore.getState().favoriteMenus).toEqual(['patrol']);
    });

    it('없는 메뉴를 제거해도 에러가 발생하지 않는다', () => {
      useSettingsStore.setState({ favoriteMenus: ['work'] });

      useSettingsStore.getState().removeFavoriteMenu('nonexistent');

      expect(useSettingsStore.getState().favoriteMenus).toEqual(['work']);
    });
  });

  describe('setLastSyncedAt', () => {
    it('마지막 동기화 시간을 설정한다', () => {
      useSettingsStore.getState().setLastSyncedAt('2026-02-20T10:00:00Z');

      expect(useSettingsStore.getState().lastSyncedAt).toBe('2026-02-20T10:00:00Z');
    });
  });

  describe('resetSettings', () => {
    it('알림 설정을 기본값으로 초기화한다', () => {
      const store = useSettingsStore.getState();
      store.setNotificationSetting('pushEnabled', false);
      store.addFavoriteMenu('work');

      useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.notifications.pushEnabled).toBe(true);
      expect(state.favoriteMenus).toEqual([]);
    });

    it('lastSyncedAt는 초기화하지 않는다', () => {
      useSettingsStore.setState({ lastSyncedAt: '2026-02-20T10:00:00Z' });

      useSettingsStore.getState().resetSettings();

      expect(useSettingsStore.getState().lastSyncedAt).toBe('2026-02-20T10:00:00Z');
    });
  });
});

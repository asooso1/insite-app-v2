import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { APP_NAME, APP_VERSION } from '@/constants/config';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);
  const toggleSeniorMode = useUIStore((state) => state.toggleSeniorMode);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 정보</Text>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name ?? '사용자'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
              <Text style={styles.userSite}>{user?.siteName ?? ''}</Text>
            </View>
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>화면 설정</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>시니어 모드</Text>
              <Text style={styles.settingDescription}>글씨와 버튼을 크게 표시합니다</Text>
            </View>
            <Switch
              value={isSeniorMode}
              onValueChange={toggleSeniorMode}
              trackColor={{ false: '#C9C9C9', true: '#0064FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>푸시 알림</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>알림 소리</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>앱 이름</Text>
            <Text style={styles.infoValue}>{APP_NAME}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>버전</Text>
            <Text style={styles.infoValue}>{APP_VERSION}</Text>
          </View>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>이용약관</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>개인정보처리방침</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>오픈소스 라이선스</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E6E',
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0064FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6E6E6E',
    marginBottom: 2,
  },
  userSite: {
    fontSize: 14,
    color: '#0064FF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6E6E6E',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  menuItemArrow: {
    fontSize: 16,
    color: '#C9C9C9',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  infoLabel: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  infoValue: {
    fontSize: 16,
    color: '#6E6E6E',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#C9252D',
  },
  bottomPadding: {
    height: 32,
  },
});

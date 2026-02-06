import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

type TabIconProps = {
  name: string;
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{name}</Text>
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#0064FF',
        tabBarInactiveTintColor: '#8E8E8E',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="(tabs)/home"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/my-work"
        options={{
          title: '내 작업',
          tabBarIcon: ({ focused }) => <TabIcon name="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/scan"
        options={{
          title: '스캔',
          tabBarIcon: ({ focused }) => <TabIcon name="📱" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => <TabIcon name="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/settings"
        options={{
          title: '설정',
          tabBarIcon: ({ focused }) => <TabIcon name="⚙️" focused={focused} />,
        }}
      />
      {/* Hidden screens - not in tab bar */}
      <Tabs.Screen
        name="work"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="patrol"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

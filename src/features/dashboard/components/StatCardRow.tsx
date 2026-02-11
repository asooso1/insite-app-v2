/**
 * StatCardRow 컴포넌트
 *
 * 2026 Modern UI - 통계 카드 행 (정적 버전)
 * Lucide Icons 지원
 */
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon, type IconName } from '@/components/icons';

interface StatItem {
  /** 라벨 */
  label: string;
  /** 수치 */
  value: number;
  /** 아이콘 이름 (IconName) */
  icon: IconName;
  /** 그라디언트 색상 */
  gradient: readonly [string, string];
  /** 텍스트 색상 */
  textColor?: string;
}

interface StatCardRowProps {
  /** 통계 아이템 목록 */
  items: StatItem[];
  /** 애니메이션 지연 시간 (미사용 - 호환성 유지) */
  animationDelay?: number;
}

/**
 * 통계 카드 행 (정적 버전)
 */
export function StatCardRow({ items }: StatCardRowProps) {
  return (
    <XStack gap="$3" paddingHorizontal="$4">
      {items.map((item) => (
        <StatCard key={item.label} item={item} />
      ))}
    </XStack>
  );
}

interface StatCardProps {
  item: StatItem;
}

function StatCard({ item }: StatCardProps) {
  return (
    <View style={styles.cardContainer}>
      <YStack
        flex={1}
        backgroundColor="$white"
        borderRadius="$4"
        padding="$3"
        alignItems="center"
        justifyContent="center"
        gap="$2"
        borderWidth={1}
        borderColor="rgba(226, 232, 240, 0.8)"
      >
        {/* 아이콘 */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <AppIcon name={item.icon} size="sm" color="$white" />
          </LinearGradient>
        </View>

        {/* 숫자 */}
        <Text
          fontSize={28}
          fontWeight="800"
          style={{ color: item.textColor || item.gradient[0] }}
          letterSpacing={-1}
        >
          {item.value}
        </Text>

        {/* 라벨 */}
        <Text fontSize={12} color="$gray500" fontWeight="500">
          {item.label}
        </Text>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StatCardRow;

/**
 * EmptyState 컴포넌트
 */
import React from 'react';
import { styled, YStack, Text } from 'tamagui';
import { Button } from './Button';

const EmptyContainer = styled(YStack, {
  name: 'EmptyState',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  gap: 16,

  variants: {
    fullHeight: {
      true: { flex: 1 },
    },
  } as const,
});

const IconContainer = styled(YStack, {
  name: 'EmptyStateIcon',
  width: 80,
  height: 80,
  borderRadius: 9999,
  backgroundColor: '$gray100',
  alignItems: 'center',
  justifyContent: 'center',
});

const IconText = styled(Text, {
  name: 'EmptyStateIconText',
  fontSize: 32,
});

const Title = styled(Text, {
  name: 'EmptyStateTitle',
  fontSize: 18,
  fontWeight: '600',
  color: '$gray900',
  textAlign: 'center',
});

const Description = styled(Text, {
  name: 'EmptyStateDescription',
  fontSize: 14,
  color: '$gray500',
  textAlign: 'center',
  maxWidth: 280,
  lineHeight: 20,
});

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  fullHeight?: boolean;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  fullHeight = false,
}: EmptyStateProps) {
  return (
    <EmptyContainer fullHeight={fullHeight}>
      <IconContainer>
        <IconText>{icon}</IconText>
      </IconContainer>

      <YStack alignItems="center" gap={8}>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </YStack>

      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </EmptyContainer>
  );
}

export function NoSearchResults({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon="🔍"
      title="검색 결과 없음"
      description={
        query
          ? `"${query}"에 대한 검색 결과가 없습니다.`
          : '검색 결과가 없습니다.'
      }
      actionLabel={onClear ? '검색 초기화' : undefined}
      onAction={onClear}
    />
  );
}

export function NoData({
  title = '데이터 없음',
  description = '표시할 데이터가 없습니다.',
  onRefresh,
}: {
  title?: string;
  description?: string;
  onRefresh?: () => void;
}) {
  return (
    <EmptyState
      icon="📋"
      title={title}
      description={description}
      actionLabel={onRefresh ? '새로고침' : undefined}
      onAction={onRefresh}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="📡"
      title="연결 오류"
      description="네트워크 연결을 확인해주세요."
      actionLabel={onRetry ? '다시 시도' : undefined}
      onAction={onRetry}
    />
  );
}

export type { EmptyStateProps };
export default EmptyState;

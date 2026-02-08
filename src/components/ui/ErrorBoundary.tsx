/**
 * ErrorBoundary 컴포넌트
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { styled, YStack, Text } from 'tamagui';
import { Button } from './Button';

const ErrorContainer = styled(YStack, {
  name: 'ErrorBoundary',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  backgroundColor: '$white',
  gap: 16,
});

const ErrorIcon = styled(YStack, {
  width: 80,
  height: 80,
  borderRadius: 9999,
  backgroundColor: '$errorLight',
  alignItems: 'center',
  justifyContent: 'center',
});

const ErrorIconText = styled(Text, {
  fontSize: 32,
});

const ErrorTitle = styled(Text, {
  fontSize: 20,
  fontWeight: '700',
  color: '$gray900',
  textAlign: 'center',
});

const ErrorMessage = styled(Text, {
  fontSize: 14,
  color: '$gray500',
  textAlign: 'center',
  maxWidth: 300,
  lineHeight: 20,
});

const ErrorDetails = styled(Text, {
  fontSize: 12,
  color: '$error',
  backgroundColor: '$gray100',
  padding: 12,
  borderRadius: 8,
  maxWidth: '100%',
  overflow: 'hidden',
});

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorIcon>
            <ErrorIconText>⚠️</ErrorIconText>
          </ErrorIcon>

          <YStack alignItems="center" gap={8}>
            <ErrorTitle>문제가 발생했습니다</ErrorTitle>
            <ErrorMessage>
              예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
            </ErrorMessage>
          </YStack>

          {__DEV__ && this.state.error && (
            <ErrorDetails numberOfLines={5}>
              {this.state.error.message}
            </ErrorDetails>
          )}

          <Button variant="primary" onPress={this.handleReset}>
            다시 시도
          </Button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export type { ErrorBoundaryProps };
export default ErrorBoundary;

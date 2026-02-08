/**
 * Toast 컴포넌트
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { styled, XStack, Text, YStack } from 'tamagui';

const ToastContainer = styled(XStack, {
  name: 'ToastContainer',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  gap: 8,
  minWidth: 200,
  maxWidth: '90%',

  variants: {
    variant: {
      default: { backgroundColor: '$gray800' },
      success: { backgroundColor: '$success' },
      error: { backgroundColor: '$error' },
      warning: { backgroundColor: '$warning' },
      info: { backgroundColor: '$info' },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
  },
});

const ToastText = styled(Text, {
  name: 'ToastText',
  fontSize: 14,
  fontWeight: '500',
  flex: 1,

  variants: {
    variant: {
      default: { color: '$white' },
      success: { color: '$white' },
      error: { color: '$white' },
      warning: { color: '$gray900' },
      info: { color: '$white' },
    },
  } as const,
});

const ToastIcon = styled(Text, {
  name: 'ToastIcon',
  fontSize: 16,

  variants: {
    variant: {
      default: { color: '$white' },
      success: { color: '$white' },
      error: { color: '$white' },
      warning: { color: '$gray900' },
      info: { color: '$white' },
    },
  } as const,
});

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextType {
  show: (message: string, options?: { variant?: ToastVariant; duration?: number }) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const iconMap: Record<ToastVariant, string> = {
  default: 'ℹ️',
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback(
    (message: string, options: { variant?: ToastVariant; duration?: number } = {}) => {
      const { variant = 'default', duration = 3000 } = options;
      const id = Date.now().toString();

      setToasts((prev) => [...prev, { id, message, variant, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const success = useCallback(
    (message: string, duration = 3000) => show(message, { variant: 'success', duration }),
    [show]
  );

  const error = useCallback(
    (message: string, duration = 3000) => show(message, { variant: 'error', duration }),
    [show]
  );

  const warning = useCallback(
    (message: string, duration = 3000) => show(message, { variant: 'warning', duration }),
    [show]
  );

  const info = useCallback(
    (message: string, duration = 3000) => show(message, { variant: 'info', duration }),
    [show]
  );

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <YStack
        position="absolute"
        bottom={100}
        left={0}
        right={0}
        alignItems="center"
        gap={8}
        pointerEvents="none"
      >
        {toasts.map((toast) => (
          <ToastContainer key={toast.id} variant={toast.variant}>
            <ToastIcon variant={toast.variant}>{iconMap[toast.variant]}</ToastIcon>
            <ToastText variant={toast.variant}>{toast.message}</ToastText>
          </ToastContainer>
        ))}
      </YStack>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export type { ToastVariant, ToastData };
export default ToastProvider;

/**
 * Modal 컴포넌트
 */
import React from 'react';
import { Modal as RNModal, Pressable } from 'react-native';
import { styled, YStack, XStack, Text } from 'tamagui';
import { Button } from './Button';

const ModalOverlay = styled(YStack, {
  name: 'ModalOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
});

const ModalContent = styled(YStack, {
  name: 'ModalContent',
  backgroundColor: '$white',
  borderRadius: 12,
  padding: 20,
  maxWidth: 400,
  width: '100%',
  maxHeight: '80%',

  variants: {
    size: {
      sm: { maxWidth: 320, padding: 16 },
      md: { maxWidth: 400, padding: 20 },
      lg: { maxWidth: 500, padding: 24 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

export const ModalHeader = styled(XStack, {
  name: 'ModalHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

export const ModalTitle = styled(Text, {
  name: 'ModalTitle',
  fontSize: 20,
  fontWeight: '700',
  color: '$gray900',
});

export const ModalBody = styled(YStack, {
  name: 'ModalBody',
  gap: 12,
});

export const ModalFooter = styled(XStack, {
  name: 'ModalFooter',
  justifyContent: 'flex-end',
  gap: 12,
  marginTop: 20,
});

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  closeOnOverlayPress?: boolean;
  footer?: React.ReactNode;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayPress = true,
  footer,
}: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={closeOnOverlayPress ? onClose : undefined}>
        <ModalOverlay>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <ModalContent size={size}>
              {(title || showCloseButton) && (
                <ModalHeader>
                  {title && <ModalTitle>{title}</ModalTitle>}
                  {showCloseButton && (
                    <Button variant="ghost" size="sm" onPress={onClose}>
                      ✕
                    </Button>
                  )}
                </ModalHeader>
              )}
              <ModalBody>{children}</ModalBody>
              {footer && <ModalFooter>{footer}</ModalFooter>}
            </ModalContent>
          </Pressable>
        </ModalOverlay>
      </Pressable>
    </RNModal>
  );
}

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
      closeOnOverlayPress={false}
      footer={
        <>
          <Button variant="ghost" onPress={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onPress={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <Text color="$gray600" fontSize={16} lineHeight={24}>
        {message}
      </Text>
    </Modal>
  );
}

export type { ModalProps, ConfirmDialogProps };
export default Modal;

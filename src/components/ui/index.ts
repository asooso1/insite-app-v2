/**
 * UI 컴포넌트 통합 내보내기
 *
 * Sprint 1.3 - 디자인 시스템 컴포넌트
 */

// 기본 컴포넌트
export { Button, IconButton, type ButtonProps, type IconButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardBadge,
  CardBadgeText,
  type CardProps,
} from './Card';

// 표시 컴포넌트
export { Badge, type BadgeProps } from './Badge';
export { Avatar, AvatarImage, AvatarFallback, type AvatarProps } from './Avatar';
export { Divider, type DividerProps } from './Divider';

// 폼 컴포넌트
export {
  TextField,
  PasswordField,
  SearchField,
  TextFieldLabel,
  TextFieldHelper,
  type TextFieldProps,
  type PasswordFieldProps,
  type SearchFieldProps,
} from './TextField';
export { Select, type SelectProps, type SelectOption } from './Select';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Switch, type SwitchProps } from './Switch';
export { DatePicker, type DatePickerProps } from './DatePicker';

// 피드백 컴포넌트
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ConfirmDialog,
  type ModalProps,
  type ConfirmDialogProps,
} from './Modal';
export {
  ToastProvider,
  useToast,
  type ToastVariant,
  type ToastData,
} from './Toast';
export {
  LoadingOverlay,
  LoadingSpinner,
  type LoadingOverlayProps,
  type LoadingSpinnerProps,
} from './LoadingOverlay';

// 상태 컴포넌트
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  type SkeletonProps,
} from './Skeleton';
export {
  EmptyState,
  NoSearchResults,
  NoData,
  NetworkError,
  type EmptyStateProps,
} from './EmptyState';
export {
  ErrorBoundary,
  withErrorBoundary,
  type ErrorBoundaryProps,
} from './ErrorBoundary';

// 2026 Modern UI 컴포넌트
export { GradientHeader } from './GradientHeader';
export { GlassCard } from './GlassCard';
export { QuickStatCard } from './QuickStatCard';
export { SectionHeader } from './SectionHeader';
export { ProgressBar } from './ProgressBar';
export { FilterPill } from './FilterPill';
export { GlassSearchInput } from './GlassSearchInput';

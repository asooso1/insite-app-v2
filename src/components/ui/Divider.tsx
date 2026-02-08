/**
 * Divider 컴포넌트
 *
 * 구분선 컴포넌트
 */
import { styled, GetProps, YStack } from 'tamagui';

/**
 * 구분선
 */
export const Divider = styled(YStack, {
  name: 'Divider',
  backgroundColor: '$gray200',
  flexShrink: 0,

  variants: {
    orientation: {
      horizontal: {
        height: 1,
        width: '100%',
      },
      vertical: {
        width: 1,
        height: '100%',
      },
    },
    thickness: {
      thin: {},
      medium: {},
      thick: {},
    },
    color: {
      default: { backgroundColor: '$gray200' },
      light: { backgroundColor: '$gray100' },
      dark: { backgroundColor: '$gray400' },
    },
    spacing: {
      none: {},
      sm: { marginVertical: 8 },
      md: { marginVertical: 16 },
      lg: { marginVertical: 24 },
    },
  } as const,

  defaultVariants: {
    orientation: 'horizontal',
    thickness: 'thin',
    color: 'default',
    spacing: 'none',
  },
});

export type DividerProps = GetProps<typeof Divider>;

export default Divider;

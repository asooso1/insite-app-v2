/**
 * Badge 컴포넌트
 *
 * 상태 표시, 알림 카운트 등에 사용
 */
import { styled, GetProps, Text } from 'tamagui';

/**
 * 뱃지 컴포넌트
 */
export const Badge = styled(Text, {
  name: 'Badge',

  // 기본 스타일
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$full',
  fontSize: 12,
  fontWeight: '600',
  textAlign: 'center',
  overflow: 'hidden',

  // 변형 (Variants)
  variants: {
    // 색상 변형
    variant: {
      default: {
        backgroundColor: '$gray200',
        color: '$gray700',
      },
      primary: {
        backgroundColor: '$primary',
        color: '$white',
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$white',
      },
      success: {
        backgroundColor: '$success',
        color: '$white',
      },
      warning: {
        backgroundColor: '$warning',
        color: '$gray900',
      },
      error: {
        backgroundColor: '$error',
        color: '$white',
      },
      info: {
        backgroundColor: '$info',
        color: '$white',
      },
      // 아웃라인 스타일
      outlinePrimary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$primary',
        color: '$primary',
      },
      outlineSuccess: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$success',
        color: '$success',
      },
      outlineError: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$error',
        color: '$error',
      },
    },

    // 크기
    size: {
      sm: {
        paddingHorizontal: '$1',
        paddingVertical: 2,
        fontSize: 10,
      },
      md: {
        paddingHorizontal: '$2',
        paddingVertical: '$1',
        fontSize: 12,
      },
      lg: {
        paddingHorizontal: '$3',
        paddingVertical: '$1',
        fontSize: 14,
      },
    },

    // 모양
    shape: {
      rounded: {
        borderRadius: '$full',
      },
      square: {
        borderRadius: '$1',
      },
    },

    // 점(dot) 스타일
    dot: {
      true: {
        width: 8,
        height: 8,
        padding: 0,
        borderRadius: '$full',
      },
    },
  } as const,

  // 기본값
  defaultVariants: {
    variant: 'default',
    size: 'md',
    shape: 'rounded',
  },
});

export type BadgeProps = GetProps<typeof Badge>;

export default Badge;

/**
 * Card 컴포넌트
 *
 * 2026 Modern UI - Glassmorphism 기반 카드
 * 플로팅 효과와 부드러운 그림자로 깊이감 표현
 */
import { styled, GetProps, YStack, XStack, Text } from 'tamagui';

/**
 * 카드 컨테이너 - Glassmorphism 스타일
 */
export const Card = styled(YStack, {
  name: 'Card',

  // 기본 스타일 - 모던 플로팅 카드
  backgroundColor: '$surface',
  borderRadius: '$4', // 16px
  padding: '$5', // 20px
  borderWidth: 1,
  borderColor: '$borderColorSubtle',

  // 모던 그림자 - 브랜드 컬러 기반
  shadowColor: '#0066CC',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 4,

  // 변형 (Variants)
  variants: {
    // 스타일 변형
    variant: {
      // 기본 플로팅 카드
      elevated: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 0,
      },
      // 아웃라인 카드
      outlined: {
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 1,
        borderColor: '$borderColor',
        backgroundColor: '$surface',
      },
      // 채워진 카드 (서브틀)
      filled: {
        backgroundColor: '$backgroundStrong',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
      // Glassmorphism 카드
      glass: {
        backgroundColor: '$backgroundGlass',
        borderWidth: 1,
        borderColor: '$borderColorGlass',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
        elevation: 10,
      },
      // 강조 카드 (브랜드 컬러 보더)
      accent: {
        borderWidth: 2,
        borderColor: '$primary',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
      },
      // 성공 상태 카드
      success: {
        backgroundColor: '$statusSuccessBackground',
        borderWidth: 1,
        borderColor: '$successLight',
        shadowOpacity: 0,
        elevation: 0,
      },
      // 경고 상태 카드
      warning: {
        backgroundColor: '$statusWarningBackground',
        borderWidth: 1,
        borderColor: '$warningLight',
        shadowOpacity: 0,
        elevation: 0,
      },
      // 오류 상태 카드
      error: {
        backgroundColor: '$statusErrorBackground',
        borderWidth: 1,
        borderColor: '$errorLight',
        shadowOpacity: 0,
        elevation: 0,
      },
    },

    // 크기
    size: {
      sm: {
        padding: '$3', // 12px
        borderRadius: '$3', // 12px
      },
      md: {
        padding: '$5', // 20px
        borderRadius: '$4', // 16px
      },
      lg: {
        padding: '$6', // 24px
        borderRadius: '$5', // 20px
      },
      xl: {
        padding: '$8', // 32px
        borderRadius: '$6', // 24px
      },
    },

    // 프레스 가능 (인터랙티브)
    pressable: {
      true: {
        cursor: 'pointer',
        pressStyle: {
          opacity: 0.95,
          scale: 0.98,
          shadowOpacity: 0.08,
        },
        hoverStyle: {
          borderColor: '$borderColorHover',
          shadowOpacity: 0.16,
          shadowRadius: 20,
        },
      },
    },

    // 풀 너비
    fullWidth: {
      true: {
        width: '100%',
      },
    },

    // 플로팅 효과 강화
    floating: {
      true: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 12,
      },
    },

    // 글로우 효과
    glow: {
      true: {
        shadowColor: '#00A3FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
    },
  } as const,

  // 기본값
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});

/**
 * 카드 헤더
 */
export const CardHeader = styled(XStack, {
  name: 'CardHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$4',
  gap: '$3',
});

/**
 * 카드 제목 - 볼드한 타이포그래피
 */
export const CardTitle = styled(Text, {
  name: 'CardTitle',
  fontSize: 20,
  fontWeight: '700',
  color: '$color',
  letterSpacing: -0.5,

  variants: {
    size: {
      sm: {
        fontSize: 16,
        fontWeight: '600',
      },
      md: {
        fontSize: 20,
        fontWeight: '700',
      },
      lg: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.75,
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

/**
 * 카드 부제목/설명
 */
export const CardDescription = styled(Text, {
  name: 'CardDescription',
  fontSize: 14,
  color: '$colorSecondary',
  marginTop: '$1',
  lineHeight: 20,

  variants: {
    size: {
      sm: {
        fontSize: 12,
        lineHeight: 16,
      },
      md: {
        fontSize: 14,
        lineHeight: 20,
      },
      lg: {
        fontSize: 16,
        lineHeight: 24,
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

/**
 * 카드 콘텐츠
 */
export const CardContent = styled(YStack, {
  name: 'CardContent',
  gap: '$3',
});

/**
 * 카드 푸터
 */
export const CardFooter = styled(XStack, {
  name: 'CardFooter',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: '$5',
  gap: '$3',
  paddingTop: '$4',
  borderTopWidth: 1,
  borderTopColor: '$borderColorSubtle',

  variants: {
    noBorder: {
      true: {
        borderTopWidth: 0,
        paddingTop: 0,
      },
    },
    spaceBetween: {
      true: {
        justifyContent: 'space-between',
      },
    },
  } as const,
});

/**
 * 카드 이미지 영역
 */
export const CardImage = styled(YStack, {
  name: 'CardImage',
  marginHorizontal: -20,
  marginTop: -20,
  marginBottom: '$4',
  borderTopLeftRadius: '$4',
  borderTopRightRadius: '$4',
  overflow: 'hidden',
  backgroundColor: '$backgroundStrong',
  minHeight: 160,
});

/**
 * 카드 배지/라벨
 */
export const CardBadge = styled(XStack, {
  name: 'CardBadge',
  position: 'absolute',
  top: '$3',
  right: '$3',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: '$full',
  backgroundColor: '$primary',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
      },
      secondary: {
        backgroundColor: '$secondary',
      },
      success: {
        backgroundColor: '$success',
      },
      warning: {
        backgroundColor: '$warning',
      },
      error: {
        backgroundColor: '$error',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
  },
});

export const CardBadgeText = styled(Text, {
  name: 'CardBadgeText',
  fontSize: 12,
  fontWeight: '600',
  color: '$colorInverse',
});

export type CardProps = GetProps<typeof Card>;

export default Card;

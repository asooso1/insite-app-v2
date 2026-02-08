/**
 * Card 컴포넌트
 *
 * Tamagui 기반 카드 컴포넌트
 */
import { styled, GetProps, YStack, XStack, Text } from 'tamagui';

/**
 * 카드 컨테이너
 */
export const Card = styled(YStack, {
  name: 'Card',

  // 기본 스타일
  backgroundColor: '$white',
  borderRadius: '$3',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$gray200',

  // 그림자
  shadowColor: '$black',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,

  // 변형 (Variants)
  variants: {
    // 변형 스타일
    variant: {
      elevated: {
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 0,
      },
      outlined: {
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 1,
        borderColor: '$gray300',
      },
      filled: {
        backgroundColor: '$gray50',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
    },

    // 크기
    size: {
      sm: {
        padding: '$3',
        borderRadius: '$2',
      },
      md: {
        padding: '$4',
        borderRadius: '$3',
      },
      lg: {
        padding: '$5',
        borderRadius: '$4',
      },
    },

    // 프레스 가능
    pressable: {
      true: {
        cursor: 'pointer',
        pressStyle: {
          opacity: 0.9,
          scale: 0.99,
        },
        hoverStyle: {
          borderColor: '$gray300',
        },
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
  marginBottom: '$3',
});

/**
 * 카드 제목
 */
export const CardTitle = styled(Text, {
  name: 'CardTitle',
  fontSize: 18,
  fontWeight: '600',
  color: '$gray900',
});

/**
 * 카드 설명
 */
export const CardDescription = styled(Text, {
  name: 'CardDescription',
  fontSize: 14,
  color: '$gray500',
  marginTop: '$1',
});

/**
 * 카드 콘텐츠
 */
export const CardContent = styled(YStack, {
  name: 'CardContent',
  gap: '$2',
});

/**
 * 카드 푸터
 */
export const CardFooter = styled(XStack, {
  name: 'CardFooter',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: '$4',
  gap: '$2',
});

export type CardProps = GetProps<typeof Card>;

export default Card;

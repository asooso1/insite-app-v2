/**
 * Avatar 컴포넌트
 *
 * 사용자 프로필 이미지 표시
 */
import { styled, GetProps, YStack, Text, Image } from 'tamagui';

/**
 * 아바타 컨테이너
 */
export const Avatar = styled(YStack, {
  name: 'Avatar',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$gray200',
  borderRadius: 9999,
  overflow: 'hidden',

  variants: {
    size: {
      xs: { width: 24, height: 24 },
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 48, height: 48 },
      xl: { width: 64, height: 64 },
      xxl: { width: 96, height: 96 },
    },
    shape: {
      circle: { borderRadius: 9999 },
      square: { borderRadius: 8 },
    },
    bordered: {
      true: {
        borderWidth: 2,
        borderColor: '$white',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
});

/**
 * 아바타 이미지
 */
export const AvatarImage = styled(Image, {
  name: 'AvatarImage',
  width: '100%',
  height: '100%',
});

/**
 * 아바타 폴백 (이미지 없을 때)
 */
export const AvatarFallback = styled(Text, {
  name: 'AvatarFallback',
  color: '$gray600',
  fontWeight: '600',

  variants: {
    size: {
      xs: { fontSize: 10 },
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 16 },
      xl: { fontSize: 20 },
      xxl: { fontSize: 32 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

export type AvatarProps = GetProps<typeof Avatar>;

export default Avatar;

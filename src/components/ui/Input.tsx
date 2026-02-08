/**
 * Input 컴포넌트
 *
 * Tamagui 기반 입력 필드 컴포넌트
 * 시니어 모드 지원
 */
import { styled, GetProps } from 'tamagui';
import { Input as TamaguiInput } from 'tamagui';

/**
 * 기본 입력 필드 스타일
 */
export const Input = styled(TamaguiInput, {
  name: 'Input',

  // 기본 스타일
  borderWidth: 1,
  borderColor: '$gray300',
  borderRadius: '$2',
  backgroundColor: '$white',
  paddingHorizontal: '$4',
  fontSize: 16,
  color: '$gray900',
  placeholderTextColor: '$gray400',

  // 포커스 스타일
  focusStyle: {
    borderColor: '$primary',
    outlineWidth: 0,
  },

  // 호버 스타일
  hoverStyle: {
    borderColor: '$gray400',
  },

  // 비활성화 스타일
  disabledStyle: {
    backgroundColor: '$gray100',
    opacity: 0.7,
    cursor: 'not-allowed',
  },

  // 변형 (Variants)
  variants: {
    // 크기
    size: {
      sm: {
        height: 36,
        fontSize: 14,
        paddingHorizontal: '$3',
      },
      md: {
        height: 44,
        fontSize: 16,
        paddingHorizontal: '$4',
      },
      lg: {
        height: 52,
        fontSize: 18,
        paddingHorizontal: '$5',
      },
      // 시니어 모드 크기
      senior: {
        height: 53,
        fontSize: 19,
        paddingHorizontal: '$5',
      },
    },

    // 상태
    status: {
      default: {},
      error: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
        },
      },
      success: {
        borderColor: '$success',
        focusStyle: {
          borderColor: '$success',
        },
      },
    },

    // 전체 너비
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  // 기본값
  defaultVariants: {
    size: 'md',
    status: 'default',
  },
});

export type InputProps = GetProps<typeof Input>;

export default Input;

/**
 * Input 컴포넌트
 *
 * 2026 Modern UI - 플로팅 라벨 + 모던 입력 필드
 * 부드러운 포커스 애니메이션과 검증 피드백
 */
import { styled, GetProps } from 'tamagui';
import { Input as TamaguiInput } from 'tamagui';

/**
 * 기본 입력 필드 스타일 - 모던 UI
 */
export const Input = styled(TamaguiInput, {
  name: 'Input',

  // 기본 스타일 - 클린하고 모던한 디자인
  borderWidth: 1.5,
  borderColor: '$borderColor',
  borderRadius: '$3', // 12px
  backgroundColor: '$surface',
  paddingHorizontal: '$4',
  fontSize: 16,
  color: '$color',
  placeholderTextColor: '$colorPlaceholder',

  // 포커스 스타일 - 브랜드 컬러 강조
  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
    outlineWidth: 0,
    // 서브틀한 글로우 효과
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  // 호버 스타일
  hoverStyle: {
    borderColor: '$borderColorHover',
  },

  // 비활성화 스타일
  disabledStyle: {
    backgroundColor: '$backgroundStrong',
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  // 변형 (Variants)
  variants: {
    // 크기
    size: {
      sm: {
        height: 40,
        fontSize: 14,
        paddingHorizontal: '$3',
        borderRadius: '$2',
      },
      md: {
        height: 48,
        fontSize: 16,
        paddingHorizontal: '$4',
        borderRadius: '$3',
      },
      lg: {
        height: 56,
        fontSize: 18,
        paddingHorizontal: '$5',
        borderRadius: '$4',
      },
      // 시니어 모드 크기
      senior: {
        height: 56,
        fontSize: 19,
        paddingHorizontal: '$5',
        borderRadius: '$4',
      },
    },

    // 상태
    status: {
      default: {},
      error: {
        borderColor: '$error',
        borderWidth: 2,
        focusStyle: {
          borderColor: '$error',
          shadowColor: '#EF4444',
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
      },
      success: {
        borderColor: '$success',
        borderWidth: 2,
        focusStyle: {
          borderColor: '$success',
          shadowColor: '#00C853',
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
      },
      warning: {
        borderColor: '$warning',
        borderWidth: 2,
        focusStyle: {
          borderColor: '$warning',
          shadowColor: '#FFB300',
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
      },
    },

    // 변형 스타일
    variant: {
      // 기본 (아웃라인)
      outlined: {},
      // 채워진 스타일
      filled: {
        backgroundColor: '$backgroundStrong',
        borderWidth: 0,
        focusStyle: {
          borderWidth: 2,
          borderColor: '$primary',
          backgroundColor: '$surface',
        },
      },
      // 언더라인 스타일
      underlined: {
        borderWidth: 0,
        borderBottomWidth: 2,
        borderRadius: 0,
        borderBottomColor: '$borderColor',
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        focusStyle: {
          borderBottomColor: '$primary',
          outlineWidth: 0,
        },
      },
      // Glass 스타일
      glass: {
        backgroundColor: '$backgroundGlass',
        borderColor: '$borderColorGlass',
        focusStyle: {
          borderColor: '$primary',
          backgroundColor: '$backgroundGlassStrong',
        },
      },
    },

    // 전체 너비
    fullWidth: {
      true: {
        width: '100%',
      },
    },

    // 아이콘 패딩
    hasLeftIcon: {
      true: {
        paddingLeft: 44,
      },
    },
    hasRightIcon: {
      true: {
        paddingRight: 44,
      },
    },
  } as const,

  // 기본값
  defaultVariants: {
    size: 'md',
    status: 'default',
    variant: 'outlined',
  },
});

export type InputProps = GetProps<typeof Input>;

export default Input;

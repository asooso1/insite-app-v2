---
description: "시니어 모드 적용 여부 검증"
argument-hint: "[파일 또는 디렉토리 경로]"
---
# 시니어 모드 적용 검증

현재 디렉토리 또는 지정된 파일의 시니어 모드 적용 여부를 검증합니다.

## 검증 항목

1. **필수 import**
   - [ ] `useSeniorStyles` 또는 `useSeniorMode` 훅
   - [ ] 시니어 컴포넌트 (SeniorButton, SeniorCard 등)

2. **조건부 렌더링**
   - [ ] `isSeniorMode` 사용 여부
   - [ ] 시니어/일반 모드 분기 처리

3. **폰트 크기**
   - [ ] 시니어 모드에서 최소 18px 이상

4. **터치 영역**
   - [ ] 시니어 모드에서 버튼/터치 영역 56px 이상

5. **아이콘**
   - [ ] 이모지 대신 AppIcon 사용
   - [ ] 아이콘에 텍스트 라벨 동반

## 사용법

```bash
/prompts:senior-check                    # 현재 디렉토리의 모든 tsx 파일
/prompts:senior-check app/(main)/work/   # 특정 디렉토리
/prompts:senior-check src/components/ui/Button.tsx  # 특정 파일
```

## 출력 예시

```text
📋 시니어 모드 검증 결과

✅ app/(main)/work/index.tsx
   - useSeniorStyles: ✓
   - 조건부 렌더링: ✓
   - AppIcon 사용: ✓

❌ app/(main)/work/create.tsx
   - useSeniorStyles: ✗ (import 필요)
   - 조건부 렌더링: ✗ (isSeniorMode 분기 필요)
   - 이모지 발견: 📋, 🔧 (AppIcon으로 교체 필요)

검증 결과: 1/2 통과
```

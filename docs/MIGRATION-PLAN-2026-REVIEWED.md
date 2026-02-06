# Insite App Migration Plan 2026 - Reviewed Edition

## Executive Summary

기존 `MIGRATION-PLAN-2026.md`를 검토한 결과, **중대한 기술적 문제점과 누락사항**이 발견되었습니다.
이 문서는 검토 결과와 추가 요구사항을 반영한 개선된 마이그레이션 계획입니다.

---

## Part 1: 기존 플랜의 문제점

### 1.1 치명적 기술 충돌

| 문제 | 심각도 | 원인 | 해결책 |
|------|--------|------|--------|
| Expo SDK 54 + Gluestack-UI 크래시 | **CRITICAL** | Overlay 컴포넌트(Drawer, Modal, Menu)가 SDK 54에서 런타임 크래시 | Gluestack-UI 제거, 자체 컴포넌트 개발 |
| NativeWind + Reanimated 충돌 | **HIGH** | NativeWind v4 ↔ Reanimated v4 호환성 문제 | NativeWind 제거, StyleSheet 유지 |
| React Navigation ↔ Expo Router 공존 불가 | **HIGH** | 두 시스템 모두 NavigationContainer 싱글톤 필요 | 완전 교체 또는 Expo Router만 사용 |

### 1.2 누락된 네이티브 모듈 마이그레이션

```
현재 사용 중인 네이티브 모듈:
├── react-native-nfc-manager (125+ 호출) → Expo Dev Client 필수
├── @hot-updater/react-native → expo-updates (완전 다른 시스템)
├── @microsoft/react-native-clarity → Expo 대안 없음
├── react-native-appguard → Bare workflow 필요
├── @react-native-firebase/messaging → expo-notifications
└── react-native-camera-kit → expo-camera
```

### 1.3 상태 관리 마이그레이션 계획 부재

```
현재:                          플랜:
Apollo makeVar (99회/66파일)   → Zustand
AsyncStorage tokens            → expo-secure-store

마이그레이션 기간 동안 동기화 방법 없음!
```

---

## Part 2: 수정된 기술 스택

### 요구사항 반영: 라이브러리 의존 최소화

**기존 플랜 (과도한 의존):**
```
NativeWind + Tailwind + Gluestack-UI + class-variance-authority
```

**수정된 스택 (최소 의존):**
```
React Native StyleSheet + 자체 Design System
```

### 2.1 Core Dependencies (최소화)

```json
{
  "dependencies": {
    "expo": "~54.0.25",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-camera": "~16.0.0",
    "expo-notifications": "~0.30.0",
    "expo-updates": "~0.27.0",

    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.54.0",
    "zod": "^3.24.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "~5.6.0",
    "@types/react": "~18.3.0"
  }
}
```

**제거된 의존성:**
- ~~NativeWind~~ → StyleSheet 사용
- ~~Tailwind CSS~~ → 자체 디자인 토큰
- ~~Gluestack-UI~~ → 자체 컴포넌트
- ~~class-variance-authority~~ → 간단한 variant 로직

---

## Part 3: 자체 디자인 시스템

### 요구사항 반영: 일관된 UI를 위한 디자인 시스템

### 3.1 Design Tokens (src/theme/tokens.ts)

```typescript
// src/theme/tokens.ts
export const tokens = {
  colors: {
    // Brand (현재 styleGlobal.js의 primary 색상 유지)
    primary: {
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#0064FF', // 현재 앱의 primary 색상
      600: '#0050CC',
      700: '#003C99',
      800: '#002866',
      900: '#001433',
    },

    // Semantic (현재 styleGlobal.js 기반)
    success: { main: '#12805C', light: '#D4E5DE' },
    warning: { main: '#BEA736', light: '#F1EDD9' },
    error: { main: '#C9252D', light: '#EED4D5' },
    info: { main: '#0D66D0', light: '#D3DFF3' },

    // Neutral (현재 styleGlobal.js 기반)
    text: {
      primary: '#2C2C2C',
      secondary: '#6E6E6E',
      disabled: '#8E8E8E',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FAFAFA',
      panel: '#F5F5F5',
    },
    border: {
      default: '#C9C9C9',
      light: '#EAEAEA',
    },
  },

  // 현재 FontSize 기반
  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    fontFamily: {
      regular: 'AppleSDGothicNeo-Regular',
      medium: 'AppleSDGothicNeo-Medium',
      semibold: 'AppleSDGothicNeo-SemiBold',
      bold: 'AppleSDGothicNeo-Bold',
    },
  },

  // 현재 Padding/Border 기반
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },

  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 20,
    full: 9999,
  },
} as const;

export type Tokens = typeof tokens;
```

### 3.2 Theme Provider (src/theme/ThemeContext.tsx)

```typescript
// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { tokens } from './tokens';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: typeof tokens;
  // Senior Mode 지원 (현재 앱의 settingVar.seniorMode)
  isSeniorMode: boolean;
  // 동적 스케일 (Senior Mode에서 1.2x)
  scale: (value: number) => number;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  mode = 'light',
  isSeniorMode = false,
}: {
  children: React.ReactNode;
  mode?: ThemeMode;
  isSeniorMode?: boolean;
}) {
  const value = useMemo(() => ({
    mode,
    tokens,
    isSeniorMode,
    scale: (v: number) => isSeniorMode ? Math.round(v * 1.2) : v,
  }), [mode, isSeniorMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### 3.3 Base Components (의존성 없이 직접 구현)

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
  children,
}: ButtonProps) {
  const { tokens, scale } = useTheme();

  const containerStyle: ViewStyle[] = [
    styles.base,
    getVariantStyle(variant, tokens),
    getSizeStyle(size, scale),
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    getTextVariantStyle(variant, tokens),
    getTextSizeStyle(size, scale),
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...containerStyle,
        pressed && styles.pressed,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : tokens.colors.primary[500]}
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
  );
}

// Variant styles (inline to avoid external dependencies)
function getVariantStyle(variant: ButtonVariant, tokens: typeof import('@/theme/tokens').tokens): ViewStyle {
  const map: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: tokens.colors.primary[500] },
    secondary: { backgroundColor: tokens.colors.background.panel },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: tokens.colors.primary[500]
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: tokens.colors.error.main },
  };
  return map[variant];
}

function getSizeStyle(size: ButtonSize, scale: (v: number) => number): ViewStyle {
  const map: Record<ButtonSize, ViewStyle> = {
    sm: { height: scale(36), paddingHorizontal: scale(12) },
    md: { height: scale(44), paddingHorizontal: scale(16) },
    lg: { height: scale(56), paddingHorizontal: scale(24) },
  };
  return map[size];
}

function getTextVariantStyle(variant: ButtonVariant, tokens: typeof import('@/theme/tokens').tokens): TextStyle {
  const map: Record<ButtonVariant, TextStyle> = {
    primary: { color: '#FFFFFF' },
    secondary: { color: tokens.colors.text.primary },
    outline: { color: tokens.colors.primary[500] },
    ghost: { color: tokens.colors.primary[500] },
    danger: { color: '#FFFFFF' },
  };
  return map[variant];
}

function getTextSizeStyle(size: ButtonSize, scale: (v: number) => number): TextStyle {
  const map: Record<ButtonSize, TextStyle> = {
    sm: { fontSize: scale(14) },
    md: { fontSize: scale(16) },
    lg: { fontSize: scale(18) },
  };
  return map[size];
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: 'AppleSDGothicNeo-SemiBold',
    fontWeight: '600',
  },
});
```

### 3.4 Component Export Structure

```
src/components/
├── ui/                       # Atomic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── Skeleton.tsx
│   └── index.ts
├── forms/                    # Form components
│   ├── TextField.tsx
│   ├── Select.tsx
│   ├── DatePicker.tsx
│   ├── Checkbox.tsx
│   └── index.ts
├── layout/                   # Layout components
│   ├── Container.tsx
│   ├── Stack.tsx
│   ├── Divider.tsx
│   └── index.ts
├── feedback/                 # Feedback components
│   ├── LoadingOverlay.tsx
│   ├── ErrorBoundary.tsx
│   ├── EmptyState.tsx
│   └── index.ts
└── data-display/             # Data components
    ├── List.tsx
    ├── Table.tsx
    ├── Chip.tsx
    └── index.ts
```

---

## Part 4: API 스펙 기반 자동 페이지 생성

### 요구사항 반영: API JSON → 페이지 자동 구현 Skill

### 4.1 API Spec Schema (src/generators/types/ApiSpec.ts)

```typescript
// src/generators/types/ApiSpec.ts
export interface ApiSpec {
  name: string;                    // 페이지 이름 (예: "WorkOrderList")
  route: string;                   // 라우트 경로 (예: "/work")
  type: 'list' | 'detail' | 'form' | 'dashboard';

  // API Configuration
  api: {
    endpoint: string;              // GET /api/work-orders
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: ApiParam[];
    response: ResponseSchema;
  };

  // UI Configuration
  ui: {
    title: string;
    layout: 'default' | 'tabs' | 'sections';
    components: ComponentConfig[];
    actions?: ActionConfig[];
  };

  // Features
  features?: {
    search?: boolean;
    filter?: FilterConfig[];
    sort?: SortConfig[];
    pagination?: boolean;
    pullToRefresh?: boolean;
    infiniteScroll?: boolean;
  };
}

interface ApiParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required?: boolean;
  default?: any;
}

interface ResponseSchema {
  type: 'object' | 'array';
  items?: FieldSchema;            // For array type
  properties?: Record<string, FieldSchema>;
}

interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  format?: 'email' | 'phone' | 'currency' | 'percentage' | 'image' | 'status';
  label?: string;
  displayIn?: ('list' | 'detail' | 'form')[];
}

interface ComponentConfig {
  type: 'card' | 'table' | 'form' | 'chart' | 'stats';
  fields: string[];               // Field names from response
  options?: Record<string, any>;
}

interface ActionConfig {
  name: string;
  type: 'navigate' | 'api' | 'modal';
  label: string;
  icon?: string;
  target?: string;                // Route or API endpoint
}

interface FilterConfig {
  field: string;
  type: 'select' | 'date-range' | 'search';
  options?: { label: string; value: any }[];
}

interface SortConfig {
  field: string;
  label: string;
  default?: 'asc' | 'desc';
}
```

### 4.2 API Spec Example (specs/work-orders.json)

```json
{
  "name": "WorkOrderList",
  "route": "/work",
  "type": "list",

  "api": {
    "endpoint": "/api/work-orders",
    "method": "GET",
    "params": [
      { "name": "status", "type": "string" },
      { "name": "buildingId", "type": "string" },
      { "name": "page", "type": "number", "default": 1 },
      { "name": "limit", "type": "number", "default": 20 }
    ],
    "response": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string", "label": "제목", "displayIn": ["list", "detail"] },
          "status": { "type": "string", "format": "status", "label": "상태", "displayIn": ["list", "detail"] },
          "priority": { "type": "string", "format": "status", "label": "우선순위", "displayIn": ["list", "detail"] },
          "assignee": {
            "type": "object",
            "label": "담당자",
            "properties": {
              "name": { "type": "string" },
              "avatar": { "type": "string", "format": "image" }
            }
          },
          "building": {
            "type": "object",
            "label": "건물",
            "properties": {
              "name": { "type": "string" }
            }
          },
          "dueDate": { "type": "date", "label": "마감일", "displayIn": ["list", "detail"] },
          "createdAt": { "type": "date", "label": "생성일", "displayIn": ["detail"] }
        }
      }
    }
  },

  "ui": {
    "title": "작업지시",
    "layout": "default",
    "components": [
      {
        "type": "card",
        "fields": ["title", "status", "priority", "assignee", "building", "dueDate"],
        "options": {
          "onPress": { "navigate": "/work/[id]" }
        }
      }
    ],
    "actions": [
      {
        "name": "create",
        "type": "navigate",
        "label": "새 작업",
        "icon": "plus",
        "target": "/work/create"
      }
    ]
  },

  "features": {
    "search": true,
    "filter": [
      {
        "field": "status",
        "type": "select",
        "options": [
          { "label": "전체", "value": null },
          { "label": "대기", "value": "pending" },
          { "label": "진행중", "value": "in_progress" },
          { "label": "완료", "value": "completed" }
        ]
      }
    ],
    "pullToRefresh": true,
    "infiniteScroll": true
  }
}
```

### 4.3 Page Generator (src/generators/generatePage.ts)

```typescript
// src/generators/generatePage.ts
import { ApiSpec, ComponentConfig } from './types/ApiSpec';

export function generatePage(spec: ApiSpec): string {
  const imports = generateImports(spec);
  const types = generateTypes(spec);
  const hooks = generateHooks(spec);
  const component = generateComponent(spec);

  return `${imports}\n\n${types}\n\n${hooks}\n\n${component}`;
}

function generateImports(spec: ApiSpec): string {
  const imports = [
    `import React from 'react';`,
    `import { View, FlatList, RefreshControl } from 'react-native';`,
    `import { useQuery } from '@tanstack/react-query';`,
    `import { api } from '@/api/client';`,
  ];

  // Add UI component imports based on spec.ui.components
  const uiComponents = new Set<string>();
  spec.ui.components.forEach(comp => {
    if (comp.type === 'card') uiComponents.add('Card');
    if (comp.type === 'form') uiComponents.add('Input', 'Button');
  });

  if (uiComponents.size > 0) {
    imports.push(`import { ${[...uiComponents].join(', ')} } from '@/components/ui';`);
  }

  if (spec.features?.search) {
    imports.push(`import { SearchBar } from '@/components/forms';`);
  }

  return imports.join('\n');
}

function generateTypes(spec: ApiSpec): string {
  // Generate TypeScript interface from response schema
  const schema = spec.api.response;
  const itemSchema = schema.type === 'array' ? schema.items : schema;

  if (!itemSchema?.properties) return '';

  const fields = Object.entries(itemSchema.properties)
    .map(([key, field]) => {
      const tsType = mapToTsType(field.type, field.format);
      return `  ${key}: ${tsType};`;
    })
    .join('\n');

  return `interface ${spec.name}Item {\n${fields}\n}`;
}

function mapToTsType(type: string, format?: string): string {
  if (type === 'object') return 'Record<string, any>';
  if (type === 'array') return 'any[]';
  if (type === 'date') return 'string';
  return type;
}

function generateHooks(spec: ApiSpec): string {
  const queryKey = spec.name.toLowerCase().replace(/list$/i, 's');

  return `
function use${spec.name}(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['${queryKey}', params],
    queryFn: async () => {
      const { data } = await api.get<${spec.name}Item[]>('${spec.api.endpoint}', { params });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}`;
}

function generateComponent(spec: ApiSpec): string {
  const componentName = spec.name;

  return `
export default function ${componentName}Screen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data, isLoading, refetch, isRefetching } = use${spec.name}();

  const filteredData = React.useMemo(() => {
    if (!data || !searchQuery) return data;
    return data.filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const renderItem = ({ item }: { item: ${spec.name}Item }) => (
    <${spec.ui.components[0].type === 'card' ? 'Card' : 'View'} style={{ marginBottom: 12 }}>
      {/* Auto-generated fields */}
      ${generateCardFields(spec)}
    </${spec.ui.components[0].type === 'card' ? 'Card' : 'View'}>
  );

  return (
    <View style={{ flex: 1 }}>
      ${spec.features?.search ? '<SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="검색..." />' : ''}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          ${spec.features?.pullToRefresh ? '<RefreshControl refreshing={isRefetching} onRefresh={refetch} />' : 'undefined'}
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}`;
}

function generateCardFields(spec: ApiSpec): string {
  const cardComp = spec.ui.components.find(c => c.type === 'card');
  if (!cardComp) return '';

  return cardComp.fields
    .map(field => `<Text>{item.${field}}</Text>`)
    .join('\n      ');
}
```

### 4.4 CLI Tool (scripts/generate-page.ts)

```typescript
#!/usr/bin/env ts-node
// scripts/generate-page.ts

import fs from 'fs';
import path from 'path';
import { generatePage } from '../src/generators/generatePage';
import { ApiSpec } from '../src/generators/types/ApiSpec';

const [,, specPath] = process.argv;

if (!specPath) {
  console.error('Usage: npx ts-node scripts/generate-page.ts <spec.json>');
  process.exit(1);
}

const spec: ApiSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
const code = generatePage(spec);

const outputDir = path.join('app', spec.route.split('/')[1] || '');
const outputPath = path.join(outputDir, 'index.tsx');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, code);

console.log(`Generated: ${outputPath}`);
```

### 4.5 Claude Code Skill Definition

```yaml
# ~/.claude/skills/api-page-gen.yaml
name: api-page-gen
description: API JSON 스펙으로부터 페이지 자동 생성
trigger:
  - "generate page from"
  - "create page for api"
  - "api spec to page"

steps:
  1. Read API spec JSON file
  2. Validate spec against schema
  3. Generate TypeScript code using generator
  4. Create route file in app/ directory
  5. Generate corresponding TanStack Query hook
  6. Add to navigation if needed
```

---

## Part 5: 개발/프로덕션 환경 완벽 분리

### 요구사항 반영: 환경 완벽 분리

### 5.1 Environment Configuration

```typescript
// src/config/env.ts
import Constants from 'expo-constants';

type Environment = 'development' | 'staging' | 'production';

interface EnvConfig {
  apiHost: string;
  apiPorts: {
    main: number;
    bems: number;
    pc: number;
  };
  features: {
    debugMode: boolean;
    mockApi: boolean;
    devTools: boolean;
  };
  thirdParty: {
    clarityKey: string | null;
    firebaseConfig: Record<string, string>;
    sentryDsn: string | null;
  };
}

const configs: Record<Environment, EnvConfig> = {
  development: {
    apiHost: 'https://stage.hdc-insite.com',
    apiPorts: { main: 8083, bems: 8086, pc: 8081 },
    features: {
      debugMode: true,
      mockApi: false,      // true로 설정 시 MSW 활성화
      devTools: true,
    },
    thirdParty: {
      clarityKey: null,    // 개발에서는 비활성화
      firebaseConfig: { /* staging config */ },
      sentryDsn: null,     // 개발에서는 비활성화
    },
  },

  staging: {
    apiHost: 'https://stage.hdc-insite.com',
    apiPorts: { main: 8083, bems: 8086, pc: 8081 },
    features: {
      debugMode: true,
      mockApi: false,
      devTools: true,
    },
    thirdParty: {
      clarityKey: 'staging-clarity-key',
      firebaseConfig: { /* staging config */ },
      sentryDsn: 'https://staging@sentry.io/xxx',
    },
  },

  production: {
    apiHost: 'https://www.hdc-insite.com',
    apiPorts: { main: 8083, bems: 8086, pc: 8081 },
    features: {
      debugMode: false,
      mockApi: false,
      devTools: false,
    },
    thirdParty: {
      clarityKey: 'ud1hhzgi7a',
      firebaseConfig: { /* production config */ },
      sentryDsn: 'https://production@sentry.io/xxx',
    },
  },
};

// 환경 결정 로직
function getEnvironment(): Environment {
  // 1. EAS Build profile에서 결정
  const easProfile = Constants.expoConfig?.extra?.eas?.profile;
  if (easProfile === 'production') return 'production';
  if (easProfile === 'staging') return 'staging';

  // 2. 개발 모드 체크
  if (__DEV__) return 'development';

  // 3. 기본값
  return 'production';
}

export const ENV = configs[getEnvironment()];
export const CURRENT_ENV = getEnvironment();
```

### 5.2 EAS Build Profiles (eas.json)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "env": {
        "APP_ENV": "development"
      },
      "channel": "development"
    },
    "staging": {
      "distribution": "internal",
      "ios": {
        "enterpriseProvisioning": "universal"
      },
      "env": {
        "APP_ENV": "staging"
      },
      "channel": "staging"
    },
    "production": {
      "distribution": "store",
      "env": {
        "APP_ENV": "production"
      },
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 5.3 App Config (app.config.ts)

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = process.env.APP_ENV || 'development';

  const envConfigs = {
    development: {
      name: 'Insite (Dev)',
      identifier: 'com.hdclandmark.insite.dev',
      icon: './assets/icon-dev.png',
    },
    staging: {
      name: 'Insite (Stage)',
      identifier: 'com.hdclandmark.insite.staging',
      icon: './assets/icon-staging.png',
    },
    production: {
      name: 'Insite',
      identifier: 'com.hdclandmark.insite',
      icon: './assets/icon.png',
    },
  };

  const envConfig = envConfigs[appEnv as keyof typeof envConfigs];

  return {
    ...config,
    name: envConfig.name,
    slug: 'insite-app',
    version: '2.0.0',
    orientation: 'portrait',
    icon: envConfig.icon,

    ios: {
      bundleIdentifier: envConfig.identifier,
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: '작업 사진 촬영을 위해 카메라 접근이 필요합니다.',
        NSLocationWhenInUseUsageDescription: '현장 위치 확인을 위해 위치 접근이 필요합니다.',
        NFCReaderUsageDescription: '순찰 체크를 위해 NFC 접근이 필요합니다.',
      },
    },

    android: {
      package: envConfig.identifier,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0064FF',
      },
      permissions: [
        'CAMERA',
        'ACCESS_FINE_LOCATION',
        'NFC',
        'VIBRATE',
        'RECEIVE_BOOT_COMPLETED',
      ],
    },

    extra: {
      eas: {
        projectId: 'your-project-id',
        profile: appEnv,
      },
    },

    updates: {
      url: 'https://u.expo.dev/your-project-id',
      fallbackToCacheTimeout: 0,
    },

    runtimeVersion: {
      policy: 'sdkVersion',
    },
  };
};
```

### 5.4 환경별 API Client 분리

```typescript
// src/api/client.ts
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENV, CURRENT_ENV } from '@/config/env';

const createClient = (port: number): AxiosInstance => {
  const client = axios.create({
    baseURL: `${ENV.apiHost}:${port}`,
    timeout: 30000,
  });

  // Request interceptor
  client.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 개발 환경에서만 요청 로깅
    if (ENV.features.debugMode) {
      console.log(`[API ${CURRENT_ENV}]`, config.method?.toUpperCase(), config.url);
    }

    return config;
  });

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      // 프로덕션에서만 Sentry 에러 리포팅
      if (!ENV.features.debugMode && ENV.thirdParty.sentryDsn) {
        // Sentry.captureException(error);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const api = createClient(ENV.apiPorts.main);
export const bemsApi = createClient(ENV.apiPorts.bems);
export const pcApi = createClient(ENV.apiPorts.pc);
```

### 5.5 Mock Service Worker (개발용)

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { ENV } from '@/config/env';

export const handlers = [
  http.get(`${ENV.apiHost}:${ENV.apiPorts.main}/api/work-orders`, () => {
    return HttpResponse.json([
      {
        id: '1',
        title: '[Mock] 테스트 작업지시',
        status: 'pending',
        priority: 'high',
        // ...
      },
    ]);
  }),
];

// src/mocks/setup.ts
import { setupServer } from 'msw/native';
import { handlers } from './handlers';
import { ENV } from '@/config/env';

export const server = setupServer(...handlers);

export function setupMocks() {
  if (ENV.features.mockApi) {
    server.listen({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mock server started');
  }
}
```

---

## Part 6: 수정된 마이그레이션 타임라인

### 기존 15주 → 수정된 20주

| Phase | 기간 | 내용 | 추가된 작업 |
|-------|------|------|------------|
| **0** | 2주 | 기술 검증 POC | NFC Dev Client, 환경 분리, 상태 동기화 테스트 |
| **1** | 2주 | Foundation | TypeScript strict, 환경 설정, 디자인 시스템 토큰 |
| **2** | 4주 | Core Infrastructure | API Client, Zustand, **상태 브릿지 레이어** |
| **3** | 4주 | UI Components | 자체 디자인 시스템 컴포넌트 (외부 의존 없음) |
| **4** | 4주 | Feature Migration | 화면 마이그레이션, **API 스펙 생성기 활용** |
| **5** | 2주 | Native Modules | NFC, 푸시, OTA 업데이트 마이그레이션 |
| **6** | 2주 | QA & Launch | 테스트, 성능, 보안, 출시 |

---

## Part 7: 체크리스트

### Phase 0: 기술 검증 (신규)

- [ ] Expo Dev Client + NFC 동작 확인
- [ ] 환경 분리 설정 (dev/staging/prod)
- [ ] Apollo makeVar → Zustand 동기화 브릿지 POC
- [ ] @hot-updater → expo-updates 전환 계획
- [ ] Microsoft Clarity 대안 평가 (Sentry Session Replay)

### Phase 1: Foundation

- [ ] Expo SDK 54 설치
- [ ] TypeScript strict mode
- [ ] 디자인 토큰 (styleGlobal.js 기반)
- [ ] 폴더 구조 생성
- [ ] EAS Build 프로필 설정

### Phase 2: Core Infrastructure

- [ ] API Client TypeScript 전환
- [ ] TanStack Query 설정
- [ ] Zustand stores 생성
- [ ] **상태 브릿지 레이어** (Apollo ↔ Zustand)
- [ ] Expo Router 기본 구조

### Phase 3: UI Components

- [ ] Button, Input, Card, Badge
- [ ] Modal, Toast, Skeleton
- [ ] Form components (TextField, Select, DatePicker)
- [ ] Layout components (Container, Stack)
- [ ] **API 스펙 생성기** 구현

### Phase 4: Feature Migration

- [ ] 인증 화면
- [ ] 메인 탭 화면
- [ ] 작업지시 기능
- [ ] 순찰점검 기능
- [ ] 대시보드 기능
- [ ] 설정 화면

### Phase 5: Native Modules (신규)

- [ ] react-native-nfc-manager → Expo config plugin
- [ ] @react-native-firebase/messaging → expo-notifications
- [ ] @hot-updater → expo-updates
- [ ] Microsoft Clarity → Sentry Session Replay

### Phase 6: QA & Launch

- [ ] Unit tests
- [ ] E2E tests (NFC 물리 테스트 포함)
- [ ] 성능 프로파일링
- [ ] 보안 검토
- [ ] 스토어 제출

---

## 결론

기존 마이그레이션 플랜의 핵심 문제:

1. **라이브러리 충돌**: Gluestack-UI + NativeWind + Expo SDK 54 조합 불안정 → **자체 디자인 시스템으로 대체**
2. **네이티브 모듈 누락**: NFC, Hot Updater, Clarity 마이그레이션 계획 없음 → **Phase 5 추가**
3. **상태 동기화 부재**: Apollo ↔ Zustand 공존 방법 없음 → **브릿지 레이어 추가**
4. **환경 분리 미흡**: 단순 __DEV__ 체크만 존재 → **EAS Build 프로필 + 완전 분리**

추가 요구사항 반영:

1. **디자인 시스템**: ✅ Part 3에서 자체 구현 (외부 의존 없음)
2. **API 스펙 → 페이지 생성**: ✅ Part 4에서 제너레이터 + Skill 정의
3. **라이브러리 최소화**: ✅ Gluestack-UI, NativeWind 제거
4. **환경 분리**: ✅ Part 5에서 완전 분리 구현

---

*Reviewed Version: 1.0*
*Review Date: 2026-02-05*
*Original Plan: MIGRATION-PLAN-2026.md*

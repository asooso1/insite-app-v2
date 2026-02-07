import { defineConfig } from 'orval';

/**
 * Orval 설정
 *
 * OpenAPI 스펙에서 TypeScript 타입과 TanStack Query 훅을 자동 생성합니다.
 */
export default defineConfig({
  insite: {
    input: {
      target: './specs/insite-api.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/api/client.ts',
          name: 'customInstance',
        },
      },
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});

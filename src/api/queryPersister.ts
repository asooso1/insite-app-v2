import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * TanStack Query 캐시를 AsyncStorage에 영속화하는 Persister
 *
 * 특징:
 * - 오프라인 지원: 네트워크 없이도 이전 데이터 접근 가능
 * - 앱 재시작 후에도 쿼리 캐시 유지
 * - AsyncStorage 사용으로 안정적인 데이터 저장
 *
 * 저장 키: INSITE_QUERY_CACHE
 *
 * @see https://tanstack.com/query/latest/docs/react/plugins/persistQueryClient
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'INSITE_QUERY_CACHE',
  /**
   * 직렬화/역직렬화는 기본 JSON.stringify/parse 사용
   * 필요시 커스텀 직렬화 함수 추가 가능:
   * serialize: (data) => JSON.stringify(data),
   * deserialize: (data) => JSON.parse(data),
   */
});

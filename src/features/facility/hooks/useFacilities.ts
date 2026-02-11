/**
 * 설비 관련 훅
 *
 * 설비 목록, 카테고리, 이력 조회 훅
 */
import { useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type {
  FacilityCategory,
  FacilityFilter,
  SelectedCategories,
  FacilityHistoryFilter,
} from '../types';
import { mockFacilities } from '../utils/mockData';

/**
 * Mock 카테고리 데이터 (API 연동 전)
 */
const MOCK_FIRST_CATEGORIES: FacilityCategory[] = [
  { id: 1, value: 1, name: '공조설비' },
  { id: 2, value: 2, name: '전기설비' },
  { id: 3, value: 3, name: '소방설비' },
  { id: 4, value: 4, name: '위생설비' },
];

const MOCK_SECOND_CATEGORIES: Record<number, FacilityCategory[]> = {
  1: [
    { id: 11, value: 11, name: '냉난방기' },
    { id: 12, value: 12, name: '환기시설' },
    { id: 13, value: 13, name: '공기조화기' },
  ],
  2: [
    { id: 21, value: 21, name: '변압기' },
    { id: 22, value: 22, name: '배전반' },
    { id: 23, value: 23, name: '발전기' },
  ],
  3: [
    { id: 31, value: 31, name: '소화설비' },
    { id: 32, value: 32, name: '경보설비' },
  ],
  4: [
    { id: 41, value: 41, name: '급수설비' },
    { id: 42, value: 42, name: '배수설비' },
  ],
};

const MOCK_THIRD_CATEGORIES: Record<number, FacilityCategory[]> = {
  11: [
    { id: 111, value: 111, name: '에어컨' },
    { id: 112, value: 112, name: '보일러' },
    { id: 113, value: 113, name: 'EHP' },
  ],
  12: [
    { id: 121, value: 121, name: '배기팬' },
    { id: 122, value: 122, name: '급기팬' },
  ],
  21: [
    { id: 211, value: 211, name: '몰드변압기' },
    { id: 212, value: 212, name: '유입변압기' },
  ],
  31: [
    { id: 311, value: 311, name: '스프링클러' },
    { id: 312, value: 312, name: '소화전' },
  ],
};

/**
 * Mock 이력 데이터
 */
const MOCK_HISTORY = [
  {
    id: 1,
    name: '정기 점검 - 냉방기 #1',
    type: '점검',
    stateName: '완료',
    actorAccountName: '김철수',
    doneDate: '2024-02-01',
    description: '정상 동작 확인',
  },
  {
    id: 2,
    name: '필터 교체 - 냉방기 #1',
    type: '교체',
    stateName: '완료',
    actorAccountName: '이영희',
    doneDate: '2024-01-15',
    description: '필터 교체 완료',
  },
  {
    id: 3,
    name: '긴급 수리 - 냉방기 #1',
    type: '보수',
    stateName: '완료',
    actorAccountName: '박민수',
    doneDate: '2023-12-20',
    description: '압축기 수리',
  },
];

interface UseFacilitiesOptions {
  /** 초기 필터 */
  initialFilter?: FacilityFilter;
  /** Mock 데이터 사용 여부 */
  useMock?: boolean;
}

/**
 * 설비 목록 훅
 */
export function useFacilities(options: UseFacilitiesOptions = {}) {
  const { initialFilter, useMock = true } = options;
  const user = useAuthStore((state) => state.user);
  const buildingId = parseInt(user?.siteId || '0', 10);

  // 필터 상태
  const [filter, setFilter] = useState<FacilityFilter>({
    page: 0,
    size: 20,
    buildingId,
    ...initialFilter,
  });

  // 카테고리 상태
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({
    firstCategoryId: initialFilter?.firstCategoryId ?? 0,
    secondCategoryId: initialFilter?.secondCategoryId ?? 0,
    thirdCategoryId: initialFilter?.thirdCategoryId ?? 0,
  });

  // 1차 카테고리 목록
  const [firstCategories] = useState<FacilityCategory[]>(MOCK_FIRST_CATEGORIES);
  const [secondCategories, setSecondCategories] = useState<FacilityCategory[]>([]);
  const [thirdCategories, setThirdCategories] = useState<FacilityCategory[]>([]);

  // 카테고리 로딩 상태
  const categoriesLoading = false;

  // 1차 분류 선택 핸들러
  const handleFirstCategoryChange = useCallback((categoryId: number) => {
    setSelectedCategories((prev) => ({
      ...prev,
      firstCategoryId: categoryId,
      secondCategoryId: 0,
      thirdCategoryId: 0,
    }));

    if (categoryId === 0) {
      setSecondCategories([]);
      setThirdCategories([]);
    } else {
      // Mock 데이터 사용
      setSecondCategories(MOCK_SECOND_CATEGORIES[categoryId] || []);
      setThirdCategories([]);
    }
  }, []);

  // 2차 분류 선택 핸들러
  const handleSecondCategoryChange = useCallback((categoryId: number) => {
    setSelectedCategories((prev) => ({
      ...prev,
      secondCategoryId: categoryId,
      thirdCategoryId: 0,
    }));

    if (categoryId === 0) {
      setThirdCategories([]);
    } else {
      // Mock 데이터 사용
      setThirdCategories(MOCK_THIRD_CATEGORIES[categoryId] || []);
    }
  }, []);

  // 필터 업데이트
  const updateFilter = useCallback((newFilter: Partial<FacilityFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      page: newFilter.page ?? 0, // 필터 변경 시 페이지 초기화
    }));
  }, []);

  // 키워드 설정 (메모이제이션)
  const setKeyword = useCallback(
    (keyword: string) => updateFilter({ keyword }),
    [updateFilter]
  );

  // 상태 설정 (메모이제이션)
  const setStatus = useCallback(
    (status: FacilityFilter['status']) => updateFilter({ status }),
    [updateFilter]
  );

  // 카테고리 선택 적용
  const applyCategories = useCallback(
    (categories: SelectedCategories) => {
      setSelectedCategories(categories);
      updateFilter({
        firstCategoryId: categories.firstCategoryId || undefined,
        secondCategoryId: categories.secondCategoryId || undefined,
        thirdCategoryId: categories.thirdCategoryId || undefined,
        page: 0,
      });
    },
    [updateFilter]
  );

  // Mock 데이터 필터링
  const filteredFacilities = useMemo(() => {
    if (!useMock) return [];

    let filtered = [...mockFacilities];

    // 키워드 검색
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.code?.toLowerCase().includes(keyword) ||
          item.buildingName?.toLowerCase().includes(keyword) ||
          item.location?.toLowerCase().includes(keyword) ||
          item.manufacturer?.toLowerCase().includes(keyword)
      );
    }

    // 상태 필터
    if (filter.status) {
      filtered = filtered.filter((item) => item.status === filter.status);
    }

    // 카테고리 필터 (Mock: 분류명으로 필터링)
    if (selectedCategories.firstCategoryId) {
      const firstCat = MOCK_FIRST_CATEGORIES.find(
        (c) => c.value === selectedCategories.firstCategoryId
      );
      if (firstCat) {
        filtered = filtered.filter((item) => item.firstClassName === firstCat.name);
      }
    }
    if (selectedCategories.secondCategoryId) {
      const secondCat = Object.values(MOCK_SECOND_CATEGORIES)
        .flat()
        .find((c) => c.value === selectedCategories.secondCategoryId);
      if (secondCat) {
        filtered = filtered.filter((item) => item.secondClassName === secondCat.name);
      }
    }

    return filtered;
  }, [useMock, filter, selectedCategories]);

  // 페이지네이션 정보
  const totalElements = filteredFacilities.length;
  const totalPages = Math.ceil(totalElements / (filter.size || 20));
  const currentPage = filter.page || 0;

  // 현재 페이지 데이터
  const pageData = useMemo(() => {
    const start = currentPage * (filter.size || 20);
    const end = start + (filter.size || 20);
    return filteredFacilities.slice(start, end);
  }, [filteredFacilities, currentPage, filter.size]);

  return {
    // 데이터
    facilities: pageData,
    allFacilities: filteredFacilities,
    totalElements,
    totalPages,
    currentPage,
    isLoading: false,
    isError: false,
    error: null,

    // 필터
    filter,
    updateFilter,
    setKeyword,
    setStatus,

    // 카테고리
    selectedCategories,
    firstCategories,
    secondCategories,
    thirdCategories,
    categoriesLoading,
    handleFirstCategoryChange,
    handleSecondCategoryChange,
    applyCategories,

    // 페이지네이션
    setPage: (page: number) => updateFilter({ page }),
    nextPage: () => updateFilter({ page: Math.min(currentPage + 1, totalPages - 1) }),
    prevPage: () => updateFilter({ page: Math.max(currentPage - 1, 0) }),
    firstPage: () => updateFilter({ page: 0 }),
    lastPage: () => updateFilter({ page: totalPages - 1 }),

    // 리프레시
    refetch: () => {},
  };
}

interface UseFacilityDetailOptions {
  /** 설비 ID */
  facilityId: number;
  /** Mock 데이터 사용 여부 */
  useMock?: boolean;
}

/**
 * 설비 상세 훅
 */
export function useFacilityDetail({ facilityId, useMock: _useMock = true }: UseFacilityDetailOptions) {
  const facility = mockFacilities.find((f) => f.id === facilityId);

  return {
    facility,
    isLoading: false,
    isError: !facility,
    error: facility ? null : new Error('설비를 찾을 수 없습니다'),
    refetch: () => {},
  };
}

interface UseFacilityHistoryOptions {
  /** 설비 ID */
  facilityId: number;
  /** 빌딩 ID */
  buildingId: number;
  /** Mock 데이터 사용 여부 */
  useMock?: boolean;
}

/**
 * 설비 이력 훅
 */
export function useFacilityHistory(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: UseFacilityHistoryOptions
) {
  const [filter, setFilter] = useState<FacilityHistoryFilter>({
    workType: '',
    workOrderType: '1',
    historyType: '',
    workSourceType: '',
    searchType: 'work_order_name',
    searchKeyword: '',
  });

  const [page, setPage] = useState(0);
  const [historyList, setHistoryList] = useState(MOCK_HISTORY);
  const [hasMore, setHasMore] = useState(false);
  const isLoading = false;

  // 필터 변경
  const updateFilter = useCallback((newFilter: Partial<FacilityHistoryFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
    setPage(0);
    // Mock에서는 필터링 로직 간소화
    setHistoryList(MOCK_HISTORY);
    setHasMore(false);
  }, []);

  // 검색
  const search = useCallback(() => {
    setPage(0);
    // Mock에서는 간단히 필터링
    if (filter.searchKeyword) {
      const keyword = filter.searchKeyword.toLowerCase();
      setHistoryList(
        MOCK_HISTORY.filter(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.actorAccountName?.toLowerCase().includes(keyword)
        )
      );
    } else {
      setHistoryList(MOCK_HISTORY);
    }
  }, [filter.searchKeyword]);

  // 더보기
  const loadMore = useCallback(() => {
    // Mock에서는 더보기 없음
    setHasMore(false);
  }, []);

  return {
    historyList,
    filter,
    updateFilter,
    search,
    page,
    setPage,
    hasMore,
    loadMore,
    isLoading,
    totalPages: 1,
  };
}

export default useFacilities;

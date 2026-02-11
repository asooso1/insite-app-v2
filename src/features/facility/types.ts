/**
 * 설비 관련 타입 정의
 */

/**
 * 설비 DTO
 */
export interface FacilityDTO {
  /** 설비 ID */
  id: number;
  /** 설비명 */
  name: string;
  /** 설비 코드 */
  code?: string;
  /** 설비 유형 */
  type?: string;
  /** 빌딩 ID */
  buildingId?: number;
  /** 빌딩명 */
  buildingName?: string;
  /** 층 */
  floor?: string;
  /** 위치 */
  location?: string;
  /** 제조사 */
  manufacturer?: string;
  /** 모델명 */
  model?: string;
  /** 용량 */
  capacity?: string;
  /** 설치일 */
  installDate?: string;
  /** 최종 점검일 */
  lastCheckDate?: string;
  /** 상태 (NORMAL: 정상, WARNING: 주의, ERROR: 오류, MAINTENANCE: 점검중) */
  status?: 'NORMAL' | 'WARNING' | 'ERROR' | 'MAINTENANCE';
  /** 담당자명 */
  managerName?: string;
  /** 담당자 연락처 */
  managerPhone?: string;
  /** 설명 */
  description?: string;
  /** 1차 분류 ID */
  firstCategoryId?: number;
  /** 1차 분류명 */
  firstClassName?: string;
  /** 2차 분류 ID */
  secondCategoryId?: number;
  /** 2차 분류명 */
  secondClassName?: string;
  /** 3차 분류 ID */
  thirdCategoryId?: number;
  /** 3차 분류명 */
  thirdClassName?: string;
  /** 이미지 URL */
  imageUrl?: string;
  /** 사양 정보 */
  specifications?: FacilitySpecification[];
  /** 관련 업무 이력 수 */
  workOrderCount?: number;
}

/**
 * 설비 사양 정보
 */
export interface FacilitySpecification {
  /** 사양 이름 */
  name: string;
  /** 사양 값 */
  value: string;
  /** 단위 */
  unit?: string;
}

/**
 * 설비 목록 필터
 */
export interface FacilityFilter {
  /** 검색 키워드 */
  keyword?: string;
  /** 빌딩 ID */
  buildingId?: number;
  /** 1차 분류 ID */
  firstCategoryId?: number;
  /** 2차 분류 ID */
  secondCategoryId?: number;
  /** 3차 분류 ID */
  thirdCategoryId?: number;
  /** 상태 */
  status?: FacilityDTO['status'];
  /** 페이지 */
  page?: number;
  /** 페이지 크기 */
  size?: number;
}

/**
 * 설비 분류 카테고리
 */
export interface FacilityCategory {
  /** 카테고리 ID */
  id: number;
  /** 카테고리 값 (API의 value 필드) */
  value: number;
  /** 카테고리명 */
  name: string;
  /** 정렬 순서 */
  orderIndex?: number;
}

/**
 * 설비 분류 (구 호환용)
 */
export interface FacilityClassification {
  /** 분류 ID */
  id: number;
  /** 분류명 */
  name: string;
  /** 상위 분류 ID */
  parentId?: number;
  /** 레벨 (1~3) */
  level: 1 | 2 | 3;
}

/**
 * 설비 이력 DTO
 */
export interface FacilityWorkOrderHistoryDTO {
  /** 작업지시 ID */
  id: number;
  /** 작업지시명 */
  name: string;
  /** 유형 */
  type?: string;
  /** 상태명 */
  stateName?: string;
  /** 담당자명 */
  actorAccountName?: string;
  /** 완료일 */
  doneDate?: string;
  /** 설명 */
  description?: string;
}

/**
 * 설비 이력 필터
 */
export interface FacilityHistoryFilter {
  /** 업무 구분 (1: 수시업무, -1: 수동등록, '': 전체) */
  workType?: string;
  /** 수시업무 유형 (1: 수시업무, 2: 공사업무, 3: 고객불편, 4: 사건사고) */
  workOrderType?: string;
  /** 수동등록 구분 (REPAIR, REPLACEMENT, INSPECTION, CLEANING, '': 전체) */
  historyType?: string;
  /** 유형 (IN_HOUSE: 자체, OUTSOURCED: 외주, '': 전체) */
  workSourceType?: string;
  /** 검색 구분 (work_order_name, writer_account, processing_account, approve_account) */
  searchType?: string;
  /** 검색 키워드 */
  searchKeyword?: string;
}

/**
 * 선택된 카테고리 상태
 */
export interface SelectedCategories {
  /** 1차 분류 ID (0 = 미선택) */
  firstCategoryId: number;
  /** 2차 분류 ID (0 = 미선택) */
  secondCategoryId: number;
  /** 3차 분류 ID (0 = 미선택) */
  thirdCategoryId: number;
}

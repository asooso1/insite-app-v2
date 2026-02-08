/**
 * 체크리스트 타입 정의
 *
 * 작업 결과 입력에 사용되는 체크리스트 관련 타입
 */

/**
 * 체크리스트 항목 결과 유형
 */
export type ChecklistResultType =
  | 'TEXT' // 텍스트 입력
  | 'GOOD_NO_GOOD' // 양호/불량
  | 'DO_DONT' // 실시/미실시
  | 'ON_OFF' // On/Off 스위치
  | 'ANALOG'; // 숫자 입력

/**
 * 체크리스트 항목 데이터
 */
export interface ChecklistItemData {
  /** 항목 ID */
  id: number;
  /** 항목명 */
  name: string;
  /** 결과 유형 */
  resultType: ChecklistResultType;
  /** 단위 (ANALOG 타입인 경우) */
  unit?: string;
  /** 필수 여부 */
  required?: boolean;
}

/**
 * 체크리스트 항목 결과
 */
export interface ChecklistItemResult {
  /** 항목 ID */
  itemId: number;
  /** 결과 값 */
  value: string | number | boolean;
  /** 양호/불량 여부 (GOOD_NO_GOOD 타입인 경우) */
  isGood?: boolean;
  /** 실시/미실시 여부 (DO_DONT 타입인 경우) */
  isDone?: boolean;
}

/**
 * 작업 결과 입력 데이터
 */
export interface WorkResultFormData {
  /** 사고 유형 */
  accidentType?: string;
  /** 사고 원인 */
  accidentReason?: string;
  /** 피해 현황 */
  damage?: string;
  /** 향후 대책 */
  countermeasure?: string;
  /** 개선점 */
  improvement?: string;
  /** 조치사항 (필수) */
  takeAction: string;
  /** 체크리스트 결과 */
  checklistResults: ChecklistItemResult[];
  /** 첨부 사진 */
  photos?: string[];
}

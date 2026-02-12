/**
 * 스캔 데이터 파싱 유틸리티
 *
 * QR 코드 및 NFC 태그 데이터를 파싱하여 구조화된 형태로 반환
 * v1 ScanUtils.js 마이그레이션
 */
import CryptoJS from 'crypto-js';
import { apiClient } from '@/api/client';

// QR 암호화 키 (환경변수로 관리 권장)
const QR_SECRET_KEY = 'insite_qr_secret_key_2024';

/**
 * 스캔 데이터 타입
 */
export interface ScanData {
  /** 건물 ID */
  buildingId?: number;
  /** 건물명 */
  buildingName?: string;
  /** 층 ID */
  buildingFloorId?: number;
  /** 층명 */
  buildingFloorName?: string;
  /** 구역 ID */
  buildingFloorZoneId?: number;
  /** 구역명 */
  buildingFloorZoneName?: string;
  /** 설비 ID */
  facilityId?: number;
  /** 설비명 */
  facilityName?: string;
  /** QR 타입 (attendance, facility 등) */
  qrType?: string;
  /** 업무 타입 */
  workType?: string;
  /** 원본 데이터 */
  rawData?: string;
}

/**
 * 스캔 결과 타입
 */
export type ScanResultType =
  | 'location' // 위치 정보만 (층/구역)
  | 'facility' // 설비 정보 포함
  | 'attendance' // 출퇴근용
  | 'patrol' // 순찰용
  | 'workOrder' // 업무등록용
  | 'unknown'; // 알 수 없음

/**
 * 파싱 결과
 */
export interface ParseResult {
  success: boolean;
  data?: ScanData;
  type: ScanResultType;
  error?: string;
}

/**
 * JSON 문자열 여부 확인
 */
export const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * URL 파라미터를 객체로 파싱
 */
export const parseUrlParams = (url: string): Record<string, string> => {
  const result: Record<string, string> = {};

  try {
    const queryString = url.includes('?') ? url.split('?')[1] : url;
    if (!queryString) return result;

    const params = queryString.split('&');
    params.forEach((param) => {
      const [key, value] = param.split('=');
      if (key && value) {
        result[key.trim()] = decodeURIComponent(value.trim());
      }
    });
  } catch (error) {
    console.error('[ScanParser] URL 파라미터 파싱 실패:', error);
  }

  return result;
};

/**
 * AES 암호화된 QR 데이터 복호화
 */
export const decryptQrData = (encryptedData: string): Record<string, string> => {
  const result: Record<string, string> = {};

  try {
    // URL-safe Base64 → 표준 Base64 변환
    let base64Data = encryptedData.replace(/-/g, '+').replace(/_/g, '/');

    // 패딩 추가
    const pad = base64Data.length % 4;
    if (pad === 2) {
      base64Data += '==';
    } else if (pad === 3) {
      base64Data += '=';
    }

    // AES 복호화
    const decrypted = CryptoJS.AES.decrypt(base64Data, QR_SECRET_KEY);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error('복호화 실패');
    }

    // key=value 형식 파싱
    const params = decryptedString.split('&');
    params.forEach((param) => {
      const [key, value] = param.split('=');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error('[ScanParser] QR 복호화 실패:', error);
    throw new Error('QR 코드 복호화에 실패했습니다.');
  }

  return result;
};

/**
 * 축약 URL(hk=) 확장 - API 호출
 */
export const expandShortUrl = async (hkValue: string): Promise<ScanData> => {
  try {
    const response = await apiClient.get<{
      code: string;
      message: string;
      data: ScanData;
    }>(`/m/api/qr/expand/${decodeURIComponent(hkValue)}`);

    if (response.data.code === 'success') {
      return response.data.data;
    }

    throw new Error(response.data.message || 'API 호출 실패');
  } catch (error) {
    console.error('[ScanParser] 축약 URL 확장 실패:', error);
    throw new Error('QR 코드 정보를 가져오는데 실패했습니다.');
  }
};

/**
 * QR 코드 데이터 파싱 (메인 함수)
 */
export const parseQrCode = async (rawData: string): Promise<ParseResult> => {
  try {
    let scanData: ScanData = { rawData };

    // 1. 암호화된 URL (q= 파라미터)
    if (rawData.includes('q=')) {
      const qIndex = rawData.indexOf('q=');
      let qValue = rawData.substring(qIndex + 2);

      // & 또는 # 이후 제거
      const ampIndex = qValue.indexOf('&');
      if (ampIndex !== -1) qValue = qValue.substring(0, ampIndex);
      const hashIndex = qValue.indexOf('#');
      if (hashIndex !== -1) qValue = qValue.substring(0, hashIndex);

      const decryptedData = decryptQrData(qValue);
      scanData = {
        ...scanData,
        buildingId: decryptedData.buildingId ? Number(decryptedData.buildingId) : undefined,
        buildingName: decryptedData.buildingName,
        buildingFloorId: decryptedData.buildingFloorId
          ? Number(decryptedData.buildingFloorId)
          : undefined,
        buildingFloorName: decryptedData.buildingFloorName,
        buildingFloorZoneId: decryptedData.buildingFloorZoneId
          ? Number(decryptedData.buildingFloorZoneId)
          : undefined,
        buildingFloorZoneName: decryptedData.buildingFloorZoneName,
        facilityId: decryptedData.facilityId ? Number(decryptedData.facilityId) : undefined,
        facilityName: decryptedData.facilityName,
        qrType: decryptedData.qrType,
        workType: decryptedData.workType,
      };
    }
    // 2. 축약 URL (hk= 파라미터)
    else if (rawData.includes('hk=')) {
      const hkIndex = rawData.indexOf('hk=');
      let hkValue = rawData.substring(hkIndex + 3);

      const ampIndex = hkValue.indexOf('&');
      if (ampIndex !== -1) hkValue = hkValue.substring(0, ampIndex);
      const hashIndex = hkValue.indexOf('#');
      if (hashIndex !== -1) hkValue = hkValue.substring(0, hashIndex);

      const expandedData = await expandShortUrl(hkValue);
      scanData = { ...scanData, ...expandedData };
    }
    // 3. JSON 형식
    else if (isJsonString(rawData)) {
      const jsonData = JSON.parse(rawData);
      scanData = {
        ...scanData,
        buildingId: jsonData.buildingId,
        buildingName: jsonData.buildingName,
        buildingFloorId: jsonData.buildingFloorId,
        buildingFloorName: jsonData.buildingFloorName,
        buildingFloorZoneId: jsonData.buildingFloorZoneId,
        buildingFloorZoneName: jsonData.buildingFloorZoneName,
        facilityId: jsonData.facilityId,
        facilityName: jsonData.facilityName,
        qrType: jsonData.qrType,
        workType: jsonData.workType,
      };
    }
    // 4. URL 파라미터 형식
    else if (rawData.includes('=')) {
      const params = parseUrlParams(rawData);
      scanData = {
        ...scanData,
        buildingId: params.buildingId ? Number(params.buildingId) : undefined,
        buildingName: params.buildingName,
        buildingFloorId: params.buildingFloorId ? Number(params.buildingFloorId) : undefined,
        buildingFloorName: params.buildingFloorName,
        buildingFloorZoneId: params.buildingFloorZoneId
          ? Number(params.buildingFloorZoneId)
          : undefined,
        buildingFloorZoneName: params.buildingFloorZoneName,
        facilityId: params.facilityId ? Number(params.facilityId) : undefined,
        facilityName: params.facilityName,
        qrType: params.qrType,
        workType: params.workType,
      };
    }
    // 5. 알 수 없는 형식
    else {
      return {
        success: false,
        type: 'unknown',
        error: '인식할 수 없는 QR 코드 형식입니다.',
      };
    }

    // 스캔 결과 타입 결정
    const type = determineScanType(scanData);

    return {
      success: true,
      data: scanData,
      type,
    };
  } catch (error) {
    console.error('[ScanParser] QR 파싱 실패:', error);
    return {
      success: false,
      type: 'unknown',
      error: error instanceof Error ? error.message : 'QR 코드 파싱에 실패했습니다.',
    };
  }
};

/**
 * NFC NDEF 메시지 파싱
 */
export const parseNdefMessage = (payload: number[]): string => {
  // NDEF Text Record: 첫 3바이트는 헤더 (status byte + language code)
  // 일반적으로 index 3부터가 실제 텍스트
  let text = '';

  for (let i = 3; i < payload.length; i++) {
    const charCode = payload[i];
    if (charCode !== undefined) {
      text += String.fromCharCode(charCode);
    }
  }

  return text;
};

/**
 * NFC 태그 데이터 파싱
 */
export const parseNfcTag = async (ndefText: string): Promise<ParseResult> => {
  // NFC 데이터도 QR과 동일한 형식을 사용
  return parseQrCode(ndefText);
};

/**
 * 스캔 결과 타입 결정
 */
export const determineScanType = (data: ScanData): ScanResultType => {
  // qrType 기반 판단
  if (data.qrType) {
    switch (data.qrType.toLowerCase()) {
      case 'attendance':
      case 'checkin':
      case 'checkout':
        return 'attendance';
      case 'patrol':
        return 'patrol';
      case 'workorder':
      case 'workorderregister':
        return 'workOrder';
      case 'facility':
        return 'facility';
      case 'location':
        return 'location';
    }
  }

  // workType 기반 판단
  if (data.workType) {
    switch (data.workType.toLowerCase()) {
      case 'checkin':
      case 'checkout':
        return 'attendance';
      case 'locationqr':
        return 'location';
      case 'facilityqr':
        return 'facility';
      case 'workorderregisterqr':
        return 'workOrder';
    }
  }

  // 데이터 필드 기반 판단
  if (data.facilityId) {
    return 'facility';
  }

  if (data.buildingFloorZoneId || data.buildingFloorId) {
    return 'location';
  }

  return 'unknown';
};

/**
 * 스캔 데이터 유효성 검증
 */
export const validateScanData = (
  data: ScanData,
  expectedBuildingId?: number
): { valid: boolean; error?: string } => {
  // 건물 ID 필수
  if (!data.buildingId) {
    return { valid: false, error: '건물 정보가 없습니다.' };
  }

  // 건물 ID 일치 검증
  if (expectedBuildingId && data.buildingId !== expectedBuildingId) {
    return { valid: false, error: '선택한 건물의 정보와 일치하지 않습니다.' };
  }

  return { valid: true };
};

/**
 * 스캔 데이터 포맷팅 (표시용)
 */
export const formatScanData = (data: ScanData): string => {
  const parts: string[] = [];

  if (data.buildingName) {
    parts.push(data.buildingName);
  }

  if (data.buildingFloorName) {
    parts.push(data.buildingFloorName);
  }

  if (data.buildingFloorZoneName) {
    parts.push(data.buildingFloorZoneName);
  }

  if (data.facilityName) {
    parts.push(`설비: ${data.facilityName}`);
  }

  return parts.join(' > ');
};

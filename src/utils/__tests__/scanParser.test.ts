/**
 * 스캔 파서 유틸리티 단위 테스트
 */
import {
  isJsonString,
  parseUrlParams,
  determineScanType,
  validateScanData,
  formatScanData,
  parseNdefMessage,
} from '../scanParser';
import type { ScanData } from '../scanParser';

describe('scanParser', () => {
  describe('isJsonString', () => {
    it('유효한 JSON 문자열을 인식한다', () => {
      expect(isJsonString('{"key": "value"}')).toBe(true);
      expect(isJsonString('[]')).toBe(true);
      expect(isJsonString('"hello"')).toBe(true);
      expect(isJsonString('123')).toBe(true);
      expect(isJsonString('null')).toBe(true);
    });

    it('유효하지 않은 JSON 문자열을 거부한다', () => {
      expect(isJsonString('hello')).toBe(false);
      expect(isJsonString('{invalid}')).toBe(false);
      expect(isJsonString('')).toBe(false);
      expect(isJsonString('undefined')).toBe(false);
    });
  });

  describe('parseUrlParams', () => {
    it('URL 파라미터를 올바르게 파싱한다', () => {
      const result = parseUrlParams('buildingId=1&buildingName=테스트');

      expect(result).toEqual({
        buildingId: '1',
        buildingName: '테스트',
      });
    });

    it('? 이후의 쿼리 스트링을 파싱한다', () => {
      const result = parseUrlParams('http://example.com?key=value&foo=bar');

      expect(result).toEqual({ key: 'value', foo: 'bar' });
    });

    it('빈 문자열은 빈 객체를 반환한다', () => {
      expect(parseUrlParams('')).toEqual({});
    });

    it('인코딩된 값을 디코딩한다', () => {
      const result = parseUrlParams('name=%ED%85%8C%EC%8A%A4%ED%8A%B8');

      expect(result.name).toBe('테스트');
    });

    it('값이 없는 파라미터는 무시한다', () => {
      const result = parseUrlParams('key1=value1&key2=&key3');

      expect(result).toEqual({ key1: 'value1' });
    });
  });

  describe('determineScanType', () => {
    it('qrType이 attendance이면 attendance를 반환한다', () => {
      expect(determineScanType({ qrType: 'attendance' })).toBe('attendance');
      expect(determineScanType({ qrType: 'checkin' })).toBe('attendance');
      expect(determineScanType({ qrType: 'checkout' })).toBe('attendance');
    });

    it('qrType이 patrol이면 patrol을 반환한다', () => {
      expect(determineScanType({ qrType: 'patrol' })).toBe('patrol');
    });

    it('qrType이 workorder이면 workOrder를 반환한다', () => {
      expect(determineScanType({ qrType: 'workorder' })).toBe('workOrder');
      expect(determineScanType({ qrType: 'workorderregister' })).toBe('workOrder');
    });

    it('qrType이 facility이면 facility를 반환한다', () => {
      expect(determineScanType({ qrType: 'facility' })).toBe('facility');
    });

    it('qrType이 location이면 location을 반환한다', () => {
      expect(determineScanType({ qrType: 'location' })).toBe('location');
    });

    it('qrType 대소문자를 무시한다', () => {
      expect(determineScanType({ qrType: 'ATTENDANCE' })).toBe('attendance');
      expect(determineScanType({ qrType: 'Patrol' })).toBe('patrol');
    });

    it('workType 기반으로 판단한다', () => {
      expect(determineScanType({ workType: 'checkin' })).toBe('attendance');
      expect(determineScanType({ workType: 'checkout' })).toBe('attendance');
      expect(determineScanType({ workType: 'locationqr' })).toBe('location');
      expect(determineScanType({ workType: 'facilityqr' })).toBe('facility');
      expect(determineScanType({ workType: 'workorderregisterqr' })).toBe('workOrder');
    });

    it('facilityId가 있으면 facility를 반환한다', () => {
      expect(determineScanType({ facilityId: 100 })).toBe('facility');
    });

    it('buildingFloorZoneId가 있으면 location을 반환한다', () => {
      expect(determineScanType({ buildingFloorZoneId: 10 })).toBe('location');
    });

    it('buildingFloorId가 있으면 location을 반환한다', () => {
      expect(determineScanType({ buildingFloorId: 5 })).toBe('location');
    });

    it('판단 불가 시 unknown을 반환한다', () => {
      expect(determineScanType({})).toBe('unknown');
      expect(determineScanType({ rawData: 'test' })).toBe('unknown');
    });

    it('qrType이 workType보다 우선한다', () => {
      expect(determineScanType({ qrType: 'patrol', workType: 'checkin' })).toBe('patrol');
    });
  });

  describe('validateScanData', () => {
    it('유효한 스캔 데이터를 통과시킨다', () => {
      const result = validateScanData({ buildingId: 1, buildingName: '본관' });

      expect(result).toEqual({ valid: true });
    });

    it('buildingId가 없으면 실패한다', () => {
      const result = validateScanData({ buildingName: '본관' });

      expect(result.valid).toBe(false);
      expect(result.error).toBe('건물 정보가 없습니다.');
    });

    it('expectedBuildingId와 일치하면 통과한다', () => {
      const result = validateScanData({ buildingId: 1 }, 1);

      expect(result.valid).toBe(true);
    });

    it('expectedBuildingId와 불일치하면 실패한다', () => {
      const result = validateScanData({ buildingId: 1 }, 2);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('선택한 건물의 정보와 일치하지 않습니다.');
    });

    it('expectedBuildingId가 없으면 buildingId만 확인한다', () => {
      const result = validateScanData({ buildingId: 999 });

      expect(result.valid).toBe(true);
    });
  });

  describe('formatScanData', () => {
    it('전체 경로를 포맷팅한다', () => {
      const data: ScanData = {
        buildingName: '본관',
        buildingFloorName: '3층',
        buildingFloorZoneName: 'A구역',
      };

      expect(formatScanData(data)).toBe('본관 > 3층 > A구역');
    });

    it('설비 정보를 포함한다', () => {
      const data: ScanData = {
        buildingName: '본관',
        facilityName: '에어컨 1호기',
      };

      expect(formatScanData(data)).toBe('본관 > 설비: 에어컨 1호기');
    });

    it('빈 데이터는 빈 문자열을 반환한다', () => {
      expect(formatScanData({})).toBe('');
    });

    it('건물명만 있으면 건물명만 반환한다', () => {
      expect(formatScanData({ buildingName: '본관' })).toBe('본관');
    });

    it('층/구역만 있으면 해당 정보만 반환한다', () => {
      const data: ScanData = {
        buildingFloorName: '5층',
        buildingFloorZoneName: 'B구역',
      };

      expect(formatScanData(data)).toBe('5층 > B구역');
    });
  });

  describe('parseNdefMessage', () => {
    it('NDEF 페이로드에서 텍스트를 추출한다', () => {
      // "HELLO" = [72, 69, 76, 76, 79]
      const payload = [0x02, 0x65, 0x6E, 72, 69, 76, 76, 79]; // status, 'e', 'n', H, E, L, L, O

      const result = parseNdefMessage(payload);

      expect(result).toBe('HELLO');
    });

    it('빈 페이로드는 빈 문자열을 반환한다', () => {
      const payload = [0x02, 0x65, 0x6E]; // 헤더만

      expect(parseNdefMessage(payload)).toBe('');
    });

    it('한글 유니코드 문자를 처리한다', () => {
      // '가' = 0xAC00
      const payload = [0x02, 0x6B, 0x6F, 0xAC00];

      const result = parseNdefMessage(payload);

      expect(result).toBe('가');
    });
  });
});

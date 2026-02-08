/**
 * 순찰 목록 Mock 데이터
 */
import type { PatrolDTO, PatrolDetailDTO } from '../types/patrol.types';

/**
 * Mock 순찰 데이터
 */
export const mockPatrols: PatrolDTO[] = [
  {
    id: 1,
    name: 'A동 정기순찰',
    state: 'PROCESSING',
    stateName: '진행중',
    buildingName: 'A동',
    floorCount: 5,
    completedFloors: 2,
    totalCheckpoints: 20,
    completedCheckpoints: 8,
    scheduledDate: '2026-02-08',
    isToday: true,
  },
  {
    id: 2,
    name: 'B동 야간순찰',
    state: 'ISSUE',
    stateName: '미실시',
    buildingName: 'B동',
    floorCount: 3,
    completedFloors: 0,
    totalCheckpoints: 15,
    completedCheckpoints: 0,
    scheduledDate: '2026-02-08',
    isToday: true,
  },
  {
    id: 3,
    name: 'C동 주간순찰',
    state: 'COMPLETED',
    stateName: '완료',
    buildingName: 'C동',
    floorCount: 4,
    completedFloors: 4,
    totalCheckpoints: 16,
    completedCheckpoints: 16,
    scheduledDate: '2026-02-08',
    isToday: true,
  },
  {
    id: 4,
    name: 'D동 정기점검',
    state: 'ISSUE',
    stateName: '미실시',
    buildingName: 'D동',
    floorCount: 6,
    completedFloors: 0,
    totalCheckpoints: 24,
    completedCheckpoints: 0,
    scheduledDate: '2026-02-09',
    isToday: false,
  },
  {
    id: 5,
    name: 'E동 안전순찰',
    state: 'PROCESSING',
    stateName: '진행중',
    buildingName: 'E동',
    floorCount: 7,
    completedFloors: 3,
    totalCheckpoints: 28,
    completedCheckpoints: 12,
    scheduledDate: '2026-02-09',
    isToday: false,
  },
  {
    id: 6,
    name: 'F동 일일순찰',
    state: 'COMPLETED',
    stateName: '완료',
    buildingName: 'F동',
    floorCount: 5,
    completedFloors: 5,
    totalCheckpoints: 20,
    completedCheckpoints: 20,
    scheduledDate: '2026-02-07',
    isToday: false,
  },
];

/**
 * Mock 순찰 상세 데이터
 */
export const mockPatrolDetails: Record<number, PatrolDetailDTO> = {
  1: {
    id: 1,
    name: 'A동 정기순찰',
    state: 'PROCESSING',
    stateName: '진행중',
    buildingName: 'A동',
    floorCount: 3,
    completedFloors: 1,
    totalCheckpoints: 8,
    completedCheckpoints: 4,
    scheduledDate: '2026-02-08',
    isToday: true,
    floors: [
      {
        buildingFloorId: 1,
        buildingFloorName: '1층',
        completionRate: 100,
        zones: [
          {
            buildingFloorZoneId: 101,
            buildingFloorZoneName: '로비',
            isCompleted: true,
            checkpoints: [
              {
                id: 1,
                name: '소화기 점검',
                status: 'COMPLETED',
                itemCount: 3,
                completedItemCount: 3,
              },
              {
                id: 2,
                name: '비상구 점검',
                status: 'COMPLETED',
                itemCount: 2,
                completedItemCount: 2,
              },
            ],
          },
          {
            buildingFloorZoneId: 102,
            buildingFloorZoneName: '주차장',
            isCompleted: true,
            checkpoints: [
              {
                id: 3,
                name: 'CCTV 확인',
                status: 'COMPLETED',
                itemCount: 4,
                completedItemCount: 4,
              },
              {
                id: 4,
                name: '조명 점검',
                status: 'COMPLETED',
                itemCount: 3,
                completedItemCount: 3,
              },
            ],
          },
        ],
      },
      {
        buildingFloorId: 2,
        buildingFloorName: '2층',
        completionRate: 0,
        zones: [
          {
            buildingFloorZoneId: 201,
            buildingFloorZoneName: '사무실',
            isCompleted: false,
            checkpoints: [
              {
                id: 5,
                name: '화재경보기 점검',
                status: 'PENDING',
                itemCount: 2,
                completedItemCount: 0,
              },
              {
                id: 6,
                name: '창문 잠금 확인',
                status: 'PENDING',
                itemCount: 5,
                completedItemCount: 0,
              },
            ],
          },
        ],
      },
      {
        buildingFloorId: 3,
        buildingFloorName: '3층',
        completionRate: 0,
        zones: [
          {
            buildingFloorZoneId: 301,
            buildingFloorZoneName: '회의실',
            isCompleted: false,
            checkpoints: [
              {
                id: 7,
                name: '전기설비 점검',
                status: 'PENDING',
                itemCount: 3,
                completedItemCount: 0,
              },
              {
                id: 8,
                name: '공조기 점검',
                status: 'PENDING',
                itemCount: 2,
                completedItemCount: 0,
              },
            ],
          },
        ],
      },
    ],
  },
  2: {
    id: 2,
    name: 'B동 야간순찰',
    state: 'ISSUE',
    stateName: '미실시',
    buildingName: 'B동',
    floorCount: 2,
    completedFloors: 0,
    totalCheckpoints: 6,
    completedCheckpoints: 0,
    scheduledDate: '2026-02-08',
    isToday: true,
    floors: [
      {
        buildingFloorId: 11,
        buildingFloorName: '1층',
        completionRate: 0,
        zones: [
          {
            buildingFloorZoneId: 1101,
            buildingFloorZoneName: '출입구',
            isCompleted: false,
            checkpoints: [
              {
                id: 21,
                name: '외부 조명 점검',
                status: 'PENDING',
                itemCount: 4,
                completedItemCount: 0,
              },
              {
                id: 22,
                name: '도어락 확인',
                status: 'PENDING',
                itemCount: 2,
                completedItemCount: 0,
              },
            ],
          },
        ],
      },
      {
        buildingFloorId: 12,
        buildingFloorName: '2층',
        completionRate: 0,
        zones: [
          {
            buildingFloorZoneId: 1201,
            buildingFloorZoneName: '복도',
            isCompleted: false,
            checkpoints: [
              {
                id: 23,
                name: '비상등 점검',
                status: 'PENDING',
                itemCount: 3,
                completedItemCount: 0,
              },
              {
                id: 24,
                name: '소화전 점검',
                status: 'PENDING',
                itemCount: 2,
                completedItemCount: 0,
              },
            ],
          },
        ],
      },
    ],
  },
};

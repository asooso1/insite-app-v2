/**
 * 일상업무 Mock 데이터
 */
import type { PersonalTaskDTO, PersonalTaskDetailDTO, TeamInfo } from '../types';

/**
 * Mock 팀 데이터
 */
export const mockTeams: TeamInfo[] = [
  { id: '', name: '전체 팀' },
  { id: 1, name: '시설관리팀' },
  { id: 2, name: '청소팀' },
  { id: 3, name: '환경관리팀' },
  { id: 4, name: '안전관리팀' },
];

/**
 * Mock 일상업무 데이터
 */
export const mockPersonalTasks: PersonalTaskDTO[] = [
  {
    id: 1,
    personalWorkOrderId: 1,
    title: '회의실 청소 및 정리',
    content: '3층 회의실 청소 및 의자 정리',
    status: 'UNCONFIRMED',
    state: '미확인',
    statusName: '미확인',
    type: '일상업무',
    scheduleStartDate: '2026-02-10',
    scheduleEndDate: '2026-02-10',
    createdAt: '2026-02-09 09:00:00',
    writerInfo: {
      id: 101,
      name: '김철수',
      writeDate: '2026-02-09 09:00:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '김철수',
    assigneeName: '이영희',
    teamName: '시설관리팀',
  },
  {
    id: 2,
    personalWorkOrderId: 2,
    title: '엘리베이터 청소',
    content: '전층 엘리베이터 내부 청소 및 버튼 소독',
    status: 'CONFIRMED',
    state: '확인 완료',
    statusName: '확인완료',
    type: '일상업무',
    scheduleStartDate: '2026-02-09',
    scheduleEndDate: '2026-02-09',
    createdAt: '2026-02-08 14:00:00',
    writerInfo: {
      id: 102,
      name: '박민수',
      writeDate: '2026-02-08 14:00:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '박민수',
    assigneeName: '최지훈',
    teamName: '청소팀',
    confirmedAt: '2026-02-09 16:30:00',
    confirmedByName: '최지훈',
  },
  {
    id: 3,
    personalWorkOrderId: 3,
    title: '화장실 소모품 보충',
    content: '2층 화장실 휴지, 비누, 핸드타올 보충',
    status: 'UNCONFIRMED',
    state: '미확인',
    statusName: '미확인',
    type: '일상업무',
    scheduleStartDate: '2026-02-10',
    scheduleEndDate: '2026-02-10',
    createdAt: '2026-02-09 11:00:00',
    writerInfo: {
      id: 103,
      name: '정수진',
      writeDate: '2026-02-09 11:00:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '정수진',
    assigneeName: '김민준',
    teamName: '시설관리팀',
  },
  {
    id: 4,
    personalWorkOrderId: 4,
    title: '주차장 청소',
    content: '지하 1층 주차장 바닥 청소 및 쓰레기 수거',
    status: 'CONFIRMED',
    state: '확인 완료',
    statusName: '확인완료',
    type: '일상업무',
    scheduleStartDate: '2026-02-08',
    scheduleEndDate: '2026-02-08',
    createdAt: '2026-02-07 15:00:00',
    writerInfo: {
      id: 104,
      name: '이서연',
      writeDate: '2026-02-07 15:00:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '이서연',
    assigneeName: '박준호',
    teamName: '청소팀',
    confirmedAt: '2026-02-08 18:00:00',
    confirmedByName: '박준호',
  },
  {
    id: 5,
    personalWorkOrderId: 5,
    title: '로비 화분 관리',
    content: '1층 로비 화분 물주기 및 상태 확인',
    status: 'UNCONFIRMED',
    state: '미확인',
    statusName: '미확인',
    type: '일상업무',
    scheduleStartDate: '2026-02-10',
    scheduleEndDate: '2026-02-10',
    createdAt: '2026-02-09 10:30:00',
    writerInfo: {
      id: 105,
      name: '윤지혜',
      writeDate: '2026-02-09 10:30:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '윤지혜',
    assigneeName: '강동현',
    teamName: '환경관리팀',
  },
  {
    id: 6,
    personalWorkOrderId: 6,
    title: '사무실 쓰레기 수거',
    content: '5층 사무실 일반쓰레기, 재활용 분리수거',
    status: 'CONFIRMED',
    state: '확인 완료',
    statusName: '확인완료',
    type: '일상업무',
    scheduleStartDate: '2026-02-09',
    scheduleEndDate: '2026-02-09',
    createdAt: '2026-02-08 16:00:00',
    writerInfo: {
      id: 106,
      name: '최민수',
      writeDate: '2026-02-08 16:00:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '최민수',
    assigneeName: '송하윤',
    teamName: '청소팀',
    confirmedAt: '2026-02-09 19:00:00',
    confirmedByName: '송하윤',
  },
  {
    id: 7,
    personalWorkOrderId: 7,
    title: '복도 조명 점검',
    content: '4층 복도 LED 조명 상태 확인 및 교체',
    status: 'UNCONFIRMED',
    state: '미확인',
    statusName: '미확인',
    type: '일상업무',
    scheduleStartDate: '2026-02-11',
    scheduleEndDate: '2026-02-11',
    createdAt: '2026-02-09 13:00:00',
    writerInfo: {
      id: 107,
      name: '한지우',
      writeDate: '2026-02-09 13:00:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '한지우',
    assigneeName: '조은서',
    teamName: '시설관리팀',
  },
  {
    id: 8,
    personalWorkOrderId: 8,
    title: '창문 청소',
    content: '6층 사무실 창문 내외부 청소',
    status: 'UNCONFIRMED',
    state: '미확인',
    statusName: '미확인',
    type: '일상업무',
    scheduleStartDate: '2026-02-12',
    scheduleEndDate: '2026-02-12',
    createdAt: '2026-02-09 14:30:00',
    writerInfo: {
      id: 108,
      name: '권도윤',
      writeDate: '2026-02-09 14:30:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '권도윤',
    assigneeName: '신예은',
    teamName: '청소팀',
  },
  {
    id: 9,
    personalWorkOrderId: 9,
    title: '에어컨 필터 청소',
    content: '7층 사무실 에어컨 필터 청소 및 교체',
    status: 'CONFIRMED',
    state: '확인 완료',
    statusName: '확인완료',
    type: '일상업무',
    scheduleStartDate: '2026-02-07',
    scheduleEndDate: '2026-02-07',
    createdAt: '2026-02-06 10:00:00',
    writerInfo: {
      id: 109,
      name: '홍길동',
      writeDate: '2026-02-06 10:00:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '홍길동',
    assigneeName: '이영희',
    teamName: '시설관리팀',
    confirmedAt: '2026-02-07 17:30:00',
    confirmedByName: '이영희',
  },
  {
    id: 10,
    personalWorkOrderId: 10,
    title: '비상구 점검',
    content: '전층 비상구 출입문 및 표지판 상태 확인',
    status: 'UNCONFIRMED',
    state: '미확인',
    statusName: '미확인',
    type: '일상업무',
    scheduleStartDate: '2026-02-10',
    scheduleEndDate: '2026-02-10',
    createdAt: '2026-02-09 09:30:00',
    writerInfo: {
      id: 110,
      name: '김민준',
      writeDate: '2026-02-09 09:30:00',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리사',
    },
    writerName: '김민준',
    assigneeName: '박준호',
    teamName: '안전관리팀',
  },
];

/**
 * Mock 일상업무 상세 데이터
 */
export const mockPersonalTaskDetail: PersonalTaskDetailDTO = {
  id: 1,
  personalWorkOrderId: 1,
  title: '회의실 청소 및 정리',
  content: '3층 회의실 청소 및 의자 정리',
  description: '3층 회의실 청소 및 의자 정리. 바닥 청소, 테이블 닦기, 의자 정리 포함.',
  status: 'UNCONFIRMED',
  state: '미확인',
  statusName: '미확인',
  type: '일상업무',
  scheduleStartDate: '2026-02-10',
  scheduleEndDate: '2026-02-10',
  createdAt: '2026-02-09 09:00:00',
  location: '3F > 대회의실',
  buildingName: '본사빌딩',
  baseArea: '서울시',
  facilityName: '대회의실 에어컨',
  writerInfo: {
    id: 101,
    name: '김철수',
    writeDate: '2026-02-09 09:00:00',
    companyName: 'HDC아이콘트롤스',
    role: '시설관리사',
  },
  writerName: '김철수',
  assigneeName: '이영희',
  teamName: '시설관리팀',
  confirmInfo: {
    id: 201,
    confirmAccountName: '이영희',
    companyName: 'HDC아이콘트롤스',
    role: '시설관리팀장',
  },
  images: [
    { id: 1, imageUrl: '/images/personal-task/1-1.jpg' },
    { id: 2, imageUrl: '/images/personal-task/1-2.jpg' },
  ],
  isAlertPush: true,
};

/**
 * ID로 Mock 상세 데이터 가져오기
 */
export function getMockPersonalTaskDetail(id: number): PersonalTaskDetailDTO | undefined {
  const task = mockPersonalTasks.find((t) => t.id === id);
  if (!task) return undefined;

  // 기본 데이터에 상세 정보 추가
  return {
    ...task,
    description: task.content,
    location:
      task.id === 1
        ? '3F > 대회의실'
        : task.id === 2
          ? '전층 엘리베이터'
          : task.id === 3
            ? '2F > 화장실'
            : undefined,
    buildingName: '본사빌딩',
    baseArea: '서울시',
    confirmInfo: {
      id: 200 + task.id,
      confirmAccountName: task.confirmedByName || task.assigneeName || '관리자',
      companyName: 'HDC아이콘트롤스',
      role: '시설관리팀장',
    },
    images:
      task.id <= 3
        ? [
            { id: 1, imageUrl: `/images/personal-task/${task.id}-1.jpg` },
            { id: 2, imageUrl: `/images/personal-task/${task.id}-2.jpg` },
          ]
        : [],
    isAlertPush: true,
  };
}

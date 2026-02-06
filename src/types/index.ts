// ============================================
// Common Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  siteId?: string;
  siteName?: string;
  department?: string;
  position?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'worker' | 'guest';

export interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
  fcmToken?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  requiresApproval: boolean;
}

export interface GuestLoginRequest {
  nfcTagId: string;
  deviceId: string;
}

// ============================================
// Work Order Types
// ============================================

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: Priority;
  type: WorkOrderType;
  assigneeId?: string;
  assigneeName?: string;
  siteId: string;
  siteName: string;
  location?: string;
  equipmentId?: string;
  equipmentName?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  attachments: Attachment[];
  checklistItems: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type WorkOrderType = 'maintenance' | 'repair' | 'inspection' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface WorkResult {
  workOrderId: string;
  description: string;
  attachments: string[]; // File URIs to upload
}

// ============================================
// Patrol Types
// ============================================

export interface Patrol {
  id: string;
  name: string;
  description?: string;
  status: PatrolStatus;
  siteId: string;
  siteName: string;
  routeId: string;
  routeName: string;
  assigneeId: string;
  assigneeName: string;
  scheduledDate: string;
  scheduledTime?: string;
  startedAt?: string;
  completedAt?: string;
  checkpoints: Checkpoint[];
  createdAt: string;
}

export type PatrolStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed';

export interface Checkpoint {
  id: string;
  name: string;
  description?: string;
  nfcTagId: string;
  qrCode?: string;
  order: number;
  isScanned: boolean;
  scannedAt?: string;
  scannedBy?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface PatrolScanResult {
  patrolId: string;
  checkpointId: string;
  nfcTagId: string;
  scannedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardSummary {
  todayWorkOrders: number;
  pendingWorkOrders: number;
  completedWorkOrders: number;
  todayPatrols: number;
  completedPatrols: number;
  activeAlarms: number;
}

export interface EnergyData {
  date: string;
  electricity: number;
  gas: number;
  water: number;
  total: number;
}

export interface Alarm {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

// ============================================
// Filter & Search Types
// ============================================

export interface WorkOrderFilter {
  status?: WorkOrderStatus[];
  priority?: Priority[];
  type?: WorkOrderType[];
  assigneeId?: string;
  siteId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PatrolFilter {
  status?: PatrolStatus[];
  siteId?: string;
  assigneeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

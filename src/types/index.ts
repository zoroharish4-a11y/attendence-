// types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  name: string;
  department: string;
  employeeId?: string;
  lastPasswordChange: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  permissions: string[];
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  semester: number;
  department: string;
  rollNumber: string;
  phoneNumber: string;
  dateOfAdmission: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subject: string;
  facultyId: string;
  facultyName: string;
  period: number;
  timestamp: string;
}

export interface Circular {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  targetAudience: 'all' | 'students' | 'faculty';
  departments?: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  facultyId: string;
  facultyName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  error: string | null;
  user: Omit<User, 'password'> | null;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  username: string;
  role: string;
  permissions: string[];
  department: string;
  loginTime: string;
  lastActivity: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  error?: string;
  session?: UserSession;
  user?: User;
}

export type Permission = 
  | 'all'
  | 'attendance:read'
  | 'attendance:write'
  | 'students:read'
  | 'students:write'
  | 'circulars:read'
  | 'circulars:write'
  | 'subjects:read'
  | 'subjects:write'
  | 'profile:read'
  | 'profile:write';

export interface PasswordChangeRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
}
// src/data/mockData.ts

import { User, Student, AttendanceRecord, Subject, Circular, LoginCredentials, AuthResponse, UserSession, SessionValidationResult } from './types';

// ===== MOCK ARRAYS =====
export const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'hashed_admin123', // mock hashed password
    role: 'admin',
    name: 'Admin User',
    lastPasswordChange: new Date().toISOString(),
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'u2',
    username: 'faculty1',
    email: 'harish@gmail.com',
    password: '123',
    role: 'faculty',
    name: 'Faculty One',
    department: 'CSE',
    lastPasswordChange: new Date().toISOString(),
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const mockStudents: Student[] = [
  {
    id: 's1',
    studentId: 'ST001',
    name: 'John Doe',
    email: 'john@example.com',
    course: 'B.Tech',
    semester: 3,
    department: 'CSE',
    rollNumber: 'CSE001',
    phoneNumber: '1234567890',
    dateOfAdmission: '2023-07-01',
    isActive: true
  },
  {
    id: 's2',
    studentId: 'ST002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    course: 'B.Tech',
    semester: 3,
    department: 'CSE',
    rollNumber: 'CSE002',
    phoneNumber: '9876543210',
    dateOfAdmission: '2023-07-01',
    isActive: true
  }
];

export const mockSubjects: Subject[] = [
  {
    id: 'sub1',
    name: 'Mathematics',
    code: 'MATH101',
    department: 'CSE',
    semester: 3,
    credits: 3,
    facultyId: 'u2',
    facultyName: 'Faculty One'
  }
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'a1',
    studentId: 's1',
    studentName: 'John Doe',
    date: '2025-09-30',
    status: 'present',
    subject: 'Mathematics',
    facultyId: 'u2',
    facultyName: 'Faculty One',
    period: 1,
    timestamp: new Date().toISOString()
  }
];

export const mockCirculars: Circular[] = [
  {
    id: 'c1',
    title: 'Holiday Notice',
    content: 'College will remain closed tomorrow.',
    category: 'Notice',
    priority: 'medium',
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
    isActive: true,
    targetAudience: 'all'
  }
];
// ===== PASSWORD UTILS =====
export const passwordUtils = {
  validatePassword: (password: string): boolean => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return password.length >= minLength && hasUppercase && hasLowercase && hasNumber;
  }
};

export const PASSWORD_REQUIREMENTS = [
  "At least 8 characters",
  "At least one uppercase letter",
  "At least one lowercase letter",
  "At least one number"
];

// ===== AUTH UTILS =====
export const authUtils = {
  validateLogin: (credentials: LoginCredentials) => {
    const errors: string[] = [];
    const username = credentials.username?.trim() || '';
    const password = credentials.password?.trim() || '';

    if (!username) errors.push('Username is required');
    if (!password) errors.push('Password is required');
    return { isValid: errors.length === 0, errors };
  },
  authenticate: (username: string, password: string): AuthResponse => {
    const user = mockUsers.find(u => u.username === username || u.email === username);
    if (!user || user.password !== `hashed_${password}`) return { success: false, error: 'Invalid username or password', user: null };
    return { success: true, error: null, user };
  },
  changePassword: (userId: string, newPassword: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    user.password = `hashed_${newPassword}`;
    user.mustChangePassword = false;
    user.lastPasswordChange = new Date().toISOString();
    return { success: true };
  }
};

// ===== SESSION MANAGEMENT =====
const sessionStore = new Map<string, UserSession>();

export const sessionManagement = {
  createSession: (user: Omit<User, 'password'>): UserSession => {
    const sessionId = `sess_${Date.now()}`;
    const session: UserSession = { sessionId, userId: user.id, username: user.username, role: user.role, permissions: [], loginTime: new Date().toISOString(), lastActivity: new Date().toISOString(), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };
    sessionStore.set(sessionId, session);
    return session;
  },
  validateSession: (sessionId: string): SessionValidationResult => {
    const session = sessionStore.get(sessionId);
    if (!session) return { isValid: false, error: 'Session not found' };
    if (new Date(session.expiresAt) < new Date()) { sessionStore.delete(sessionId); return { isValid: false, error: 'Session expired' }; }
    return { isValid: true, session };
  },
  destroySession: (sessionId: string) => sessionStore.delete(sessionId)
};

// ===== EXPORT EVERYTHING =====
export default {
  mockUsers,
  mockStudents,
  mockSubjects,
  mockAttendanceRecords,
  mockCirculars,
  authUtils,
  sessionManagement
};

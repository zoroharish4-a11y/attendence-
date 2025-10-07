import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';
import { User, AttendanceRecord, Student } from '../types';
import { mockStudents, mockAttendanceRecords } from '../data/mockData';
import { AttendanceCalculator } from '../utils/calculations';

interface DashboardProps {
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [students] = useState<Student[]>(mockStudents);
  const [attendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const totalStudents = students.length;
  const todayRecords = attendanceRecords.filter(
    record => record.date === new Date().toISOString().split('T')[0]
  );
  const presentToday = todayRecords.filter(r => r.status === 'present').length;
  const lateToday = todayRecords.filter(r => r.status === 'late').length;
  const absentToday = totalStudents - presentToday - lateToday;
  const classAverage = AttendanceCalculator.calculateClassAverage(attendanceRecords);
  const lowAttendanceAlerts = AttendanceCalculator.getAttendanceThresholdAlerts(attendanceRecords);

  if (currentUser.role === 'student') {
    // Student Dashboard
    const studentStats = AttendanceCalculator.calculateStudentStats(
      currentUser.studentId!,
      attendanceRecords
    );
    const monthlyTrends = AttendanceCalculator.getMonthlyTrends(
      attendanceRecords,
      currentUser.studentId!
    );

    return (
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {currentUser.name}!
          </h2>
          <div className="flex items-center space-x-4 text-blue-100">
            <p className="text-lg">{formatDate(currentTime)}</p>
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="text-white font-mono text-lg">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentStats?.percentage || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentStats?.totalClasses || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentStats?.presentClasses || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentStats?.absentClasses || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Attendance Status
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                (studentStats?.percentage || 0) >= 75 ? 'bg-green-500' : 
                (studentStats?.percentage || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-lg font-medium">
                {(studentStats?.percentage || 0) >= 75 ? 'Good Standing' : 
                 (studentStats?.percentage || 0) >= 60 ? 'Warning' : 'Critical'}
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {studentStats?.percentage || 0}%
            </span>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                (studentStats?.percentage || 0) >= 75 ? 'bg-green-500' : 
                (studentStats?.percentage || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${studentStats?.percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Faculty Dashboard
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {currentUser.name}!
        </h2>
        <div className="flex items-center space-x-4 text-blue-100">
          <p className="text-lg">{formatDate(currentTime)}</p>
          <div className="bg-white/20 px-4 py-2 rounded-full">
            <span className="text-white font-mono text-lg">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-gray-900">{presentToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late Today</p>
              <p className="text-2xl font-bold text-gray-900">{lateToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900">{absentToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Average */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            Class Performance
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{classAverage}%</div>
            <p className="text-gray-600">Average Attendance</p>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${classAverage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Low Attendance Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
            Attendance Alerts
          </h3>
          <div className="space-y-3">
            {lowAttendanceAlerts.slice(0, 3).map((alert) => (
              <div key={alert.studentId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{alert.studentName}</p>
                  <p className="text-sm text-gray-600">{alert.studentId}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-red-600">{alert.percentage}%</span>
                  <p className="text-xs text-gray-500">Below threshold</p>
                </div>
              </div>
            ))}
            {lowAttendanceAlerts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No attendance alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Attendance Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-blue-600" />
          Today's Attendance Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{lateToday}</div>
            <div className="text-sm text-gray-600">Late</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{absentToday}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
        </div>
      </div>
    </div>
  );
};
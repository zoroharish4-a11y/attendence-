import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  AlertTriangle,
  FileText,
  Printer
} from 'lucide-react';
import { AttendanceRecord, Student, AttendanceStats } from '../types';
import { mockAttendanceRecords, mockStudents } from '../data/mockData';
import { AttendanceCalculator } from '../utils/calculations';
import { ExportUtils } from '../utils/exportUtils';
import { StorageManager } from '../utils/storage';

export const Reports: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [students] = useState<Student[]>(mockStudents);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [reportType, setReportType] = useState<'overview' | 'detailed' | 'alerts'>('overview');

  const storage = StorageManager.getInstance();

  useEffect(() => {
    const savedRecords = storage.getAttendanceRecords();
    if (savedRecords.length > 0) {
      setAttendanceRecords(savedRecords);
    }
  }, []);

  const subjects = [...new Set(attendanceRecords.map(r => r.subject))];
  const courses = [...new Set(students.map(s => s.course))];
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const getFilteredRecords = () => {
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const matchesMonth = recordDate.getMonth() + 1 === selectedMonth;
      const matchesYear = recordDate.getFullYear() === selectedYear;
      const matchesSubject = selectedSubject === 'all' || record.subject === selectedSubject;
      
      if (selectedCourse !== 'all') {
        const student = students.find(s => s.studentId === record.studentId);
        return matchesMonth && matchesYear && matchesSubject && student?.course === selectedCourse;
      }
      
      return matchesMonth && matchesYear && matchesSubject;
    });
  };

  const getStudentStats = () => {
    const filteredRecords = getFilteredRecords();
    const studentIds = [...new Set(filteredRecords.map(r => r.studentId))];
    
    return studentIds.map(studentId => {
      const student = students.find(s => s.studentId === studentId);
      return AttendanceCalculator.calculateStudentStats(
        studentId,
        filteredRecords,
        selectedSubject === 'all' ? undefined : selectedSubject,
        selectedMonth.toString(),
        selectedYear
      );
    }).filter(stat => stat !== null) as AttendanceStats[];
  };

  const studentStats = getStudentStats();
  const classAverage = AttendanceCalculator.calculateClassAverage(getFilteredRecords());
  const lowAttendanceAlerts = AttendanceCalculator.getAttendanceThresholdAlerts(getFilteredRecords());

  const handleExportCSV = () => {
    ExportUtils.generateAttendanceReport(
      getFilteredRecords(),
      students,
      selectedSubject === 'all' ? undefined : selectedSubject,
      selectedMonth.toString()
    );
  };

  const handlePrintReport = () => {
    const printContent = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .filters { margin-bottom: 20px; background: #f5f5f5; padding: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 10px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>College Attendance Management System</h1>
            <h2>Attendance Report</h2>
          </div>
          <div class="filters">
            <p><strong>Period:</strong> ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}</p>
            <p><strong>Subject:</strong> ${selectedSubject === 'all' ? 'All Subjects' : selectedSubject}</p>
            <p><strong>Course:</strong> ${selectedCourse === 'all' ? 'All Courses' : selectedCourse}</p>
          </div>
          <div class="stats">
            <div class="stat-box">
              <h3>Class Average</h3>
              <p style="font-size: 24px; font-weight: bold;">${classAverage}%</p>
            </div>
            <div class="stat-box">
              <h3>Total Students</h3>
              <p style="font-size: 24px; font-weight: bold;">${studentStats.length}</p>
            </div>
            <div class="stat-box">
              <h3>Low Attendance</h3>
              <p style="font-size: 24px; font-weight: bold;">${lowAttendanceAlerts.length}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Total Classes</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${studentStats.map(stat => `
                <tr>
                  <td>${stat.studentId}</td>
                  <td>${stat.studentName}</td>
                  <td>${stat.totalClasses}</td>
                  <td>${stat.presentClasses}</td>
                  <td>${stat.lateClasses}</td>
                  <td>${stat.absentClasses}</td>
                  <td>${stat.percentage}%</td>
                  <td>${stat.percentage >= 75 ? 'Good' : stat.percentage >= 60 ? 'Warning' : 'Critical'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Attendance Reports</h2>
          <p className="text-gray-600">Analyze attendance data and generate reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrintReport}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2023, 2022].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="alerts">Alerts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{studentStats.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Class Average</p>
              <p className="text-2xl font-bold text-gray-900">{classAverage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{lowAttendanceAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{getFilteredRecords().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'overview' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Late
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentStats.map((stat) => (
                  <tr key={stat.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stat.studentName}</div>
                        <div className="text-sm text-gray-500">{stat.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.totalClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {stat.presentClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                      {stat.lateClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {stat.absentClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 mr-2">
                          {stat.percentage}%
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stat.percentage >= 75 ? 'bg-green-500' :
                              stat.percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        stat.percentage >= 75 ? 'bg-green-100 text-green-800' :
                        stat.percentage >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stat.percentage >= 75 ? 'Good' : stat.percentage >= 60 ? 'Warning' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'alerts' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Low Attendance Alerts (Below 75%)
          </h3>
          
          {lowAttendanceAlerts.length > 0 ? (
            <div className="space-y-4">
              {lowAttendanceAlerts.map((alert) => (
                <div key={alert.studentId} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.studentName}</h4>
                    <p className="text-sm text-gray-600">{alert.studentId}</p>
                    <p className="text-sm text-gray-600">
                      {alert.presentClasses} present out of {alert.totalClasses} classes
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">{alert.percentage}%</div>
                    <div className="text-sm text-gray-600">Attendance</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-600 mb-2">
                <TrendingUp className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600">No low attendance alerts! All students are maintaining good attendance.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Save,
  RotateCcw,
  Filter,
  BookOpen
} from 'lucide-react';
import { Student, AttendanceRecord, Subject } from '../types';
import { mockStudents, mockSubjects, mockAttendanceRecords } from '../data/mockData';
import { StorageManager } from '../utils/storage';

interface AttendanceMarkingProps {
  currentUser: any;
}

export const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ currentUser }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [subjects] = useState<Subject[]>(mockSubjects);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'present' | 'absent' | 'late'}>({});
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [isSaving, setIsSaving] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  const storage = StorageManager.getInstance();

  useEffect(() => {
    const savedRecords = storage.getAttendanceRecords();
    if (savedRecords.length > 0) {
      setAttendanceRecords(savedRecords);
    }
  }, []);

  useEffect(() => {
    // Load existing attendance for selected date, subject, and period
    const existingRecords = attendanceRecords.filter(record => 
      record.date === selectedDate && 
      record.subject === selectedSubject && 
      record.period === selectedPeriod
    );
    
    const existingData: {[key: string]: 'present' | 'absent' | 'late'} = {};
    existingRecords.forEach(record => {
      existingData[record.studentId] = record.status;
    });
    
    setAttendanceData(existingData);
  }, [selectedDate, selectedSubject, selectedPeriod, attendanceRecords]);

  const filteredStudents = students.filter(student => {
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
    const matchesSemester = filterSemester === 'all' || student.semester.toString() === filterSemester;
    return student.isActive && matchesCourse && matchesSemester;
  });

  const courses = [...new Set(students.map(s => s.course))];
  const semesters = [...new Set(students.map(s => s.semester))].sort();

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    const allPresent: {[key: string]: 'present' | 'absent' | 'late'} = {};
    filteredStudents.forEach(student => {
      allPresent[student.studentId] = 'present';
    });
    setAttendanceData(allPresent);
  };

  const markAllAbsent = () => {
    const allAbsent: {[key: string]: 'present' | 'absent' | 'late'} = {};
    filteredStudents.forEach(student => {
      allAbsent[student.studentId] = 'absent';
    });
    setAttendanceData(allAbsent);
  };

  const resetAttendance = () => {
    setAttendanceData({});
  };

  const saveAttendance = async () => {
    if (!selectedSubject) {
      alert('Please select a subject');
      return;
    }

    setIsSaving(true);

    // Remove existing records for this date, subject, and period
    const filteredRecords = attendanceRecords.filter(record => 
      !(record.date === selectedDate && record.subject === selectedSubject && record.period === selectedPeriod)
    );

    // Add new records
    const newRecords: AttendanceRecord[] = Object.entries(attendanceData).map(([studentId, status]) => {
      const student = students.find(s => s.studentId === studentId);
      return {
        id: `${selectedDate}-${studentId}-${selectedSubject}-${selectedPeriod}`,
        studentId,
        studentName: student?.name || '',
        date: selectedDate,
        status,
        subject: selectedSubject,
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        period: selectedPeriod,
        timestamp: new Date().toISOString()
      };
    });

    const updatedRecords = [...filteredRecords, ...newRecords];
    setAttendanceRecords(updatedRecords);
    storage.saveAttendanceRecords(updatedRecords);

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    
    alert('Attendance saved successfully!');
  };

  const getAttendanceStats = () => {
    const total = filteredStudents.length;
    const marked = Object.keys(attendanceData).length;
    const present = Object.values(attendanceData).filter(status => status === 'present').length;
    const late = Object.values(attendanceData).filter(status => status === 'late').length;
    const absent = Object.values(attendanceData).filter(status => status === 'absent').length;
    
    return { total, marked, present, late, absent };
  };

  const stats = getAttendanceStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Mark Attendance</h2>
        <p className="text-gray-600">Record student attendance for classes</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
  value={selectedSubject}
  onChange={(e) => setSelectedSubject(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="">Select Subject</option>

  {/* Manually added subjects */}
  <option value="math">BA.ECONOMICS (MATH101)</option>
  <option value="science">BA.TAMIL (SCI201)</option>
  <option value="english">BA.ENGLISH (ENG301)</option>
  <option value="computer">Computer Science (CS401)</option>

  {/* Dynamic subjects from array */}
  {subjects.map(subject => (
    <option key={subject.id} value={subject.name}>
      {subject.name} ({subject.code})
    </option>
  ))}

  {/* Add Subject option */}
  
</select>

          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period *
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1,2,3,4,5,].map(period => (
                <option key={period} value={period}>Period {period}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(selectedDate).toLocaleDateString()}
              </div>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-1" />
                Period {selectedPeriod}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Course
            </label>
            <select
  value={filterCourse}
  onChange={(e) => setFilterCourse(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="all">All Courses</option>

  {/* Manually added courses */}
  <option value="bca">BCA</option>
  <option value="bsc">B.Sc</option>
  <option value="bcom">B.Com</option>
  <option value="ba">B.A</option>
  <option value="msc">Msc</option>

  {/* Dynamic courses from array */}
  {courses.map(course => (
    <option key={course} value={course}>{course}</option>
  ))}

  {/* Add Course option */}
  
</select>

          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Semester
            </label>
           
           <select
  value={filterSemester}
  onChange={(e) => setFilterSemester(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="all">All Semesters</option>

  {/* Manually added semesters */}
  <option value="1">Semester 1</option>
  <option value="2">Semester 2</option>
  <option value="3">Semester 3</option>
  <option value="4">Semester 4</option>
  <option value="5">Semester 5</option>
 <option value="6">Semester 6</option> 
  {/* Semester 6 stopped / removed */}

  {/* Dynamic semesters from array */}
  {semesters.map(semester => (
    <option key={semester} value={semester}>
      Semester {semester}
    </option>
  ))}

  {/* Add Semester option */}
  <option value="add"></option>
</select>

          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={markAllPresent}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              All Present
            </button>
            <button
              onClick={markAllAbsent}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              All Absent
            </button>
            <button
              onClick={resetAttendance}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 pt-4 border-t">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Students</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">{stats.marked}</div>
            <div className="text-xs text-gray-600">Marked</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{stats.present}</div>
            <div className="text-xs text-gray-600">Present</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{stats.late}</div>
            <div className="text-xs text-gray-600">Late</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{stats.absent}</div>
            <div className="text-xs text-gray-600">Absent</div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Student List ({filteredStudents.length} students)
          </h3>
          <button
            onClick={saveAttendance}
            disabled={isSaving || !selectedSubject}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{student.studentId}</span>
                      <span>{student.course}</span>
                      <span>Sem {student.semester}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAttendanceChange(student.studentId, 'present')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      attendanceData[student.studentId] === 'present'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Present</span>
                  </button>
                  
                  <button
                    onClick={() => handleAttendanceChange(student.studentId, 'late')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      attendanceData[student.studentId] === 'late'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Late</span>
                  </button>
                  
                  <button
                    onClick={() => handleAttendanceChange(student.studentId, 'absent')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      attendanceData[student.studentId] === 'absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found matching the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
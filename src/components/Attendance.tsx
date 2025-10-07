import React, { useState } from 'react';
import { Clock, CheckCircle, LogOut, Calendar } from 'lucide-react';
import { mockAttendanceRecords } from '../data/mockData';

interface AttendanceProps {
  currentUser: any;
}

export const Attendance: React.FC<AttendanceProps> = ({ currentUser }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString('en-IN', { hour12: true }));
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    const now = new Date();
    setCheckOutTime(now.toLocaleTimeString('en-IN', { hour12: true }));
    setIsCheckedIn(false);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const userAttendanceRecords = mockAttendanceRecords.filter(
    record => record.employeeId === currentUser.employeeId
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h2>
        <p className="text-gray-600">{getCurrentDate()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Check-in/Check-out Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className={`p-6 rounded-full ${isCheckedIn ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <Clock className={`h-16 w-16 ${isCheckedIn ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isCheckedIn ? 'You are checked in' : 'Ready to start your day?'}
              </h3>
              <p className="text-gray-600">
                {isCheckedIn 
                  ? 'Have a productive day at work!' 
                  : 'Click the button below to check in'
                }
              </p>
            </div>

            <div className="space-y-6">
              {!isCheckedIn && !checkInTime && (
                <button
                  onClick={handleCheckIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>Check In</span>
                </button>
              )}

              {isCheckedIn && (
                <button
                  onClick={handleCheckOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <LogOut className="h-6 w-6" />
                  <span>Check Out</span>
                </button>
              )}

              {/* Time Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Check-in Time</p>
                  <p className="text-xl font-bold text-gray-900">
                    {checkInTime || '-- : --'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Check-out Time</p>
                  <p className="text-xl font-bold text-gray-900">
                    {checkOutTime || '-- : --'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Today's Status
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  isCheckedIn ? 'text-green-600' : checkOutTime ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {isCheckedIn ? 'Checked In' : checkOutTime ? 'Completed' : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hours Worked:</span>
                <span className="font-medium text-gray-900">
                  {checkInTime && checkOutTime ? '8.5 hrs' : isCheckedIn ? 'In Progress...' : '0 hrs'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium text-gray-900">{currentUser.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium text-gray-900">{currentUser.position}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">This Month</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Present Days:</span>
                <span className="font-bold text-blue-900">22</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Absent Days:</span>
                <span className="font-bold text-blue-900">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Late Days:</span>
                <span className="font-bold text-blue-900">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Attendance Rate:</span>
                <span className="font-bold text-green-600">95.6%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
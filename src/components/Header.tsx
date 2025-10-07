import React from 'react';
import { GraduationCap, User, LogOut, Bell } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'student':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-lg border-b-4 border-blue-600">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                College Attendance System
              </h1>
              <p className="text-sm text-gray-600">
                RK NAGAR GOVERNMENT COLLEGE 
              </p>
            </div>
          </div>
          
          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
              <div className="bg-blue-600 p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{currentUser.name}</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(currentUser.role)}`}>
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </span>
                  {currentUser.department && (
                    <span className="text-xs text-gray-500">
                      {currentUser.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
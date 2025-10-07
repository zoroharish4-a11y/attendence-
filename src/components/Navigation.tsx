import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText, 
  Settings,
  BookOpen,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: User;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onViewChange, 
  currentUser 
}) => {
  const facultyMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Mark Attendance', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'circulars', label: 'Circulars', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'my-attendance', label: 'My Attendance', icon: ClipboardList },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'circulars', label: 'Circulars', icon: FileText },
    
  ];

  const menuItems = currentUser.role === 'student' ? studentMenuItems : facultyMenuItems;

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 py-4 px-4 border-b-3 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  currentView === item.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
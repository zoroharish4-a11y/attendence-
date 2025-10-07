import React, { useState } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { AttendanceMarking } from './components/AttendanceMarking';
import { Reports } from './components/Reports';
import { CircularManagement } from './components/CircularManagement';
import { User } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'students':
        return <StudentManagement />;
      case 'attendance':
        return <AttendanceMarking currentUser={currentUser} />;
      case 'reports':
        return <Reports />;
      case 'circulars':
        return <CircularManagement currentUser={currentUser} />;
      case 'my-attendance':
        return <Reports />; // Student view of their attendance
      case 'performance':
        return <Dashboard currentUser={currentUser} />; // Student performance view
      case 'subjects':
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">My Subjects</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Subject information and schedules will be displayed here.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Settings</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">System settings and preferences will be available here.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        currentUser={currentUser}
      />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
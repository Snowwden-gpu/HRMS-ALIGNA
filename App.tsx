
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Leaves } from './pages/Leaves';
import { Payroll } from './pages/Payroll';
import { Profile } from './pages/Profile';
import { Employees } from './pages/Employees';
import { Auth } from './pages/Auth';
import { UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      const savedUser = localStorage.getItem('aligna_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };

    syncSession();
    setIsReady(true);

    window.addEventListener('profile_updated', syncSession);
    return () => window.removeEventListener('profile_updated', syncSession);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('aligna_session', JSON.stringify(userData));
  };

  const handleUpdateSession = (updatedProfile: any) => {
    if (user && user.profile.id === updatedProfile.id) {
      const newSession = { ...user, profile: updatedProfile };
      setUser(newSession);
      localStorage.setItem('aligna_session', JSON.stringify(newSession));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aligna_session');
  };

  if (!isReady) return null;

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Auth onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout user={user} onLogout={handleLogout}><Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/attendance" element={<Attendance user={user} />} />
            <Route path="/leaves" element={<Leaves user={user} />} />
            <Route path="/payroll" element={<Payroll user={user} />} />
            <Route path="/profile" element={<Profile user={user} onUpdateSession={handleUpdateSession} />} />
            <Route path="/profile/:employeeId" element={<Profile user={user} onUpdateSession={handleUpdateSession} />} />
            {user.role === UserRole.ADMIN && (
              <>
                <Route path="/employees" element={<Employees />} />
                <Route path="/analytics" element={<Dashboard user={user} />} />
              </>
            )}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes></Layout>}>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;

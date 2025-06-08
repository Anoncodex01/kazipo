import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initAuth } from './store/authStore';
import { initTheme } from './store/themeStore';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';

function App() {
  // Initialize auth and theme on app load
  useEffect(() => {
    initAuth();
    initTheme();
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/landing" element={<LandingPage />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
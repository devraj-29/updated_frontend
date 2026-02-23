import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import { C } from './services/constants';

import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NDAPage from './pages/NDAPage';
import PeoplePage from './pages/PeoplePage';
import AssignPage from './pages/AssignPage';
import DocsPage from './pages/DocsPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';
import SigningPortal from './pages/SigningPortal';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedLayout({ user, onLogout, children }) {
  if (!user) return <Navigate to="/login" />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <Sidebar user={user} onLogout={onLogout} />
      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('nda_user');
    const token = localStorage.getItem('nda_access');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
        api.me().then(u => {
          setUser(u);
          localStorage.setItem('nda_user', JSON.stringify(u));
        }).catch(() => { api.clearTokens(); setUser(null); });
      } catch { api.clearTokens(); }
    }
    setChecking(false);
  }, []);

  const handleLogin = (u) => { setUser(u); navigate('/'); };
  const handleLogout = () => { api.logout(); setUser(null); navigate('/login'); };

  // Signing portal — no auth required
  if (location.pathname.startsWith('/sign/')) {
    return <Routes><Route path="/sign/:token" element={<SigningPortal />} /></Routes>;
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.muted }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.accent, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
      <Route path="/sign/:token" element={<SigningPortal />} />
      <Route path="/" element={<ProtectedLayout user={user} onLogout={handleLogout}><DashboardPage /></ProtectedLayout>} />
      <Route path="/ndas" element={<ProtectedLayout user={user} onLogout={handleLogout}><NDAPage user={user} /></ProtectedLayout>} />
      <Route path="/people" element={<ProtectedLayout user={user} onLogout={handleLogout}><PeoplePage user={user} /></ProtectedLayout>} />
      <Route path="/assignments" element={<ProtectedLayout user={user} onLogout={handleLogout}><AssignPage user={user} /></ProtectedLayout>} />
      <Route path="/documents" element={<ProtectedLayout user={user} onLogout={handleLogout}><DocsPage /></ProtectedLayout>} />
      <Route path="/audit" element={<ProtectedLayout user={user} onLogout={handleLogout}><AuditPage /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout user={user} onLogout={handleLogout}><SettingsPage user={user} /></ProtectedLayout>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

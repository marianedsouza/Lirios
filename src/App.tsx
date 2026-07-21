/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider } from './store/useStore';
import { Login } from './components/Login';
import { AdminLayout } from './components/AdminLayout';
import { MemberPortal } from './components/MemberPortal';

type UserState = {
  role: 'admin' | 'member' | null;
  memberId?: string;
};

function AppContent() {
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('celp_auth');
    return saved ? JSON.parse(saved) : { role: null };
  });

  useEffect(() => {
    localStorage.setItem('celp_auth', JSON.stringify(user));
  }, [user]);

  const handleLogin = (role: 'admin' | 'member', memberId?: string) => {
    setUser({ role, memberId });
  };

  const handleLogout = () => {
    setUser({ role: null });
  };

  if (!user.role) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return <AdminLayout onLogout={handleLogout} />;
  }

  if (user.role === 'member' && user.memberId) {
    return <MemberPortal memberId={user.memberId} onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

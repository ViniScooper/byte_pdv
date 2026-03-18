import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PDV from './pages/PDV';
import Despesas from './pages/Despesas';
import Cadastros from './pages/Cadastros';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import './index.css';

function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authToken, currentUser } = useApp();

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="mobile-logo">PDV Byte</div>
      </header>

      {sidebarOpen && (
        <div className="sidebar-overlay-mobile" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pdv" element={<PDV />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="/cadastros" element={<Cadastros />} />
          <Route path="/relatorios" element={<Relatorios />} />
          {currentUser?.role === 'ADMIN' && (
            <Route path="/usuarios" element={<GerenciarUsuarios />} />
          )}
          {/* Catch-all for private routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<Login />} />
          {/* Private Layout catches everything else */}
          <Route path="/*" element={<PrivateLayout />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

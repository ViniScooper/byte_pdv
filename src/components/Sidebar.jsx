import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingCart, TrendingDown,
    Package, BarChart3, Zap, X, Users, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/pdv', label: 'Ponto de Venda', icon: ShoppingCart },
    { to: '/despesas', label: 'Pagamentos/Saídas', icon: TrendingDown },
    { to: '/cadastros', label: 'Cadastros', icon: Package },
    { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
    const { turnoAtual, currentUser, logout } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        onClose();
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Zap size={20} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <h1>PDV Byte</h1>
                    <span>Sistema de Caixa</span>
                </div>
                <button className="sidebar-close-mobile" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            {/* Usuário logado */}
            {currentUser && (
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{currentUser.name}</div>
                    <div className="sidebar-user-role">
                        {currentUser.role === 'ADMIN' ? '🛡️ Administrador' : '💳 Caixa'}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-8" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className={`status-dot ${turnoAtual ? 'green' : 'red'}`} />
                <span className="text-sm" style={{ color: turnoAtual ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
                    Caixa {turnoAtual ? 'Aberto' : 'Fechado'}
                </span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">Menu Principal</div>
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onClose}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}

                {/* Admin-only: Gerenciar Usuários */}
                {currentUser?.role === 'ADMIN' && (
                    <>
                        <div className="nav-section-label" style={{ marginTop: '12px' }}>Administração</div>
                        <NavLink
                            to="/usuarios"
                            onClick={onClose}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        >
                            <Users size={18} />
                            Gerenciar Usuários
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sair
                </button>
                <div className="text-xs text-muted" style={{ marginTop: '8px' }}>PDV Byte v1.0</div>
                <div className="text-xs text-muted mt-8">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>
        </aside>
    );
}

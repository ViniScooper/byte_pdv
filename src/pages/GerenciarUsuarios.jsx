import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function GerenciarUsuarios() {
  const { authToken, currentUser } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form de novo usuário
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('CAIXA');

  const API = 'http://localhost:3001';

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/auth/users`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao criar usuário.');
        return;
      }

      setSuccess(`Usuário "${newName}" criado com sucesso!`);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('CAIXA');
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Tem certeza que deseja remover o usuário "${userName}"?`)) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao remover usuário.');
        return;
      }

      setSuccess(`Usuário "${userName}" removido.`);
      fetchUsers();
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>Acesso negado. Apenas administradores podem acessar esta página.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gerenciar Usuários</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={18} />
          {showForm ? 'Cancelar' : 'Novo Usuário'}
        </button>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}
      {success && <div className="alert alert-success"><ShieldCheck size={16} /> {success}</div>}

      {/* Formulário de criação */}
      {showForm && (
        <div className="card card-form">
          <h3>Criar Novo Usuário</h3>
          <form onSubmit={handleCreateUser} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email / Login</label>
                <input
                  type="text"
                  placeholder="email ou login"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Senha inicial"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Função</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="CAIXA">Caixa</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={16} /> Criar Usuário
            </button>
          </form>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="card">
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email / Login</th>
                <th>Função</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="table-loading">Carregando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="table-empty">Nenhum usuário encontrado.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : 'role-caixa'}`}>
                        {user.role === 'ADMIN' ? <Shield size={14} /> : null}
                        {user.role === 'ADMIN' ? 'Admin' : 'Caixa'}
                      </span>
                    </td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>
                      {currentUser?.id !== user.id && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

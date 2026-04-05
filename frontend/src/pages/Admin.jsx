// src/pages/Admin.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page, limit: 10, search: q } });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(1, search); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remover o usuário "${name}"?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover.');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}`, { active: !user.active });
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao atualizar.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-sm flex items-center justify-center">
            US
          </div>
          <span className="font-semibold text-slate-900">Painel Admin</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/dashboard" className="text-brand-600 text-sm font-medium hover:underline">Dashboard</Link>
          <button onClick={handleLogout} className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors">
            Sair
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-0.5">Usuários</h2>
            <p className="text-sm text-slate-500">{pagination.total} usuário(s) cadastrado(s)</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="input-field w-72"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors">
              Buscar
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <p className="text-center text-slate-400 py-12">Carregando...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-slate-400 py-12">Nenhum usuário encontrado.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Nome', 'E-mail', 'Função', 'Status', 'Cadastro', 'Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${
                          u.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {u.active ? '● Ativo' : '● Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deleting === u.id}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === u.id ? '...' : 'Remover'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchUsers(p)}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                  p === pagination.page
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

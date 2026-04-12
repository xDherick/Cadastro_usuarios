// src/pages/Admin.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// ─── Configuração de badges por ação ───────────────────────────────────────
const ACTION_CONFIG = {
  USER_CREATED:     { label: 'Criado',       bg: 'bg-green-100',  text: 'text-green-700'  },
  USER_UPDATED:     { label: 'Editado',      bg: 'bg-blue-100',   text: 'text-blue-700'   },
  USER_DELETED:     { label: 'Removido',     bg: 'bg-red-100',    text: 'text-red-600'    },
  USER_ACTIVATED:   { label: 'Ativado',      bg: 'bg-teal-100',   text: 'text-teal-700'   },
  USER_DEACTIVATED: { label: 'Desativado',   bg: 'bg-amber-100',  text: 'text-amber-700'  },
};

function ActionBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || { label: action, bg: 'bg-slate-100', text: 'text-slate-600' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Aba Usuários ───────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [deleting, setDeleting]     = useState(null);

  const fetchUsers = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page, limit: 10, search: q } });
      setUsers(data.users);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(1, search); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remover "${name}"?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover.');
    } finally { setDeleting(null); }
  };

  const toggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}`, { active: !user.active });
      fetchUsers(pagination.page);
    } catch (err) { alert(err.response?.data?.message || 'Erro.'); }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <p className="text-sm text-slate-500">{pagination.total} usuário(s)</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="input-field w-72" />
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors">
            Buscar
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? <p className="text-center text-slate-400 py-12">Carregando...</p> :
         users.length === 0 ? <p className="text-center text-slate-400 py-12">Nenhum usuário encontrado.</p> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Nome', 'E-mail', 'Função', 'Status', 'Cadastro', 'Ações'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
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
                    <button onClick={() => toggleActive(u)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${u.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                      {u.active ? '● Ativo' : '● Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(u.id, u.name)} disabled={deleting === u.id}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50">
                      {deleting === u.id ? '...' : 'Remover'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchUsers(p)}
              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${p === pagination.page ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Aba Auditoria ──────────────────────────────────────────────────────────
function AuditTab() {
  const [logs, setLogs]             = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading]       = useState(true);

  const fetchLogs = useCallback(async (page = 1, action = actionFilter) => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit', { params: { page, limit: 20, action } });
      setLogs(data.logs);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [actionFilter]);

  useEffect(() => { fetchLogs(1); }, []);

  const handleFilterChange = (e) => {
    setActionFilter(e.target.value);
    fetchLogs(1, e.target.value);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <p className="text-sm text-slate-500">{pagination.total} registro(s)</p>
        <select value={actionFilter} onChange={handleFilterChange}
          className="input-field w-52">
          <option value="">Todas as ações</option>
          {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <p className="text-center text-slate-400 py-12">Carregando...</p> :
         logs.length === 0 ? <p className="text-center text-slate-400 py-12">Nenhum registro encontrado.</p> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Quando', 'Ação', 'Executado por', 'Afetou', 'Detalhes'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800">{log.actorName}</p>
                    <p className="text-xs text-slate-400">{log.actorEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    {log.targetName ? (
                      <>
                        <p className="text-sm font-medium text-slate-800">{log.targetName}</p>
                        <p className="text-xs text-slate-400">{log.targetEmail}</p>
                      </>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {log.details?.changedFields?.length > 0
                      ? `Campos: ${log.details.changedFields.join(', ')}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchLogs(p)}
              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${p === pagination.page ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Página Admin principal ─────────────────────────────────────────────────
export default function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
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
        <h2 className="text-xl font-bold text-slate-900 mb-6">Administração</h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 w-fit shadow-sm border border-slate-100">
          {[
            { id: 'users', label: '👥 Usuários' },
            { id: 'audit', label: '📋 Auditoria' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' ? <UsersTab /> : <AuditTab />}
      </main>
    </div>
  );
}

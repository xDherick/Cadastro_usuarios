// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function Dashboard() {
  const { user, logout, logoutAll, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api.get('/profile').then(({ data }) => setProfile(data.user)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Isso vai encerrar sua sessão em todos os dispositivos. Continuar?')) return;
    setLoggingOut(true);
    await logoutAll();
    navigate('/login');
  };

  const avatarSrc = profile?.avatar ? `${API_BASE}/uploads/avatars/${profile.avatar}` : null;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-base">
          US
        </div>
        <nav className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="text-brand-600 font-medium text-sm hover:underline">Painel Admin</Link>
          )}
          <Link to="/profile" className="text-slate-600 font-medium text-sm hover:underline">Meu Perfil</Link>
          <button onClick={handleLogoutAll} disabled={loggingOut}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-400 text-xs font-medium hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50">
            Sair de todos
          </button>
          <button onClick={handleLogout} disabled={loggingOut}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
            {loggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Welcome card */}
        <div className="card p-7 flex flex-wrap items-center gap-5 mb-6">
          <Link to="/profile" className="flex-shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 hover:opacity-90 transition-opacity" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-xl flex items-center justify-center hover:opacity-90 transition-opacity">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 mb-0.5">Olá, {user.name.split(' ')[0]}! 👋</h1>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ml-auto ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
            {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon="🪪" title="Seu ID" value={user.id.slice(0, 8) + '...'} />
          <InfoCard icon="🔑" title="Função" value={user.role} />
          <InfoCard icon="✅" title="Status" value="Ativo" />
          {isAdmin && (
            <button onClick={() => navigate('/admin')}
              className="card p-5 flex items-center gap-4 bg-gradient-to-br from-brand-600 to-brand-700 text-left hover:opacity-90 transition-opacity cursor-pointer border-0 w-full">
              <span className="text-3xl">👥</span>
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wide font-medium mb-0.5">Admin</p>
                <p className="text-white font-semibold text-sm">Gerenciar usuários →</p>
              </div>
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          🔒 Sua sessão é renovada automaticamente por até <strong>7 dias</strong>. Use <em>"Sair de todos"</em> para encerrar em todos os dispositivos.
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">{title}</p>
        <p className="text-slate-900 font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}

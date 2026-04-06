import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Feedback
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile');
        setProfile(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch {
        setApiError('Erro ao carregar perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Imagem deve ter no máximo 2MB.' }));
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, avatar: '' }));
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remover foto de perfil?')) return;
    try {
      await api.delete('/profile/avatar');
      setProfile((prev) => ({ ...prev, avatar: null }));
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess('Avatar removido.');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao remover avatar.');
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim() || name.length < 2) e.name = 'Nome deve ter ao menos 2 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido.';
    if (newPassword && newPassword.length < 8) e.newPassword = 'Nova senha deve ter ao menos 8 caracteres.';
    if (newPassword && newPassword !== confirmPassword) e.confirmPassword = 'As senhas não coincidem.';
    if (newPassword && !currentPassword) e.currentPassword = 'Informe a senha atual.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setErrors({});

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (currentPassword) formData.append('currentPassword', currentPassword);
      if (newPassword) formData.append('newPassword', newPassword);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await api.patch('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(data.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarSrc = avatarPreview
    || (profile?.avatar ? `${API_BASE}/uploads/avatars/${profile.avatar}` : null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-base flex items-center justify-center">
            US
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/dashboard" className="text-brand-600 text-sm font-medium hover:underline">Dashboard</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-brand-600 text-sm font-medium hover:underline">Admin</Link>
          )}
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors">
            Sair
          </button>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Meu Perfil</h1>

        {/* Feedback */}
        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            ✅ {success}
          </div>
        )}
        {apiError && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Avatar */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Foto de perfil</h2>
            <div className="flex items-center gap-5">
              {/* Preview */}
              <div className="relative flex-shrink-0">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-2xl flex items-center justify-center">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {avatarSrc ? 'Trocar foto' : 'Escolher foto'}
                </button>
                {(profile?.avatar || avatarPreview) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Remover foto
                  </button>
                )}
                <p className="text-xs text-slate-400">JPEG, PNG ou WebP · máx. 2MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            {errors.avatar && <p className="mt-2 text-xs text-red-500">{errors.avatar}</p>}
          </div>

          {/* Dados pessoais */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Dados pessoais</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Nome completo</label>
                <input
                  type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  className={`input-field ${errors.name ? 'input-error' : ''}`}
                  placeholder="Seu nome"
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">E-mail</label>
                <input
                  type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="seu@email.com"
                />
                {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* Senha */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">Alterar senha</h2>
            <p className="text-xs text-slate-400 mb-4">Deixe em branco para manter a senha atual.</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Senha atual</label>
                <input
                  type="password" value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => ({ ...p, currentPassword: '' })); }}
                  className={`input-field ${errors.currentPassword ? 'input-error' : ''}`}
                  placeholder="Digite a senha atual"
                  autoComplete="current-password"
                />
                {errors.currentPassword && <span className="text-xs text-red-500">{errors.currentPassword}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Nova senha</label>
                <input
                  type="password" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
                  className={`input-field ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                {errors.newPassword && <span className="text-xs text-red-500">{errors.newPassword}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Confirmar nova senha</label>
                <input
                  type="password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </main>
    </div>
  );
}
